import { Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import Approval, { ApprovalEntity } from '../models/Approval';
import Project from '../models/Project';
import Tender from '../models/Tender';
import MeasurementBook from '../models/MeasurementBook';
import Bill from '../models/Bill';
import Voucher from '../models/Voucher';
import Account from '../models/Account';
import { AuthRequest } from '../middleware/auth';

const ROLE_TO_STAGE: Record<string, string[]> = {
  JE: ['JE'],
  SDO: ['SDO'],
  EE: ['EE'],
  CE: ['CE'],
  ACCOUNTANT: ['ACCOUNTANT'],
  DEPT_ADMIN: ['SDO', 'EE', 'CE', 'ACCOUNTANT', 'DEPT_ADMIN'],
  SUPER_ADMIN: ['JE', 'SDO', 'EE', 'CE', 'ACCOUNTANT', 'DEPT_ADMIN'],
};

// List pending approvals for the logged-in user's role
export const myPendingApprovals = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stages = ROLE_TO_STAGE[req.user!.role] || [];
  if (!stages.length) return res.json({ success: true, data: [] });

  const baseQ: any = { stage: { $in: stages }, status: 'PENDING' };
  if (req.user!.role !== 'SUPER_ADMIN' && req.user!.department) {
    baseQ.department = req.user!.department;
  }
  const all = await Approval.find(baseQ)
    .sort({ createdAt: -1 })
    .lean();

  // For each approval, only include if all earlier-order approvals (same entity) are APPROVED
  const ready: any[] = [];
  for (const ap of all) {
    const earlier = await Approval.find({
      entityType: ap.entityType,
      entityId: ap.entityId,
      order: { $lt: ap.order },
    }).lean();
    const allEarlierApproved = earlier.every((e) => e.status === 'APPROVED');
    if (allEarlierApproved) {
      // Hydrate entity preview
      let entity: any = null;
      if (ap.entityType === 'PROJECT') entity = await Project.findById(ap.entityId).lean();
      if (ap.entityType === 'TENDER') entity = await Tender.findById(ap.entityId).lean();
      if (ap.entityType === 'MB') entity = await MeasurementBook.findById(ap.entityId).populate('project').lean();
      if (ap.entityType === 'BILL') entity = await Bill.findById(ap.entityId).populate('project').populate('contractor', 'name companyName').lean();
      ready.push({ ...ap, entity });
    }
  }

  res.json({ success: true, count: ready.length, data: ready });
});

// Approve / Reject
export const actOnApproval = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { action, remarks } = req.body; // 'APPROVE' | 'REJECT' | 'RETURN'
  const approval = await Approval.findById(req.params.id);
  if (!approval) { res.status(404); throw new Error('Approval not found'); }
  if (approval.status !== 'PENDING') {
    res.status(400);
    throw new Error('Already processed');
  }

  // Permission: only role that matches stage can act
  const stages = ROLE_TO_STAGE[req.user!.role] || [];
  if (!stages.includes(approval.stage) && req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'DEPT_ADMIN') {
    res.status(403);
    throw new Error('Not permitted to act on this approval');
  }

  approval.approver = req.user!._id;
  approval.approverName = req.user!.name;
  approval.approverRole = req.user!.role;
  approval.remarks = remarks;

  if (action === 'APPROVE') {
    approval.status = 'APPROVED';
    approval.approvedAt = new Date();
    await approval.save();

    // If all approvals approved → update entity status
    const allApprovals = await Approval.find({
      entityType: approval.entityType, entityId: approval.entityId,
    });
    const allDone = allApprovals.every((a) => a.status === 'APPROVED');
    if (allDone) {
      await onAllApproved(approval.entityType, approval.entityId.toString());
    }
  } else if (action === 'REJECT') {
    approval.status = 'REJECTED';
    approval.rejectedAt = new Date();
    await approval.save();
    await onRejected(approval.entityType, approval.entityId.toString());
  } else if (action === 'RETURN') {
    approval.status = 'RETURNED';
    await approval.save();
  }

  res.json({ success: true, data: approval });
});

async function onAllApproved(entityType: string, entityId: string) {
  if (entityType === 'PROJECT') {
    await Project.findByIdAndUpdate(entityId, {
      status: 'SANCTIONED',
      sanctionedAt: new Date(),
    });
  } else if (entityType === 'TENDER') {
    await Tender.findByIdAndUpdate(entityId, { status: 'PUBLISHED', publishDate: new Date() });
    const t = await Tender.findById(entityId);
    if (t) await Project.findByIdAndUpdate(t.project, { status: 'TENDER_PUBLISHED' });
  } else if (entityType === 'MB') {
    await MeasurementBook.findByIdAndUpdate(entityId, { status: 'EE_APPROVED', approvedAt: new Date() });
  } else if (entityType === 'BILL') {
    const bill = await Bill.findById(entityId);
    if (bill) {
      // 1. Find Project Expense Account & Contractor Account (For simplicity, auto-create if not exists or assume setup)
      // We will look up Accounts by referenceId or type.
      let projectExpenseAcc = await Account.findOne({ referenceId: bill.project, type: 'EXPENSE' });
      if (!projectExpenseAcc) {
        const proj = await Project.findById(bill.project);
        projectExpenseAcc = await Account.create({
          accountNumber: `EXP-PROJ-${bill.project.toString().slice(-6)}`,
          name: `Project Expense: ${proj?.name || bill.project}`,
          type: 'EXPENSE',
          subType: 'Direct Expenses',
          department: bill.department,
          referenceId: bill.project,
          isActive: true
        });
      }

      let contractorAcc = await Account.findOne({ referenceId: bill.contractor, type: 'LIABILITY' });
      if (!contractorAcc) {
        contractorAcc = await Account.create({
          accountNumber: `CRED-${bill.contractor.toString().slice(-6)}`,
          name: `Contractor Payable`,
          type: 'LIABILITY',
          subType: 'Sundry Creditors',
          department: bill.department,
          referenceId: bill.contractor,
          isActive: true
        });
      }

      // Default Tax/Retention Accounts
      let gstAcc = await Account.findOne({ department: bill.department, subType: 'Duties & Taxes', name: /GST/i });
      if (!gstAcc) gstAcc = await Account.create({ accountNumber: `GST-${Date.now()}`, name: 'GST Payable', type: 'LIABILITY', subType: 'Duties & Taxes', department: bill.department });

      let tdsAcc = await Account.findOne({ department: bill.department, subType: 'Duties & Taxes', name: /TDS/i });
      if (!tdsAcc) tdsAcc = await Account.create({ accountNumber: `TDS-${Date.now()}`, name: 'TDS Payable', type: 'LIABILITY', subType: 'Duties & Taxes', department: bill.department });
      
      let secAcc = await Account.findOne({ department: bill.department, subType: 'Current Liabilities', name: /Security/i });
      if (!secAcc) secAcc = await Account.create({ accountNumber: `SEC-${Date.now()}`, name: 'Security Deposits', type: 'LIABILITY', subType: 'Current Liabilities', department: bill.department });

      let retAcc = await Account.findOne({ department: bill.department, subType: 'Current Liabilities', name: /Retention/i });
      if (!retAcc) retAcc = await Account.create({ accountNumber: `RET-${Date.now()}`, name: 'Retention Money', type: 'LIABILITY', subType: 'Current Liabilities', department: bill.department });

      const entries = [];
      // Debit Project Expense (Gross Amount)
      entries.push({ account: projectExpenseAcc._id, dr: bill.currentBillAmount, cr: 0, narration: `Bill Approved: ${bill.billNumber}` });
      
      // Credit Deductions & Contractor
      if (bill.gstAmount > 0) entries.push({ account: gstAcc._id, dr: 0, cr: bill.gstAmount, narration: 'GST Deduction' });
      if (bill.tdsAmount > 0) entries.push({ account: tdsAcc._id, dr: 0, cr: bill.tdsAmount, narration: 'TDS Deduction' });
      if (bill.securityAmount > 0) entries.push({ account: secAcc._id, dr: 0, cr: bill.securityAmount, narration: 'Security Deposit' });
      if (bill.retentionAmount > 0) entries.push({ account: retAcc._id, dr: 0, cr: bill.retentionAmount, narration: 'Retention Money' });
      entries.push({ account: contractorAcc._id, dr: 0, cr: bill.netPayable, narration: `Net Payable for ${bill.billNumber}` });

      const voucher = await Voucher.create({
        voucherNumber: `JV-${Date.now()}`,
        date: new Date(),
        type: 'JOURNAL',
        department: bill.department,
        project: bill.project,
        bill: bill._id,
        entries,
        narration: `Automatic JV for Bill ${bill.billNumber}`,
        status: 'POSTED',
        // Assuming system generated, using a dummy or first super admin. For now we will just use contractor ID as createdBy to bypass requirement or fetch admin
        createdBy: bill.contractor, 
      });

      // Update balances
      for (const entry of entries) {
        const acc = await Account.findById(entry.account);
        if (acc) {
          let balanceChange = 0;
          if (acc.type === 'ASSET' || acc.type === 'EXPENSE') balanceChange = (entry.dr || 0) - (entry.cr || 0);
          else balanceChange = (entry.cr || 0) - (entry.dr || 0);
          acc.currentBalance += balanceChange;
          await acc.save();
        }
      }

      // Update Project utilized budget
      await Project.findByIdAndUpdate(bill.project, {
        $inc: { 'budget.utilized': bill.currentBillAmount }
      });
    }
    await Bill.findByIdAndUpdate(entityId, { status: 'TREASURY_PENDING' });
  }
}

async function onRejected(entityType: string, entityId: string) {
  if (entityType === 'PROJECT')
    await Project.findByIdAndUpdate(entityId, { status: 'REJECTED' });
  else if (entityType === 'TENDER')
    await Tender.findByIdAndUpdate(entityId, { status: 'CANCELLED' });
  else if (entityType === 'MB')
    await MeasurementBook.findByIdAndUpdate(entityId, { status: 'REJECTED' });
  else if (entityType === 'BILL')
    await Bill.findByIdAndUpdate(entityId, { status: 'REJECTED' });
}

// Get approvals for a specific entity (project/tender/bill/etc.)
export const getApprovalsForEntity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { entityType, entityId } = req.params;
  const items = await Approval.find({
    entityType: entityType.toUpperCase() as ApprovalEntity, entityId,
  })
    .sort({ order: 1 })
    .populate('approver', 'name role designation');
  res.json({ success: true, data: items });
});
