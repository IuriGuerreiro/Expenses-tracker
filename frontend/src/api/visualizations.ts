import axios from './axios';
import type { ApiResponse } from '../types';

export const visualizationsApi = {
  spendingByCategory: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await axios.get<ApiResponse<any>>(
      `/visualizations/spending-by-category?${params.toString()}`
    );
    return response.data;
  },

  spendingOverTime: async (
    startDate?: string,
    endDate?: string,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ) => {
    const params = new URLSearchParams({ groupBy });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await axios.get<ApiResponse<any>>(
      `/visualizations/spending-over-time?${params.toString()}`
    );
    return response.data;
  },

  incomeVsExpenses: async (
    startDate?: string,
    endDate?: string,
    groupBy: 'week' | 'month' = 'month'
  ) => {
    const params = new URLSearchParams({ groupBy });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await axios.get<ApiResponse<any>>(
      `/visualizations/income-vs-expenses?${params.toString()}`
    );
    return response.data;
  },
};
