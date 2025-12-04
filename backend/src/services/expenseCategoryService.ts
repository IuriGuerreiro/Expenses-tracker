import prisma from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';

export interface CreateExpenseCategoryInput {
  userId: string;
  name: string;
}

export interface UpdateExpenseCategoryInput {
  userId: string;
  expenseCategoryId: string;
  name?: string;
}

/**
 * Create a new expense category
 */
export async function createExpenseCategory(
  input: CreateExpenseCategoryInput
) {
  const { userId, name } = input;

  // Check for duplicate names
  const existing = await prisma.expenseCategory.findFirst({
    where: { userId, name },
  });

  if (existing) {
    throw new ConflictError(`Expense category '${name}' already exists`);
  }

  return prisma.expenseCategory.create({
    data: {
      userId,
      name,
    },
  });
}

/**
 * Get all expense categories for a user
 */
export async function getExpenseCategories(userId: string) {
  return prisma.expenseCategory.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  });
}

/**
 * Update an expense category
 */
export async function updateExpenseCategory(
  input: UpdateExpenseCategoryInput
) {
  const { userId, expenseCategoryId, name } = input;

  const existingCategory = await prisma.expenseCategory.findFirst({
    where: { id: expenseCategoryId, userId },
  });

  if (!existingCategory) {
    throw new NotFoundError('Expense category not found');
  }

  if (name && name !== existingCategory.name) {
    const duplicate = await prisma.expenseCategory.findFirst({
      where: { userId, name },
    });
    if (duplicate) {
      throw new ConflictError(`Expense category '${name}' already exists`);
    }
  }

  return prisma.expenseCategory.update({
    where: { id: expenseCategoryId },
    data: {
      name: name || existingCategory.name,
    },
  });
}

/**
 * Delete an expense category
 */
export async function deleteExpenseCategory(
  userId: string,
  expenseCategoryId: string
) {
  const category = await prisma.expenseCategory.findFirst({
    where: { id: expenseCategoryId, userId },
  });

  if (!category) {
    throw new NotFoundError('Expense category not found');
  }

  // Check if used in transactions
  const transactionCount = await prisma.transaction.count({
    where: { expenseCategoryId, userId },
  });

  if (transactionCount > 0) {
    // Option: Allow delete but set expenseCategoryId to null in transactions?
    // For now, block it to preserve history integrity unless user explicitly wants to wipe it.
    // Or we could implement a "reassign" feature later.
    throw new ConflictError(
      'Cannot delete category linked to existing transactions.'
    );
  }

  await prisma.expenseCategory.delete({
    where: { id: expenseCategoryId },
  });

  return { message: 'Expense category deleted successfully' };
}
