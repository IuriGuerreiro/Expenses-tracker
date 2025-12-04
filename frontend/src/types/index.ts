export interface User {
  userId: string;
  email: string;
}

// Account represents budget allocation accounts (e.g., "Savings", "Emergency Fund")
export interface Account {
  id: string;
  name: string;
  allocationPercentage: number;
  isDefault: boolean;
  balanceCents: number;
  balanceFormatted: string;
  isLowBalance?: boolean;
}

// ExpenseCategory represents expense classifications (e.g., "Rent", "Groceries")
export interface ExpenseCategory {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Legacy: Keep for backward compatibility during migration
export interface Category extends Account {}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  accountId?: string;
  accountName?: string;
  expenseCategoryId?: string | null;
  expenseCategoryName?: string;
  // Legacy fields for backward compatibility
  categoryId?: string | null;
  categoryName?: string;
  amountCents: number;
  amountFormatted: string;
  description: string;
  sourceDescription?: string | null;
  transactionDate: string;
  createdAt: string;
}

export interface DashboardData {
  accounts: Account[];
  summary: {
    totalBalanceCents: number;
    totalBalanceFormatted: string;
    totalAllocationPercentage: number;
    accountCount: number;
    lowBalanceAccounts: number;
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
