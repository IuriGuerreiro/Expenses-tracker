import prisma from '../config/database';

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

async function calculateAccountBalance(
  accountId: string,
  userId: string
): Promise<number> {
  const [incomeResult, expenseResult] = await Promise.all([
    prisma.transaction.aggregate({
      where: { accountId, userId, type: 'INCOME' },
      _sum: { amountCents: true },
    }),
    prisma.transaction.aggregate({
      where: { accountId, userId, type: 'EXPENSE' },
      _sum: { amountCents: true },
    }),
  ]);

  return (
    (incomeResult._sum?.amountCents || 0) - (expenseResult._sum?.amountCents || 0)
  );
}

export async function getDashboardData(userId: string) {
  const accounts = await prisma.account.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });

  const accountsWithBalances = await Promise.all(
    accounts.map(async (account) => {
      const balanceCents = await calculateAccountBalance(account.id, userId);
      const isLowBalance = balanceCents === 0 || balanceCents < 0;

      return {
        id: account.id,
        name: account.name,
        allocationPercentage: account.allocationPercentage,
        balanceCents,
        balanceFormatted: formatCents(balanceCents),
        isLowBalance,
      };
    })
  );

  const totalBalanceCents = accountsWithBalances.reduce(
    (sum, acc) => sum + acc.balanceCents,
    0
  );

  const totalAllocationPercentage = accounts.reduce(
    (sum, acc) => sum + acc.allocationPercentage,
    0
  );

  const lowBalanceAccounts = accountsWithBalances.filter(
    (acc) => acc.isLowBalance
  ).length;

  const recentTransactions = await prisma.transaction.findMany({
    where: { userId },
    include: {
      account: true,
      expenseCategory: true
    },
    orderBy: { transactionDate: 'desc' },
    take: 10,
  });

  return {
    accounts: accountsWithBalances,
    summary: {
      totalBalanceCents,
      totalBalanceFormatted: formatCents(totalBalanceCents),
      totalAllocationPercentage,
      accountCount: accounts.length,
      lowBalanceAccounts,
    },
    recentTransactions: recentTransactions.map((t) => ({
      id: t.id,
      type: t.type,
      accountName: t.account?.name || 'N/A',
      expenseCategoryName: t.expenseCategory?.name || (t.type === 'INCOME' ? 'Income' : 'N/A'),
      amountCents: t.amountCents,
      amountFormatted: formatCents(t.amountCents),
      description: t.description,
      transactionDate: t.transactionDate,
    })),
  };
}
