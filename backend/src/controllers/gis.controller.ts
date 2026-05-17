import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import Project from '../models/Project';
import { AuthRequest } from '../middleware/auth';

export const getGISProjects = asyncHandler(async (req: AuthRequest, res: Response) => {
  const query: any = {};
  
  // Restrict by department unless SUPER_ADMIN
  if (req.user?.role !== 'SUPER_ADMIN' && req.user?.department) {
    query.department = req.user.department;
  }

  // Fetch projects with coordinates
  // Even if some don't have coordinates, we'll filter them on the frontend or handle them gracefully
  const projects = await Project.find(query)
    .select('_id name projectId status coordinates estimatedCost awardedAmount overallProgress budget actualEndDate endDate location district')
    .lean();

  res.status(200).json({ success: true, count: projects.length, data: projects });
});
