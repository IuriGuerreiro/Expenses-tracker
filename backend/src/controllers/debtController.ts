import { Request, Response, NextFunction } from 'express';
import {
  createDebt,
  getDebts,
  updateDebt,
  deleteDebt,
  markDebtAsPaid,
} from '../services/debtService';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { personName, amount, description, type, categoryId, dueDate } = req.body;

    const amountCents = Math.round(parseFloat(amount) * 100);

    const result = await createDebt({
      userId,
      personName,
      amountCents,
      description,
      type,
      categoryId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const filters: any = {};

    if (req.query.type) filters.type = req.query.type;
    if (req.query.isPaid) filters.isPaid = req.query.isPaid === 'true';

    const result = await getDebts(userId, filters);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { personName, amount, description, type, isPaid, dueDate } = req.body;

    const updates: any = {};
    if (personName !== undefined) updates.personName = personName;
    if (amount !== undefined) updates.amountCents = Math.round(parseFloat(amount) * 100);
    if (description !== undefined) updates.description = description;
    if (type !== undefined) updates.type = type;
    if (isPaid !== undefined) updates.isPaid = isPaid;
    if (dueDate !== undefined) updates.dueDate = dueDate ? new Date(dueDate) : null;

    const result = await updateDebt({ userId, debtId: id, ...updates });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function markPaid(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const result = await markDebtAsPaid(userId, id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const result = await deleteDebt(userId, id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
