import { Router } from 'express';
import {
  getRecommendedTenders,
  interactTender,
  getTenderDashboardStats
} from '../controllers/intelligence.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();
router.use(protect);

router.get('/tenders/recommended', authorize('CONTRACTOR'), getRecommendedTenders);
router.post('/tenders/:tenderId/interaction', interactTender);
router.get('/tenders/dashboard', getTenderDashboardStats);

export default router;
