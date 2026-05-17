import { Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import Payment from '../models/Payment';
import Bill from '../models/Bill';
import { AuthRequest } from '../middleware/auth';
import { generatePaymentId } from '../utils/generateId';
import Voucher from '../models/Voucher';
import Account from '../models/Account';

// Stage 11: Treasury releases payment
export const releasePayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { billId, paymentMode = 'RTGS', utrNumber, bankName, accountNumber, ifsc, remarks } = req.body;

  const bill = await Bill.findById(billId);
  if (!bill) { res.status(404); throw new Error('Bill not found'); }
  if (!['ACCOUNTS_VERIFIED', 'TREASURY_PENDING'].includes(bill.status)) {
    res.status(400); throw new Error('Bill is not ready for payment');
  }

  const pay = await Payment.create({
    paymentId: generatePaymentId(),
    department: bill.department,
    bill: bill._id,
    project: bill.project,
    contractor: bill.contractor,
    amount: bill.netPayable,
    paymentMode,
    utrNumber,
    bankName,
    accountNumber: accountNumber ? `XXXX${String(accountNumber).slice(-4)}` : undefined,
    ifsc,
    paymentDate: new Date(),
    status: 'RELEASED',
    releasedBy: req.user!._id,
    remarks,
  });

  bill.status = 'PAID';
  bill.payment = pay._id;
  await bill.save();

  // Create Accounting Voucher for Payment
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

  let bankAcc = await Account.findOne({ department: bill.department, subType: 'Bank Accounts' });
  if (!bankAcc) {
    bankAcc = await Account.create({
      accountNumber: `BANK-${Date.now()}`,
      name: `Main Bank Account`,
      type: 'ASSET',
      subType: 'Bank Accounts',
      department: bill.department,
      isActive: true
    });
  }

  const entries = [
    { account: contractorAcc._id, dr: bill.netPayable, cr: 0, narration: `Payment Released: ${pay.paymentId}` },
    { account: bankAcc._id, dr: 0, cr: bill.netPayable, narration: `Payment to Contractor: ${pay.paymentId}` }
  ];

  const voucher = await Voucher.create({
    voucherNumber: `PV-${Date.now()}`,
    date: new Date(),
    type: 'PAYMENT',
    department: bill.department,
    project: bill.project,
    bill: bill._id,
    entries,
    narration: `Automatic PV for Payment ${pay.paymentId}`,
    status: 'POSTED',
    createdBy: req.user!._id,
  });

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

  res.status(201).json({ success: true, data: pay });
});

export const listPayments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const q: any = {};
  if (req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'CONTRACTOR') {
    q.department = req.user!.department;
  }
  if (req.user!.role === 'CONTRACTOR') q.contractor = req.user!._id;
  const items = await Payment.find(q)
    .populate('bill', 'billNumber netPayable')
    .populate('project', 'name')
    .populate('contractor', 'name companyName')
    .sort({ paymentDate: -1 });
  res.json({ success: true, count: items.length, data: items });
});

export const getPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const p = await Payment.findById(req.params.id)
    .populate('bill')
    .populate('project', 'name location')
    .populate('contractor', 'name companyName email');
  if (!p) { res.status(404); throw new Error('Payment not found'); }
  res.json({ success: true, data: p });
});
