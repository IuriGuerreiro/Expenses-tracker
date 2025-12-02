import axios from './axios';
import type { ApiResponse, Category } from '../types';

export interface CreateCategoryData {
  name: string;
  allocationPercentage: number;
  isDefault?: boolean;
  reduceFromCategoryId?: string;
}

export const categoriesApi = {
  getAll: async () => {
    const response = await axios.get<
      ApiResponse<{
        categories: Category[];
        totalAllocationPercentage: number;
        totalBalanceCents: number;
        totalBalanceFormatted: string;
      }>
    >('/categories');
    return response.data;
  },

  create: async (data: CreateCategoryData) => {
    const response = await axios.post<ApiResponse<Category>>(
      '/categories',
      data
    );
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<CreateCategoryData>
  ) => {
    const response = await axios.put<ApiResponse<Category>>(
      `/categories/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axios.delete<
      ApiResponse<{ message: string; remainingAllocationTotal: number }>
    >(`/categories/${id}`);
    return response.data;
  },
};
