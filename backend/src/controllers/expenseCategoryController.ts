import { Request, Response, NextFunction } from 'express';
import {
  createExpenseCategory,
  getExpenseCategories,
  updateExpenseCategory,
  deleteExpenseCategory,
} from '../services/expenseCategoryService';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { name } = req.body;

    const category = await createExpenseCategory({
      userId,
      name,
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
}

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const expenseCategories = await getExpenseCategories(userId);
    res.status(200).json({ success: true, data: { expenseCategories } });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { name } = req.body;

    const category = await updateExpenseCategory({
      userId,
      expenseCategoryId: id,
      name,
    });

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const result = await deleteExpenseCategory(userId, id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
