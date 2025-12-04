import prisma from '../config/database';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';

export interface CreateAccountInput {
  userId: string;
  name: string;
  allocationPercentage: number;
  isDefault?: boolean;
  reduceFromAccountId?: string; // Which account to reduce allocation from
}

export interface UpdateAccountInput {
  userId: string;
  accountId: string;
  name?: string;
  allocationPercentage?: number;
  isDefault?: boolean;
}

export interface AccountWithBalance {
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
 * Calculate balance for an account
 */
async function calculateAccountBalance(
  accountId: string,
  userId: string
): Promise<number> {
  const [incomeResult, expenseResult] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        accountId,
        userId,
        type: 'INCOME',
      },
      _sum: {
        amountCents: true,
      },
    }),
    prisma.transaction.aggregate({
      where: {
        accountId,
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
  excludeAccountId?: string
): Promise<number> {
  const result = await prisma.account.aggregate({
    where: {
      userId,
      id: excludeAccountId ? { not: excludeAccountId } : undefined,
    },
    _sum: {
      allocationPercentage: true,
    },
  });

  return result._sum.allocationPercentage || 0;
}

/**
 * Get default account for user
 */
async function getDefaultAccount(userId: string) {
  return prisma.account.findFirst({
    where: { userId, isDefault: true },
  });
}

/**
 * Create a new account with automatic allocation management
 */
export async function createAccount(
  input: CreateAccountInput
): Promise<AccountWithBalance> {
  const { userId, name, allocationPercentage, isDefault, reduceFromAccountId } = input;

  if (allocationPercentage < 0 || allocationPercentage > 100) {
    throw new BadRequestError('Allocation percentage must be between 0 and 100');
  }

  const currentTotal = await getTotalAllocation(userId);
  const remaining = 100 - currentTotal;

  // If trying to set as default
  if (isDefault) {
    const existingDefault = await getDefaultAccount(userId);
    if (existingDefault) {
      throw new ConflictError('Only one default account is allowed');
    }
  }

  // Check if we need to reduce allocation from another account
  if (allocationPercentage > remaining) {
    if (!reduceFromAccountId) {
      // Check if there's a default account we can auto-reduce
      const defaultAccount = await getDefaultAccount(userId);
      if (defaultAccount && defaultAccount.allocationPercentage >= allocationPercentage - remaining) {
        // Automatically reduce from default account
        await prisma.account.update({
          where: { id: defaultAccount.id },
          data: {
            allocationPercentage: defaultAccount.allocationPercentage - (allocationPercentage - remaining),
          },
        });
      } else {
        throw new ConflictError(
          `Not enough allocation available. Need ${allocationPercentage}%, only ${remaining}% available. ` +
          `Specify which account to reduce from.`
        );
      }
    } else {
      // Reduce from specified account
      const accountToReduce = await prisma.account.findFirst({
        where: { id: reduceFromAccountId, userId },
      });

      if (!accountToReduce) {
        throw new NotFoundError('Account to reduce from not found');
      }

      const reductionNeeded = allocationPercentage - remaining;
      if (accountToReduce.allocationPercentage < reductionNeeded) {
        throw new BadRequestError(
          `Cannot reduce ${reductionNeeded}% from ${accountToReduce.name} (only has ${accountToReduce.allocationPercentage}%)`
        );
      }

      await prisma.account.update({
        where: { id: reduceFromAccountId },
        data: {
          allocationPercentage: accountToReduce.allocationPercentage - reductionNeeded,
        },
      });
    }
  }

  const account = await prisma.account.create({
    data: {
      userId,
      name,
      allocationPercentage,
      isDefault: isDefault || false,
    },
  });

  const balanceCents = await calculateAccountBalance(account.id, userId);

  return {
    ...account,
    balanceCents,
    balanceFormatted: formatCents(balanceCents),
  };
}

/**
 * Get all accounts for a user with balances
 */
export async function getAccounts(
  userId: string
): Promise<{
  accounts: AccountWithBalance[];
  totalAllocationPercentage: number;
  totalBalanceCents: number;
  totalBalanceFormatted: string;
}> {
  const accounts = await prisma.account.findMany({
    where: { userId },
    orderBy: [
      { isDefault: 'desc' }, // Default accounts first
      { createdAt: 'asc' },
    ],
  });

  const accountsWithBalances = await Promise.all(
    accounts.map(async (account) => {
      const balanceCents = await calculateAccountBalance(account.id, userId);
      return {
        ...account,
        balanceCents,
        balanceFormatted: formatCents(balanceCents),
      };
    })
  );

  const totalAllocationPercentage = accounts.reduce(
    (sum, acc) => sum + acc.allocationPercentage,
    0
  );

  const totalBalanceCents = accountsWithBalances.reduce(
    (sum, acc) => sum + acc.balanceCents,
    0
  );

  return {
    accounts: accountsWithBalances,
    totalAllocationPercentage,
    totalBalanceCents,
    totalBalanceFormatted: formatCents(totalBalanceCents),
  };
}

/**
 * Update an account
 */
export async function updateAccount(
  input: UpdateAccountInput
): Promise<AccountWithBalance> {
  const { userId, accountId, name, allocationPercentage, isDefault } = input;

  const existingAccount = await prisma.account.findFirst({
    where: { id: accountId, userId },
  });

  if (!existingAccount) {
    throw new NotFoundError('Account not found');
  }

  // Handle isDefault changes
  if (isDefault !== undefined && isDefault !== existingAccount.isDefault) {
    if (isDefault) {
      const existingDefault = await getDefaultAccount(userId);
      if (existingDefault && existingDefault.id !== accountId) {
        throw new ConflictError('Only one default account is allowed');
      }
    }
  }

  // If changing allocation percentage
  if (allocationPercentage !== undefined && allocationPercentage !== existingAccount.allocationPercentage) {
    const currentTotal = await getTotalAllocation(userId, accountId);
    const newTotal = currentTotal + allocationPercentage;

    // Allow up to 100%, can be less
    if (newTotal > 100) {
      throw new ConflictError(
        `Total allocation would be ${newTotal}%. Maximum is 100%.`
      );
    }
  }

  const account = await prisma.account.update({
    where: { id: accountId },
    data: {
      name: name !== undefined ? name : existingAccount.name,
      allocationPercentage:
        allocationPercentage !== undefined
          ? allocationPercentage
          : existingAccount.allocationPercentage,
      isDefault: isDefault !== undefined ? isDefault : existingAccount.isDefault,
    },
  });

  const balanceCents = await calculateAccountBalance(account.id, userId);

  return {
    ...account,
    balanceCents,
    balanceFormatted: formatCents(balanceCents),
  };
}

/**
 * Delete an account
 */
export async function deleteAccount(
  userId: string,
  accountId: string
): Promise<{ message: string; remainingAllocationTotal: number }> {
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  });

  if (!account) {
    throw new NotFoundError('Account not found');
  }

  const transactionCount = await prisma.transaction.count({
    where: { accountId, userId },
  });

  if (transactionCount > 0) {
    throw new ConflictError(
      'Cannot delete account with existing transactions. Please reassign or delete transactions first.'
    );
  }

  await prisma.account.delete({
    where: { id: accountId },
  });

  const remainingAllocationTotal = await getTotalAllocation(userId);

  return {
    message: 'Account deleted successfully',
    remainingAllocationTotal,
  };
}
