import { Request, Response, NextFunction } from 'express';
import { getDashboardData } from '../services/dashboardService';

export async function getDashboard(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const data = await getDashboardData(userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
