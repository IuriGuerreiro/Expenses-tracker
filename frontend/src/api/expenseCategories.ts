import axios from './axios';
import type { ApiResponse, ExpenseCategory } from '../types';

export interface CreateExpenseCategoryData {
  name: string;
}

export const expenseCategoriesApi = {
  getAll: async () => {
    const response = await axios.get<
      ApiResponse<{
        expenseCategories: ExpenseCategory[];
      }>
    >('/expense-categories');
    return response.data;
  },

  create: async (data: CreateExpenseCategoryData) => {
    const response = await axios.post<ApiResponse<ExpenseCategory>>(
      '/expense-categories',
      data
    );
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<CreateExpenseCategoryData>
  ) => {
    const response = await axios.put<ApiResponse<ExpenseCategory>>(
      `/expense-categories/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axios.delete<
      ApiResponse<{ message: string }>
    >(`/expense-categories/${id}`);
    return response.data;
  },
};
