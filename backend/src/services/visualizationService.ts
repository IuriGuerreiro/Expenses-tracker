import prisma from '../config/database';

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export async function getSpendingByCategory(
  userId: string,
  startDate?: Date,
  endDate?: Date
) {
  const where: any = {
    userId,
    type: 'EXPENSE',
  };

  if (startDate || endDate) {
    where.transactionDate = {};
    if (startDate) where.transactionDate.gte = startDate;
    if (endDate) where.transactionDate.lte = endDate;
  }

  const expenses = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where,
    _sum: {
      amountCents: true,
    },
    _count: true,
  });

  const grandTotal = expenses.reduce(
    (sum, e) => sum + (e._sum.amountCents || 0),
    0
  );

  const categoriesData = await Promise.all(
    expenses
      .filter((e) => e.categoryId !== null)
      .map(async (e) => {
        const category = await prisma.category.findUnique({
          where: { id: e.categoryId! },
        });

        const totalCents = e._sum.amountCents || 0;

        return {
          categoryId: e.categoryId,
          categoryName: category?.name || 'Unknown',
          totalSpentCents: totalCents,
          totalSpentFormatted: formatCents(totalCents),
          transactionCount: e._count,
          percentageOfTotal: grandTotal > 0 ? (totalCents / grandTotal) * 100 : 0,
        };
      })
  );

  return {
    categories: categoriesData,
    summary: {
      totalSpentCents: grandTotal,
      totalSpentFormatted: formatCents(grandTotal),
      dateRange: {
        startDate: startDate?.toISOString() || null,
        endDate: endDate?.toISOString() || null,
      },
    },
  };
}

export async function getSpendingOverTime(
  userId: string,
  startDate?: Date,
  endDate?: Date,
  groupBy: 'day' | 'week' | 'month' = 'day'
) {
  const where: any = {
    userId,
    type: 'EXPENSE',
  };

  if (startDate || endDate) {
    where.transactionDate = {};
    if (startDate) where.transactionDate.gte = startDate;
    if (endDate) where.transactionDate.lte = endDate;
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { transactionDate: 'asc' },
  });

  const groupedData: Record<string, { totalCents: number; count: number }> = {};

  transactions.forEach((t) => {
    const date = new Date(t.transactionDate);
    let key: string;

    if (groupBy === 'day') {
      key = date.toISOString().split('T')[0];
    } else if (groupBy === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    if (!groupedData[key]) {
      groupedData[key] = { totalCents: 0, count: 0 };
    }

    groupedData[key].totalCents += t.amountCents;
    groupedData[key].count += 1;
  });

  const timeSeries = Object.entries(groupedData).map(([date, data]) => ({
    date,
    totalSpentCents: data.totalCents,
    totalSpentFormatted: formatCents(data.totalCents),
    transactionCount: data.count,
  }));

  const totalSpentCents = timeSeries.reduce(
    (sum, item) => sum + item.totalSpentCents,
    0
  );

  return {
    timeSeries,
    summary: {
      totalSpentCents,
      averagePerPeriodCents:
        timeSeries.length > 0 ? Math.floor(totalSpentCents / timeSeries.length) : 0,
      dateRange: {
        startDate: startDate?.toISOString() || null,
        endDate: endDate?.toISOString() || null,
      },
    },
  };
}

export async function getIncomeVsExpenses(
  userId: string,
  startDate?: Date,
  endDate?: Date,
  groupBy: 'week' | 'month' = 'month'
) {
  const where: any = { userId };

  if (startDate || endDate) {
    where.transactionDate = {};
    if (startDate) where.transactionDate.gte = startDate;
    if (endDate) where.transactionDate.lte = endDate;
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { transactionDate: 'asc' },
  });

  const groupedData: Record<
    string,
    { incomeCents: number; expensesCents: number }
  > = {};

  transactions.forEach((t) => {
    if (t.categoryId === null && t.type === 'INCOME') return;

    const date = new Date(t.transactionDate);
    let key: string;

    if (groupBy === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    if (!groupedData[key]) {
      groupedData[key] = { incomeCents: 0, expensesCents: 0 };
    }

    if (t.type === 'INCOME') {
      groupedData[key].incomeCents += t.amountCents;
    } else {
      groupedData[key].expensesCents += t.amountCents;
    }
  });

  const timeSeries = Object.entries(groupedData).map(([period, data]) => ({
    period,
    incomeCents: data.incomeCents,
    incomeFormatted: formatCents(data.incomeCents),
    expensesCents: data.expensesCents,
    expensesFormatted: formatCents(data.expensesCents),
    netCents: data.incomeCents - data.expensesCents,
    netFormatted: formatCents(data.incomeCents - data.expensesCents),
  }));

  const totalIncomeCents = timeSeries.reduce(
    (sum, item) => sum + item.incomeCents,
    0
  );
  const totalExpensesCents = timeSeries.reduce(
    (sum, item) => sum + item.expensesCents,
    0
  );
  const netSavingsCents = totalIncomeCents - totalExpensesCents;

  return {
    timeSeries,
    summary: {
      totalIncomeCents,
      totalExpensesCents,
      netSavingsCents,
      savingsRate:
        totalIncomeCents > 0 ? (netSavingsCents / totalIncomeCents) * 100 : 0,
    },
  };
}
