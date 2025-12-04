import prisma from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/errors';

export interface CreateDebtInput {
  userId: string;
  personName: string;
  amountCents: number;
  description: string;
  type: 'OWED_TO_ME' | 'OWED_BY_ME';
  accountId?: string; // Changed from categoryId
  dueDate?: Date;
}

export interface UpdateDebtInput {
  userId: string;
  debtId: string;
  personName?: string;
  amountCents?: number;
  description?: string;
  type?: 'OWED_TO_ME' | 'OWED_BY_ME';
  isPaid?: boolean;
  dueDate?: Date;
  accountId?: string; // Added for potential account change on update
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export async function createDebt(input: CreateDebtInput) {
  const { userId, personName, amountCents, description, type, accountId, dueDate } = input;

  if (accountId) {
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId },
    });
    if (!account) {
      throw new NotFoundError('Account not found');
    }
  }

  // Use a transaction to create debt and related expense transaction
  const result = await prisma.$transaction(async (tx) => {
    const debt = await tx.debt.create({
      data: {
        userId,
        personName,
        amountCents,
        description,
        type,
        accountId, // Changed from categoryId
        dueDate,
      },
      include: {
        account: true, // Changed from category
      },
    });

    // If OWED_TO_ME and has an account, create an expense transaction to deduct from account
    if (type === 'OWED_TO_ME' && accountId) {
      await tx.transaction.create({
        data: {
          userId,
          accountId, // Changed from categoryId
          type: 'EXPENSE',
          amountCents,
          description: `Lent to ${personName}: ${description}`,
          sourceDescription: null,
          transactionDate: new Date(),
        },
      });
    }

    return debt;
  });

  return {
    ...result,
    amountFormatted: formatCents(amountCents),
  };
}

export async function getDebts(userId: string, filters?: {
  type?: 'OWED_TO_ME' | 'OWED_BY_ME';
  isPaid?: boolean;
  accountId?: string; // Added filter by account
}) {
  const where: any = { userId };

  if (filters?.type) {
    where.type = filters.type;
  }

  if (filters?.isPaid !== undefined) {
    where.isPaid = filters.isPaid;
  }
  
  if (filters?.accountId) {
    where.accountId = filters.accountId;
  }

  const debts = await prisma.debt.findMany({
    where,
    orderBy: [
      { isPaid: 'asc' }, // Unpaid first
      { dueDate: 'asc' }, // Sort by due date
      { createdAt: 'desc' },
    ],
    include: {
      account: true, // Changed from category
    },
  });

  const debtsWithFormatted = debts.map(debt => ({
    ...debt,
    amountFormatted: formatCents(debt.amountCents),
  }));

  // Calculate summaries
  const owedToMeTotal = debts
    .filter(d => d.type === 'OWED_TO_ME' && !d.isPaid)
    .reduce((sum, d) => sum + d.amountCents, 0);

  const owedByMeTotal = debts
    .filter(d => d.type === 'OWED_BY_ME' && !d.isPaid)
    .reduce((sum, d) => sum + d.amountCents, 0);

  return {
    debts: debtsWithFormatted,
    summary: {
      owedToMeTotalCents: owedToMeTotal,
      owedToMeTotalFormatted: formatCents(owedToMeTotal),
      owedByMeTotalCents: owedByMeTotal,
      owedByMeTotalFormatted: formatCents(owedByMeTotal),
      netCents: owedToMeTotal - owedByMeTotal,
      netFormatted: formatCents(owedToMeTotal - owedByMeTotal),
    },
  };
}

export async function updateDebt(input: UpdateDebtInput) {
  const { userId, debtId, accountId, ...updates } = input;

  const existingDebt = await prisma.debt.findFirst({
    where: { id: debtId, userId },
  });

  if (!existingDebt) {
    throw new NotFoundError('Debt not found');
  }

  if (accountId) {
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId },
    });
    if (!account) {
      throw new NotFoundError('Account not found');
    }
  }

  const debt = await prisma.debt.update({
    where: { id: debtId },
    data: { ...updates, accountId },
    include: { account: true }, // Include account after update
  });

  return {
    ...debt,
    amountFormatted: formatCents(debt.amountCents),
  };
}

export async function deleteDebt(userId: string, debtId: string) {
  const debt = await prisma.debt.findFirst({
    where: { id: debtId, userId },
  });

  if (!debt) {
    throw new NotFoundError('Debt not found');
  }

  await prisma.debt.delete({
    where: { id: debtId },
  });

  return { message: 'Debt deleted successfully' };
}

export async function markDebtAsPaid(userId: string, debtId: string) {
  const existingDebt = await prisma.debt.findFirst({
    where: { id: debtId, userId },
  });

  if (!existingDebt) {
    throw new NotFoundError('Debt not found');
  }

  // Use transaction to mark as paid and create income transaction
  const result = await prisma.$transaction(async (tx) => {
    const debt = await tx.debt.update({
      where: { id: debtId },
      data: { isPaid: true },
      include: { account: true }, // Changed from category
    });

    // If OWED_TO_ME and has an account, create an income transaction to add back to account
    if (debt.type === 'OWED_TO_ME' && debt.accountId) {
      await tx.transaction.create({
        data: {
          userId,
          accountId: debt.accountId, // Changed from categoryId
          type: 'INCOME',
          amountCents: debt.amountCents,
          description: `Paid back by ${debt.personName}`,
          sourceDescription: `Repayment: ${debt.description}`,
          transactionDate: new Date(),
        },
      });
    }

    return debt;
  });

  return {
    ...result,
    amountFormatted: formatCents(result.amountCents),
  };
}