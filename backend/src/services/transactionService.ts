import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';

export interface CreateExpenseInput {
  userId: string;
  categoryId: string;
  amountCents: number;
  description: string;
  transactionDate: Date;
}

export interface GetTransactionsFilters {
  userId: string;
  type?: 'INCOME' | 'EXPENSE';
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  sortBy?: 'transactionDate' | 'amountCents';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Format cents to dollar string
 */
function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Create an expense transaction
 */
export async function createExpense(input: CreateExpenseInput) {
  const { userId, categoryId, amountCents, description, transactionDate } = input;

  // Verify category exists and belongs to user
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  const expense = await prisma.transaction.create({
    data: {
      userId,
      categoryId,
      type: 'EXPENSE',
      amountCents,
      description,
      transactionDate,
    },
  });

  // Calculate new category balance
  const [incomeResult, expenseResult] = await Promise.all([
    prisma.transaction.aggregate({
      where: { categoryId, userId, type: 'INCOME' },
      _sum: { amountCents: true },
    }),
    prisma.transaction.aggregate({
      where: { categoryId, userId, type: 'EXPENSE' },
      _sum: { amountCents: true },
    }),
  ]);

  const newBalanceCents =
    (incomeResult._sum.amountCents || 0) - (expenseResult._sum.amountCents || 0);

  return {
    id: expense.id,
    categoryId: expense.categoryId,
    categoryName: category.name,
    amountCents: expense.amountCents,
    amountFormatted: formatCents(expense.amountCents),
    description: expense.description,
    transactionDate: expense.transactionDate,
    createdAt: expense.createdAt,
    newCategoryBalanceCents: newBalanceCents,
  };
}

/**
 * Update an expense transaction
 */
export async function updateExpense(
  userId: string,
  expenseId: string,
  updates: {
    categoryId?: string;
    amountCents?: number;
    description?: string;
    transactionDate?: Date;
  }
) {
  // Check if expense exists and belongs to user
  const existingExpense = await prisma.transaction.findFirst({
    where: { id: expenseId, userId, type: 'EXPENSE' },
  });

  if (!existingExpense) {
    throw new NotFoundError('Expense not found');
  }

  // If category is changing, verify new category exists
  if (updates.categoryId && updates.categoryId !== existingExpense.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: updates.categoryId, userId },
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }
  }

  const expense = await prisma.transaction.update({
    where: { id: expenseId },
    data: updates,
    include: { category: true },
  });

  return {
    id: expense.id,
    categoryId: expense.categoryId,
    categoryName: expense.category?.name,
    amountCents: expense.amountCents,
    amountFormatted: formatCents(expense.amountCents),
    description: expense.description,
    transactionDate: expense.transactionDate,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
  };
}

/**
 * Delete an expense transaction
 */
export async function deleteExpense(userId: string, expenseId: string) {
  const existingExpense = await prisma.transaction.findFirst({
    where: { id: expenseId, userId, type: 'EXPENSE' },
  });

  if (!existingExpense) {
    throw new NotFoundError('Expense not found');
  }

  await prisma.transaction.delete({
    where: { id: expenseId },
  });

  return { message: 'Expense deleted successfully' };
}

/**
 * Get transactions with filters
 */
export async function getTransactions(filters: GetTransactionsFilters) {
  const {
    userId,
    type,
    categoryId,
    startDate,
    endDate,
    search,
    sortBy = 'transactionDate',
    sortOrder = 'desc',
    page = 1,
    limit = 20,
  } = filters;

  const where: any = { userId };

  if (type) {
    where.type = type;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (startDate || endDate) {
    where.transactionDate = {};
    if (startDate) where.transactionDate.gte = startDate;
    if (endDate) where.transactionDate.lte = endDate;
  }

  if (search) {
    where.description = {
      contains: search,
      mode: 'insensitive',
    };
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions: transactions.map((t) => ({
      id: t.id,
      type: t.type,
      categoryId: t.categoryId,
      categoryName: t.category?.name,
      amountCents: t.amountCents,
      amountFormatted: formatCents(t.amountCents),
      description: t.description,
      sourceDescription: t.sourceDescription,
      transactionDate: t.transactionDate,
      createdAt: t.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get income transactions
 */
export async function getIncomeTransactions(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  // Get main income transactions (categoryId is null)
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        type: 'INCOME',
        categoryId: null,
      },
      orderBy: { transactionDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({
      where: {
        userId,
        type: 'INCOME',
        categoryId: null,
      },
    }),
  ]);

  // For each income, get allocations
  const transactionsWithAllocations = await Promise.all(
    transactions.map(async (income) => {
      const allocations = await prisma.transaction.findMany({
        where: {
          userId,
          type: 'INCOME',
          sourceDescription: income.sourceDescription,
          categoryId: { not: null },
        },
        include: { category: true },
      });

      return {
        id: income.id,
        type: income.type,
        amountCents: income.amountCents,
        amountFormatted: formatCents(income.amountCents),
        sourceDescription: income.sourceDescription,
        transactionDate: income.transactionDate,
        createdAt: income.createdAt,
        allocations: allocations.map((a) => ({
          categoryId: a.categoryId,
          categoryName: a.category?.name,
          amountCents: a.amountCents,
        })),
      };
    })
  );

  return {
    transactions: transactionsWithAllocations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
