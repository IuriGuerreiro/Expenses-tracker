import prisma from '../config/database';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';

export interface CreateCategoryInput {
  userId: string;
  name: string;
  allocationPercentage: number;
  isDefault?: boolean;
  reduceFromCategoryId?: string; // Which category to reduce allocation from
}

export interface UpdateCategoryInput {
  userId: string;
  categoryId: string;
  name?: string;
  allocationPercentage?: number;
  isDefault?: boolean;
}

export interface CategoryWithBalance {
  id: string;
  userId: string;
  name: string;
  allocationPercentage: number;
  isDefault: boolean;
  balanceCents: number;
  balanceFormatted: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Calculate balance for a category
 */
async function calculateCategoryBalance(
  categoryId: string,
  userId: string
): Promise<number> {
  const [incomeResult, expenseResult] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        categoryId,
        userId,
        type: 'INCOME',
      },
      _sum: {
        amountCents: true,
      },
    }),
    prisma.transaction.aggregate({
      where: {
        categoryId,
        userId,
        type: 'EXPENSE',
      },
      _sum: {
        amountCents: true,
      },
    }),
  ]);

  const income = incomeResult._sum.amountCents || 0;
  const expenses = expenseResult._sum.amountCents || 0;

  return income - expenses;
}

/**
 * Format cents to dollar string
 */
function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Get current total allocation
 */
async function getTotalAllocation(
  userId: string,
  excludeCategoryId?: string
): Promise<number> {
  const result = await prisma.category.aggregate({
    where: {
      userId,
      id: excludeCategoryId ? { not: excludeCategoryId } : undefined,
    },
    _sum: {
      allocationPercentage: true,
    },
  });

  return result._sum.allocationPercentage || 0;
}

/**
 * Get default category for user
 */
async function getDefaultCategory(userId: string) {
  return prisma.category.findFirst({
    where: { userId, isDefault: true },
  });
}

/**
 * Create a new category with automatic allocation management
 */
export async function createCategory(
  input: CreateCategoryInput
): Promise<CategoryWithBalance> {
  const { userId, name, allocationPercentage, isDefault, reduceFromCategoryId } = input;

  if (allocationPercentage < 0 || allocationPercentage > 100) {
    throw new BadRequestError('Allocation percentage must be between 0 and 100');
  }

  const currentTotal = await getTotalAllocation(userId);
  const remaining = 100 - currentTotal;

  // If trying to set as default
  if (isDefault) {
    const existingDefault = await getDefaultCategory(userId);
    if (existingDefault) {
      throw new ConflictError('Only one default category is allowed');
    }
  }

  // Check if we need to reduce allocation from another category
  if (allocationPercentage > remaining) {
    if (!reduceFromCategoryId) {
      // Check if there's a default category we can auto-reduce
      const defaultCategory = await getDefaultCategory(userId);
      if (defaultCategory && defaultCategory.allocationPercentage >= allocationPercentage - remaining) {
        // Automatically reduce from default category
        await prisma.category.update({
          where: { id: defaultCategory.id },
          data: {
            allocationPercentage: defaultCategory.allocationPercentage - (allocationPercentage - remaining),
          },
        });
      } else {
        throw new ConflictError(
          `Not enough allocation available. Need ${allocationPercentage}%, only ${remaining}% available. ` +
          `Specify which category to reduce from.`
        );
      }
    } else {
      // Reduce from specified category
      const categoryToReduce = await prisma.category.findFirst({
        where: { id: reduceFromCategoryId, userId },
      });

      if (!categoryToReduce) {
        throw new NotFoundError('Category to reduce from not found');
      }

      const reductionNeeded = allocationPercentage - remaining;
      if (categoryToReduce.allocationPercentage < reductionNeeded) {
        throw new BadRequestError(
          `Cannot reduce ${reductionNeeded}% from ${categoryToReduce.name} (only has ${categoryToReduce.allocationPercentage}%)`
        );
      }

      await prisma.category.update({
        where: { id: reduceFromCategoryId },
        data: {
          allocationPercentage: categoryToReduce.allocationPercentage - reductionNeeded,
        },
      });
    }
  }

  const category = await prisma.category.create({
    data: {
      userId,
      name,
      allocationPercentage,
      isDefault: isDefault || false,
    },
  });

  const balanceCents = await calculateCategoryBalance(category.id, userId);

  return {
    ...category,
    balanceCents,
    balanceFormatted: formatCents(balanceCents),
  };
}

/**
 * Get all categories for a user with balances
 */
export async function getCategories(
  userId: string
): Promise<{
  categories: CategoryWithBalance[];
  totalAllocationPercentage: number;
  totalBalanceCents: number;
  totalBalanceFormatted: string;
}> {
  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: [
      { isDefault: 'desc' }, // Default categories first
      { createdAt: 'asc' },
    ],
  });

  const categoriesWithBalances = await Promise.all(
    categories.map(async (category) => {
      const balanceCents = await calculateCategoryBalance(category.id, userId);
      return {
        ...category,
        balanceCents,
        balanceFormatted: formatCents(balanceCents),
      };
    })
  );

  const totalAllocationPercentage = categories.reduce(
    (sum, cat) => sum + cat.allocationPercentage,
    0
  );

  const totalBalanceCents = categoriesWithBalances.reduce(
    (sum, cat) => sum + cat.balanceCents,
    0
  );

  return {
    categories: categoriesWithBalances,
    totalAllocationPercentage,
    totalBalanceCents,
    totalBalanceFormatted: formatCents(totalBalanceCents),
  };
}

/**
 * Update a category
 */
export async function updateCategory(
  input: UpdateCategoryInput
): Promise<CategoryWithBalance> {
  const { userId, categoryId, name, allocationPercentage, isDefault } = input;

  const existingCategory = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });

  if (!existingCategory) {
    throw new NotFoundError('Category not found');
  }

  // Handle isDefault changes
  if (isDefault !== undefined && isDefault !== existingCategory.isDefault) {
    if (isDefault) {
      const existingDefault = await getDefaultCategory(userId);
      if (existingDefault && existingDefault.id !== categoryId) {
        throw new ConflictError('Only one default category is allowed');
      }
    }
  }

  // If changing allocation percentage
  if (allocationPercentage !== undefined && allocationPercentage !== existingCategory.allocationPercentage) {
    const currentTotal = await getTotalAllocation(userId, categoryId);
    const newTotal = currentTotal + allocationPercentage;

    // Allow up to 100%, can be less
    if (newTotal > 100) {
      throw new ConflictError(
        `Total allocation would be ${newTotal}%. Maximum is 100%.`
      );
    }
  }

  const category = await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: name !== undefined ? name : existingCategory.name,
      allocationPercentage:
        allocationPercentage !== undefined
          ? allocationPercentage
          : existingCategory.allocationPercentage,
      isDefault: isDefault !== undefined ? isDefault : existingCategory.isDefault,
    },
  });

  const balanceCents = await calculateCategoryBalance(category.id, userId);

  return {
    ...category,
    balanceCents,
    balanceFormatted: formatCents(balanceCents),
  };
}

/**
 * Delete a category
 */
export async function deleteCategory(
  userId: string,
  categoryId: string
): Promise<{ message: string; remainingAllocationTotal: number }> {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  const transactionCount = await prisma.transaction.count({
    where: { categoryId, userId },
  });

  if (transactionCount > 0) {
    throw new ConflictError(
      'Cannot delete category with existing transactions. Please reassign or delete transactions first.'
    );
  }

  await prisma.category.delete({
    where: { id: categoryId },
  });

  const remainingAllocationTotal = await getTotalAllocation(userId);

  return {
    message: 'Category deleted successfully',
    remainingAllocationTotal,
  };
}
