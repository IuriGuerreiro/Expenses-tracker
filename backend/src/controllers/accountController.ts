import { Request, Response, NextFunction } from 'express';
import {
  createAccount,
  getAccounts,
  updateAccount,
  deleteAccount,
} from '../services/accountService';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { name, allocationPercentage, isDefault, reduceFromAccountId } = req.body;

    const account = await createAccount({
      userId,
      name,
      allocationPercentage: parseInt(allocationPercentage),
      isDefault,
      reduceFromAccountId,
    });

    res.status(201).json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
}

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const data = await getAccounts(userId);
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

    const account = await updateAccount({
      userId,
      accountId: id,
      name,
      allocationPercentage:
        allocationPercentage !== undefined
          ? parseInt(allocationPercentage)
          : undefined,
      isDefault,
    });

    res.status(200).json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const result = await deleteAccount(userId, id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
