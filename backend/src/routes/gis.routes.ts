import express from 'express';
import { protect, authorize } from '../middleware/auth';
import { getGISProjects } from '../controllers/gis.controller';

const router = express.Router();

router.use(protect);
// Accessible by roles that typically monitor operations and governance
router.use(authorize('SUPER_ADMIN', 'DEPT_ADMIN', 'CE', 'EE', 'SDO'));

router.get('/projects', getGISProjects);

export default router;
