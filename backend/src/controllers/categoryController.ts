import { Request, Response, NextFunction } from 'express';
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from '../services/categoryService';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { name, allocationPercentage, isDefault, reduceFromCategoryId } = req.body;

    const category = await createCategory({
      userId,
      name,
      allocationPercentage: parseInt(allocationPercentage),
      isDefault,
      reduceFromCategoryId,
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
}

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const data = await getCategories(userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { name, allocationPercentage, isDefault } = req.body;

    const category = await updateCategory({
      userId,
      categoryId: id,
      name,
      allocationPercentage:
        allocationPercentage !== undefined
          ? parseInt(allocationPercentage)
          : undefined,
      isDefault,
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

    const result = await deleteCategory(userId, id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
