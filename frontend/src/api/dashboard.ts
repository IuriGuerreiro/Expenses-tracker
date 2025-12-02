import axios from './axios';
import type { ApiResponse, DashboardData } from '../types';

export const dashboardApi = {
  get: async () => {
    const response = await axios.get<ApiResponse<DashboardData>>('/dashboard');
    return response.data;
  },
};
