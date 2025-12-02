import prisma from '../config/database';

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

async function calculateCategoryBalance(
  categoryId: string,
  userId: string
): Promise<number> {
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

  return (
    (incomeResult._sum.amountCents || 0) - (expenseResult._sum.amountCents || 0)
  );
}

export async function getDashboardData(userId: string) {
  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });

  const categoriesWithBalances = await Promise.all(
    categories.map(async (category) => {
      const balanceCents = await calculateCategoryBalance(category.id, userId);
      const isLowBalance = balanceCents === 0 || balanceCents < 0;

      return {
        id: category.id,
        name: category.name,
        allocationPercentage: category.allocationPercentage,
        balanceCents,
        balanceFormatted: formatCents(balanceCents),
        isLowBalance,
      };
    })
  );

  const totalBalanceCents = categoriesWithBalances.reduce(
    (sum, cat) => sum + cat.balanceCents,
    0
  );

  const totalAllocationPercentage = categories.reduce(
    (sum, cat) => sum + cat.allocationPercentage,
    0
  );

  const lowBalanceCategories = categoriesWithBalances.filter(
    (cat) => cat.isLowBalance
  ).length;

  const recentTransactions = await prisma.transaction.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { transactionDate: 'desc' },
    take: 10,
  });

  return {
    categories: categoriesWithBalances,
    summary: {
      totalBalanceCents,
      totalBalanceFormatted: formatCents(totalBalanceCents),
      totalAllocationPercentage,
      categoryCount: categories.length,
      lowBalanceCategories,
    },
    recentTransactions: recentTransactions.map((t) => ({
      id: t.id,
      type: t.type,
      categoryName: t.category?.name || 'N/A',
      amountCents: t.amountCents,
      amountFormatted: formatCents(t.amountCents),
      description: t.description,
      transactionDate: t.transactionDate,
    })),
  };
}
