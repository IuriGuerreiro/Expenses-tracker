import prisma from '../config/database';
import { ConflictError } from '../utils/errors';

export interface CreateIncomeInput {
  userId: string;
  amountCents: number;
  sourceDescription: string;
  transactionDate: Date;
}

export interface IncomeResponse {
  incomeId: string;
  totalAmountCents: number;
  allocations: Array<{
    categoryId: string;
    categoryName: string;
    amountCents: number;
  }>;
}

/**
 * Log income with automatic category allocation
 */
export async function createIncomeWithAllocation(
  input: CreateIncomeInput
): Promise<IncomeResponse> {
  const { userId, amountCents, sourceDescription, transactionDate } = input;

  // Get all user categories
  const categories = await prisma.category.findMany({
    where: { userId },
  });

  if (categories.length === 0) {
    throw new ConflictError(
      'Please create categories before logging income'
    );
  }

  // Check if allocation totals 100%
  const totalAllocation = categories.reduce(
    (sum, cat) => sum + cat.allocationPercentage,
    0
  );

  if (totalAllocation !== 100) {
    throw new ConflictError(
      'Please set up categories with 100% allocation before logging income'
    );
  }

  // Perform atomic allocation using Prisma transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create main income transaction record
    const incomeTransaction = await tx.transaction.create({
      data: {
        userId,
        type: 'INCOME',
        amountCents,
        description: 'Income allocation',
        sourceDescription,
        transactionDate,
        categoryId: null,
      },
    });

    // 2. Calculate and create allocation transactions for each category
    const allocations = [];
    let totalAllocated = 0;

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      let allocationCents: number;

      // For the last category, allocate remaining to handle rounding
      if (i === categories.length - 1) {
        allocationCents = amountCents - totalAllocated;
      } else {
        allocationCents = Math.floor(
          (amountCents * category.allocationPercentage) / 100
        );
        totalAllocated += allocationCents;
      }

      await tx.transaction.create({
        data: {
          userId,
          categoryId: category.id,
          type: 'INCOME',
          amountCents: allocationCents,
          description: `Allocation from ${sourceDescription}`,
          sourceDescription,
          transactionDate,
        },
      });

      allocations.push({
        categoryId: category.id,
        categoryName: category.name,
        amountCents: allocationCents,
      });
    }

    return {
      incomeId: incomeTransaction.id,
      totalAmountCents: amountCents,
      allocations,
    };
  });

  return result;
}

/**
 * Update income transaction and reallocate
 */
export async function updateIncomeWithAllocation(
  userId: string,
  incomeId: string,
  updates: {
    amountCents?: number;
    sourceDescription?: string;
    transactionDate?: Date;
  }
): Promise<IncomeResponse> {
  // Get existing income transaction
  const existingIncome = await prisma.transaction.findFirst({
    where: {
      id: incomeId,
      userId,
      type: 'INCOME',
      categoryId: null, // Main income record has no category
    },
  });

  if (!existingIncome) {
    throw new ConflictError('Income transaction not found');
  }

  // Delete old allocation transactions
  await prisma.transaction.deleteMany({
    where: {
      userId,
      sourceDescription: existingIncome.sourceDescription,
      type: 'INCOME',
      categoryId: { not: null }, // Only allocation records
    },
  });

  // Update main income transaction
  const updatedIncome = await prisma.transaction.update({
    where: { id: incomeId },
    data: {
      amountCents: updates.amountCents || existingIncome.amountCents,
      sourceDescription:
        updates.sourceDescription || existingIncome.sourceDescription,
      transactionDate: updates.transactionDate || existingIncome.transactionDate,
    },
  });

  // Reallocate with new values
  return createIncomeWithAllocation({
    userId,
    amountCents: updatedIncome.amountCents,
    sourceDescription: updatedIncome.sourceDescription || '',
    transactionDate: updatedIncome.transactionDate,
  });
}

/**
 * Delete income transaction and all allocations
 */
export async function deleteIncomeWithAllocations(
  userId: string,
  incomeId: string
): Promise<{ message: string }> {
  const existingIncome = await prisma.transaction.findFirst({
    where: {
      id: incomeId,
      userId,
      type: 'INCOME',
      categoryId: null,
    },
  });

  if (!existingIncome) {
    throw new ConflictError('Income transaction not found');
  }

  await prisma.$transaction(async (tx) => {
    // Delete allocation transactions
    await tx.transaction.deleteMany({
      where: {
        userId,
        sourceDescription: existingIncome.sourceDescription,
        type: 'INCOME',
        categoryId: { not: null },
      },
    });

    // Delete main income transaction
    await tx.transaction.delete({
      where: { id: incomeId },
    });
  });

  return { message: 'Income deleted successfully' };
}
