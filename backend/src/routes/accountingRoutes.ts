import express from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  createAccount,
  getAccounts,
  createVoucher,
  getVouchers,
  getTrialBalance,
  getAccountStatement,
  getProjectBudgets,
} from '../controllers/accountingController';

const router = express.Router();

router.use(protect);
router.use(authorize('SUPER_ADMIN', 'DEPT_ADMIN', 'CE', 'EE', 'ACCOUNTANT'));

// Ledger Accounts
router.route('/accounts')
  .get(getAccounts)
  .post(createAccount);

router.get('/accounts/:accountId/statement', getAccountStatement);

// Vouchers
router.route('/vouchers')
  .get(getVouchers)
  .post(createVoucher);

// Reports
router.get('/reports/trial-balance', getTrialBalance);
router.get('/reports/project-budgets', getProjectBudgets);

export default router;
