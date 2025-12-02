import axios from './axios';
import type { ApiResponse } from '../types';

export interface Debt {
  id: string;
  personName: string;
  amountCents: number;
  amountFormatted: string;
  description: string;
  type: 'OWED_TO_ME' | 'OWED_BY_ME';
  isPaid: boolean;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DebtSummary {
  owedToMeTotalCents: number;
  owedToMeTotalFormatted: string;
  owedByMeTotalCents: number;
  owedByMeTotalFormatted: string;
  netCents: number;
  netFormatted: string;
}

export interface CreateDebtData {
  personName: string;
  amount: number;
  description: string;
  type: 'OWED_TO_ME' | 'OWED_BY_ME';
  categoryId?: string;
  dueDate?: string;
}

export const debtsApi = {
  getAll: async (filters?: { type?: string; isPaid?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.isPaid !== undefined) params.append('isPaid', filters.isPaid.toString());

    const response = await axios.get<
      ApiResponse<{
        debts: Debt[];
        summary: DebtSummary;
      }>
    >(`/debts?${params.toString()}`);
    return response.data;
  },

  create: async (data: CreateDebtData) => {
    const response = await axios.post<ApiResponse<Debt>>('/debts', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateDebtData>) => {
    const response = await axios.put<ApiResponse<Debt>>(`/debts/${id}`, data);
    return response.data;
  },

  markPaid: async (id: string) => {
    const response = await axios.post<ApiResponse<Debt>>(`/debts/${id}/mark-paid`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axios.delete<ApiResponse<{ message: string }>>(`/debts/${id}`);
    return response.data;
  },
};
