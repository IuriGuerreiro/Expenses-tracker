import axios from './axios';
import type { ApiResponse, Transaction } from '../types';

export interface CreateIncomeData {
  amount: number;
  sourceDescription: string;
  transactionDate: string;
}

export interface CreateExpenseData {
  accountId: string;
  expenseCategoryId?: string;
  amount: number;
  description: string;
  transactionDate: string;
}

export const transactionsApi = {
  // Income
  createIncome: async (data: CreateIncomeData) => {
    const response = await axios.post<ApiResponse<any>>('/income', data);
    return response.data;
  },

  getIncome: async (page = 1, limit = 20) => {
    const response = await axios.get<
      ApiResponse<{
        transactions: Transaction[];
        pagination: { page: number; limit: number; total: number };
      }>
    >(`/income?page=${page}&limit=${limit}`);
    return response.data;
  },

  updateIncome: async (id: string, data: Partial<CreateIncomeData>) => {
    const response = await axios.put<ApiResponse<any>>(`/income/${id}`, data);
    return response.data;
  },

  deleteIncome: async (id: string) => {
    const response = await axios.delete<ApiResponse<{ message: string }>>(
      `/income/${id}`
    );
    return response.data;
  },

  // Expenses
  createExpense: async (data: CreateExpenseData) => {
    const response = await axios.post<ApiResponse<any>>('/expenses', data);
    return response.data;
  },

  getExpenses: async (params?: {
    page?: number;
    limit?: number;
    accountId?: string;
    expenseCategoryId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) => {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    const response = await axios.get<
      ApiResponse<{
        transactions: Transaction[];
        pagination: { page: number; limit: number; total: number };
      }>
    >(`/expenses?${queryString}`);
    return response.data;
  },

  updateExpense: async (id: string, data: Partial<CreateExpenseData>) => {
    const response = await axios.put<ApiResponse<any>>(
      `/expenses/${id}`,
      data
    );
    return response.data;
  },

  deleteExpense: async (id: string) => {
    const response = await axios.delete<ApiResponse<{ message: string }>>(
      `/expenses/${id}`
    );
    return response.data;
  },
};
