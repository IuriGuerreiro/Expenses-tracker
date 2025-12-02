import axios from './axios';
import type { ApiResponse } from '../types';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: string;
  email: string;
  token: string;
}

export const authApi = {
  register: async (data: RegisterData) => {
    const response = await axios.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      data
    );
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await axios.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      data
    );
    return response.data;
  },

  logout: async () => {
    const response = await axios.post<ApiResponse<{ message: string }>>(
      '/auth/logout'
    );
    return response.data;
  },

  getMe: async () => {
    const response = await axios.get<ApiResponse<{ userId: string }>>(
      '/auth/me'
    );
    return response.data;
  },
};
