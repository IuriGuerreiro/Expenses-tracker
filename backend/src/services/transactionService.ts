import prisma from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/errors';

export interface CreateExpenseInput {
  userId: string;
  accountId: string;
  expenseCategoryId?: string; // Optional now
  amountCents: number;
  description: string;
  transactionDate: Date;
}

export interface CreateIncomeInput { // New Interface
  userId: string;
  accountId: string; // Account to receive income
  amountCents: number;
  sourceDescription?: string;
  transactionDate: Date;
}

export interface UpdateIncomeInput { // New Interface
  userId: string;
  incomeId: string;
  accountId?: string;
  amountCents?: number;
  sourceDescription?: string;
  transactionDate?: Date;
}

export interface GetTransactionsFilters {
  userId: string;
  type?: 'INCOME' | 'EXPENSE';
  accountId?: string;
  expenseCategoryId?: string;
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
  const { userId, accountId, expenseCategoryId, amountCents, description, transactionDate } = input;

  // Verify account exists and belongs to user
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  });

  if (!account) {
    throw new NotFoundError('Account not found');
  }

  let expenseCategoryName: string | undefined;
  if (expenseCategoryId) {
    const expenseCategory = await prisma.expenseCategory.findFirst({
      where: { id: expenseCategoryId, userId },
    });
    if (!expenseCategory) {
      throw new NotFoundError('Expense Category not found');
    }
    expenseCategoryName = expenseCategory.name;
  }

  const expense = await prisma.transaction.create({
    data: {
      userId,
      accountId,
      expenseCategoryId,
      type: 'EXPENSE',
      amountCents,
      description,
      transactionDate,
    },
  });

  // Calculate new account balance - This will be handled by a separate balance calculation service/function or read from an accounts aggregate.
  // For now, removing direct balance calculation here to simplify as accountService handles it.
  // The client can query account balance after transaction.

  return {
    id: expense.id,
    accountId: expense.accountId,
    accountName: account.name,
    expenseCategoryId: expense.expenseCategoryId,
    expenseCategoryName: expenseCategoryName,
    amountCents: expense.amountCents,
    amountFormatted: formatCents(expense.amountCents),
    description: expense.description,
    transactionDate: expense.transactionDate,
    createdAt: expense.createdAt,
  };
}

/**
 * Create an income transaction and allocate across all accounts
 */
export async function createIncome(input: CreateIncomeInput) {
  const { userId, accountId, amountCents, sourceDescription, transactionDate } = input;

  // Get all accounts for the user to allocate income
  const accounts = await prisma.account.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });

  if (accounts.length === 0) {
    throw new NotFoundError('No accounts found. Please create an account first.');
  }

  // Calculate total allocation percentage
  const totalAllocationPercentage = accounts.reduce(
    (sum, acc) => sum + acc.allocationPercentage,
    0
  );

  if (totalAllocationPercentage === 0) {
    throw new BadRequestError('Total account allocation is 0%. Please set allocation percentages.');
  }

  // Create income transactions for each account based on their allocation
  const createdTransactions = await Promise.all(
    accounts.map(async (account) => {
      const allocatedAmount = Math.round(
        (amountCents * account.allocationPercentage) / totalAllocationPercentage
      );

      if (allocatedAmount > 0) {
        return prisma.transaction.create({
          data: {
            userId,
            accountId: account.id,
            type: 'INCOME',
            amountCents: allocatedAmount,
            description: `${sourceDescription || 'Income'} - Allocated to ${account.name}`,
            sourceDescription,
            transactionDate,
          },
        });
      }
      return null;
    })
  );

  const validTransactions = createdTransactions.filter((t) => t !== null);

  // Return summary of the first transaction for backward compatibility
  const firstTransaction = validTransactions[0];
  if (!firstTransaction) {
    throw new BadRequestError('Failed to allocate income to any account');
  }

  return {
    id: firstTransaction.id,
    accountId: firstTransaction.accountId,
    accountName: accounts[0].name,
    amountCents,
    amountFormatted: formatCents(amountCents),
    sourceDescription,
    transactionDate: firstTransaction.transactionDate,
    createdAt: firstTransaction.createdAt,
    allocations: validTransactions.map((t) => ({
      accountId: t!.accountId,
      accountName: accounts.find((a) => a.id === t!.accountId)?.name || 'Unknown',
      amountCents: t!.amountCents,
      amountFormatted: formatCents(t!.amountCents),
    })),
  };
}


/**
 * Update an expense transaction
 */
export async function updateExpense(
  userId: string,
  expenseId: string,
  updates: {
    accountId?: string;
    expenseCategoryId?: string;
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

  // Verify Account if changing
  if (updates.accountId && updates.accountId !== existingExpense.accountId) {
    const account = await prisma.account.findFirst({
      where: { id: updates.accountId, userId },
    });
    if (!account) throw new NotFoundError('Account not found');
  }

  // Verify ExpenseCategory if changing
  if (updates.expenseCategoryId && updates.expenseCategoryId !== existingExpense.expenseCategoryId) {
     const expenseCategory = await prisma.expenseCategory.findFirst({
      where: { id: updates.expenseCategoryId, userId },
    });
    if (!expenseCategory) throw new NotFoundError('Expense Category not found');
  }

  const expense = await prisma.transaction.update({
    where: { id: expenseId },
    data: updates,
    include: { account: true, expenseCategory: true },
  });

  return {
    id: expense.id,
    accountId: expense.accountId,
    accountName: expense.account?.name,
    expenseCategoryId: expense.expenseCategoryId,
    expenseCategoryName: expense.expenseCategory?.name,
    amountCents: expense.amountCents,
    amountFormatted: formatCents(expense.amountCents),
    description: expense.description,
    transactionDate: expense.transactionDate,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
  };
}

/**
 * Update an income transaction
 */
export async function updateIncome(
  userId: string,
  incomeId: string,
  updates: UpdateIncomeInput
) {
  const existingIncome = await prisma.transaction.findFirst({
    where: { id: incomeId, userId, type: 'INCOME' },
  });

  if (!existingIncome) {
    throw new NotFoundError('Income transaction not found');
  }

  if (updates.accountId && updates.accountId !== existingIncome.accountId) {
    const account = await prisma.account.findFirst({
      where: { id: updates.accountId, userId },
    });
    if (!account) throw new NotFoundError('Account not found');
  }

  const income = await prisma.transaction.update({
    where: { id: incomeId },
    data: updates,
    include: { account: true },
  });

  return {
    id: income.id,
    accountId: income.accountId,
    accountName: income.account?.name,
    amountCents: income.amountCents,
    amountFormatted: formatCents(income.amountCents),
    sourceDescription: income.sourceDescription,
    transactionDate: income.transactionDate,
    createdAt: income.createdAt,
    updatedAt: income.updatedAt,
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
 * Delete an income transaction
 */
export async function deleteIncome(userId: string, incomeId: string) {
  const existingIncome = await prisma.transaction.findFirst({
    where: { id: incomeId, userId, type: 'INCOME' },
  });

  if (!existingIncome) {
    throw new NotFoundError('Income transaction not found');
  }

  await prisma.transaction.delete({
    where: { id: incomeId },
  });

  return { message: 'Income transaction deleted successfully' };
}

/**
 * Get transactions with filters
 */
export async function getTransactions(filters: GetTransactionsFilters) {
  const {
    userId,
    type,
    accountId,
    expenseCategoryId,
    startDate,
    endDate,
    search,
    sortBy = 'transactionDate',
    sortOrder = 'desc',
    page = 1,
    limit = 20,
  } = filters;

  const where: any = { userId };

  if (type) where.type = type;
  if (accountId) where.accountId = accountId;
  if (expenseCategoryId) where.expenseCategoryId = expenseCategoryId;

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
      include: { account: true, expenseCategory: true },
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
      accountId: t.accountId,
      accountName: t.account?.name,
      expenseCategoryId: t.expenseCategoryId,
      expenseCategoryName: t.expenseCategory?.name,
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
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        type: 'INCOME',
      },
      include: { account: true },
      orderBy: { transactionDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({
      where: {
        userId,
        type: 'INCOME',
      },
    }),
  ]);

  return {
    transactions: transactions.map((t) => ({
      id: t.id,
      type: t.type,
      accountId: t.accountId,
      accountName: t.account?.name,
      amountCents: t.amountCents,
      amountFormatted: formatCents(t.amountCents),
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
