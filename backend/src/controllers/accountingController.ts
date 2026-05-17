import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Account from '../models/Account';
import Voucher from '../models/Voucher';
import Project from '../models/Project';
import mongoose from 'mongoose';

// --- Ledger Management ---

export const createAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, type, subType, referenceId, openingBalance, description } = req.body;
    const department = req.user?.department;

    if (!department) {
      res.status(403).json({ success: false, message: 'Department required' });
      return;
    }

    const accountNumber = `ACC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const account = new Account({
      accountNumber,
      name,
      type,
      subType,
      department,
      referenceId,
      openingBalance: openingBalance || 0,
      currentBalance: openingBalance || 0,
      description,
    });

    await account.save();
    res.status(201).json({ success: true, data: account });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAccounts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const department = req.user?.department;
    const { type, subType, referenceId } = req.query;

    const query: any = { department };
    if (type) query.type = type;
    if (subType) query.subType = subType;
    if (referenceId) query.referenceId = referenceId;

    const accounts = await Account.find(query).sort({ name: 1 });
    res.status(200).json({ success: true, data: accounts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Voucher Management ---

export const createVoucher = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, date, project, bill, entries, narration } = req.body;
    const department = req.user?.department;

    if (!department) {
      res.status(403).json({ success: false, message: 'Department required' });
      return;
    }

    // Validate double entry
    let totalDr = 0;
    let totalCr = 0;
    entries.forEach((e: any) => {
      totalDr += Number(e.dr) || 0;
      totalCr += Number(e.cr) || 0;
    });

    if (Math.abs(totalDr - totalCr) > 0.01) {
      res.status(400).json({ success: false, message: 'Total Debit must equal Total Credit' });
      return;
    }

    const voucherNumber = `VCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const voucher = new Voucher({
        voucherNumber,
        date: date || Date.now(),
        type,
        department,
        project,
        bill,
        entries,
        narration,
        status: 'POSTED',
        createdBy: req.user?._id,
      });

      await voucher.save({ session });

      // Update Account Balances
      for (const entry of entries) {
        const account = await Account.findById(entry.account).session(session);
        if (account) {
          // Adjust balance based on account type
          // ASSET/EXPENSE: Dr increases, Cr decreases
          // LIABILITY/EQUITY/REVENUE: Cr increases, Dr decreases
          let balanceChange = 0;
          if (account.type === 'ASSET' || account.type === 'EXPENSE') {
            balanceChange = (entry.dr || 0) - (entry.cr || 0);
          } else {
            balanceChange = (entry.cr || 0) - (entry.dr || 0);
          }
          account.currentBalance += balanceChange;
          await account.save({ session });
        }
      }

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({ success: true, data: voucher });
    } catch (err: any) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVouchers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const department = req.user?.department;
    const { project, type } = req.query;

    const query: any = { department };
    if (project) query.project = project;
    if (type) query.type = type;

    const vouchers = await Voucher.find(query)
      .populate('entries.account', 'name type')
      .populate('project', 'name projectId')
      .populate('createdBy', 'name')
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({ success: true, data: vouchers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Reports ---

export const getTrialBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const department = req.user?.department;

    const accounts = await Account.find({ department });
    let totalDebit = 0;
    let totalCredit = 0;

    const report = accounts.map(acc => {
      let dr = 0;
      let cr = 0;
      if (acc.currentBalance > 0) {
        if (acc.type === 'ASSET' || acc.type === 'EXPENSE') dr = acc.currentBalance;
        else cr = acc.currentBalance;
      } else if (acc.currentBalance < 0) {
        if (acc.type === 'ASSET' || acc.type === 'EXPENSE') cr = Math.abs(acc.currentBalance);
        else dr = Math.abs(acc.currentBalance);
      }

      totalDebit += dr;
      totalCredit += cr;

      return {
        _id: acc._id,
        name: acc.name,
        type: acc.type,
        subType: acc.subType,
        dr,
        cr,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        accounts: report,
        totalDebit,
        totalCredit,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAccountStatement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const department = req.user?.department;
    const { accountId } = req.params;

    const account = await Account.findOne({ _id: accountId, department });
    if (!account) {
      res.status(404).json({ success: false, message: 'Account not found' });
      return;
    }

    const vouchers = await Voucher.find({
      department,
      'entries.account': accountId,
      status: 'POSTED',
    })
      .sort({ date: 1 })
      .populate('project', 'name')
      .populate('bill', 'billNumber');

    let runningBalance = account.openingBalance;
    const statement = vouchers.map(v => {
      const entry = v.entries.find(e => e.account.toString() === accountId);
      if (!entry) return null;

      let balanceChange = 0;
      if (account.type === 'ASSET' || account.type === 'EXPENSE') {
        balanceChange = (entry.dr || 0) - (entry.cr || 0);
      } else {
        balanceChange = (entry.cr || 0) - (entry.dr || 0);
      }
      runningBalance += balanceChange;

      return {
        date: v.date,
        voucherNumber: v.voucherNumber,
        type: v.type,
        narration: v.narration || entry.narration,
        project: (v.project as any)?.name,
        dr: entry.dr || 0,
        cr: entry.cr || 0,
        balance: runningBalance,
      };
    }).filter(Boolean);

    res.status(200).json({
      success: true,
      data: {
        account: {
          name: account.name,
          type: account.type,
          currentBalance: account.currentBalance,
        },
        statement,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjectBudgets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const department = req.user?.department;
    const projects = await Project.find({ department })
      .select('projectId name budget status estimatedCost awardedAmount')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: projects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
