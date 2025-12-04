import { Request, Response, NextFunction } from 'express';
import {
  createExpense,
  updateExpense,
  deleteExpense,
  getTransactions,
} from '../services/transactionService';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { accountId, expenseCategoryId, amount, description, transactionDate } = req.body;

    const amountCents = Math.round(parseFloat(amount) * 100);

    const result = await createExpense({
      userId,
      accountId,
      expenseCategoryId, // New field
      amountCents,
      description,
      transactionDate: new Date(transactionDate),
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const filters: any = {
      userId,
      type: 'EXPENSE',
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };

    // Update query parameters
    if (req.query.accountId) filters.accountId = req.query.accountId as string;
    if (req.query.expenseCategoryId) filters.expenseCategoryId = req.query.expenseCategoryId as string;
    if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);
    if (req.query.search) filters.search = req.query.search as string;

    const result = await getTransactions(filters);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { accountId, expenseCategoryId, amount, description, transactionDate } = req.body;

    const updates: any = {};
    if (accountId) updates.accountId = accountId; // New field
    if (expenseCategoryId) updates.expenseCategoryId = expenseCategoryId; // New field
    if (amount) updates.amountCents = Math.round(parseFloat(amount) * 100);
    if (description) updates.description = description;
    if (transactionDate) updates.transactionDate = new Date(transactionDate);

    const result = await updateExpense(userId, id, updates);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const result = await deleteExpense(userId, id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}