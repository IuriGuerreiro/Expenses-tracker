import axios from './axios';
import type { ApiResponse, Account } from '../types';

export interface CreateAccountData {
  name: string;
  allocationPercentage: number;
  isDefault?: boolean;
}

export const accountsApi = {
  getAll: async () => {
    const response = await axios.get<
      ApiResponse<{
        accounts: Account[];
        totalAllocationPercentage: number;
        totalBalanceCents: number;
        totalBalanceFormatted: string;
      }>
    >('/accounts');
    return response.data;
  },

  create: async (data: CreateAccountData) => {
    const response = await axios.post<ApiResponse<Account>>(
      '/accounts',
      data
    );
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<CreateAccountData>
  ) => {
    const response = await axios.put<ApiResponse<Account>>(
      `/accounts/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axios.delete<
      ApiResponse<{ message: string }>
    >(`/accounts/${id}`);
    return response.data;
  },
};
