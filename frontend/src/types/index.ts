export interface User {
  userId: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
  allocationPercentage: number;
  isDefault: boolean;
  balanceCents: number;
  balanceFormatted: string;
  isLowBalance?: boolean;
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  categoryId?: string | null;
  categoryName?: string;
  amountCents: number;
  amountFormatted: string;
  description: string;
  sourceDescription?: string | null;
  transactionDate: string;
  createdAt: string;
  allocations?: Array<{
    categoryId: string | null;
    categoryName: string;
    amountCents: number;
  }>;
}

export interface DashboardData {
  categories: Category[];
  summary: {
    totalBalanceCents: number;
    totalBalanceFormatted: string;
    totalAllocationPercentage: number;
    categoryCount: number;
    lowBalanceCategories: number;
  };
  recentTransactions: Transaction[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}
