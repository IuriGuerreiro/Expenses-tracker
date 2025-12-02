import { Request, Response, NextFunction } from 'express';
import {
  getSpendingByCategory,
  getSpendingOverTime,
  getIncomeVsExpenses,
} from '../services/visualizationService';
import { getTransactions } from '../services/transactionService';

export async function spendingByCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : undefined;
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : undefined;

    const data = await getSpendingByCategory(userId, startDate, endDate);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function spendingOverTime(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : undefined;
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : undefined;
    const groupBy = (req.query.groupBy as 'day' | 'week' | 'month') || 'day';

    const data = await getSpendingOverTime(userId, startDate, endDate, groupBy);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function incomeVsExpenses(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : undefined;
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : undefined;
    const groupBy = (req.query.groupBy as 'week' | 'month') || 'month';

    const data = await getIncomeVsExpenses(userId, startDate, endDate, groupBy);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function allTransactions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const filters: any = {
      userId,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50,
    };

    if (req.query.type) filters.type = req.query.type as 'INCOME' | 'EXPENSE';
    if (req.query.categoryId) filters.categoryId = req.query.categoryId as string;
    if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);
    if (req.query.search) filters.search = req.query.search as string;
    if (req.query.sortBy) filters.sortBy = req.query.sortBy as string;
    if (req.query.sortOrder) filters.sortOrder = req.query.sortOrder as 'asc' | 'desc';

    const data = await getTransactions(filters);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
