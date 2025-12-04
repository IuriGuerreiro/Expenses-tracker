import { Request, Response, NextFunction } from 'express';
import {
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeTransactions,
} from '../services/transactionService';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { amount, sourceDescription, transactionDate } = req.body;

    const amountCents = Math.round(parseFloat(amount) * 100);

    const result = await createIncome({
      userId,
      accountId: '', // No longer needed - income is allocated across all accounts
      amountCents,
      sourceDescription,
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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await getIncomeTransactions(userId, page, limit);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { accountId, amount, sourceDescription, transactionDate } = req.body;

    const updates: any = {};
    if (accountId) updates.accountId = accountId;
    if (amount) updates.amountCents = Math.round(parseFloat(amount) * 100);
    if (sourceDescription) updates.sourceDescription = sourceDescription;
    if (transactionDate) updates.transactionDate = new Date(transactionDate);

    const result = await updateIncome(userId, id, updates);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const result = await deleteIncome(userId, id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
