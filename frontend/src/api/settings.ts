import axios from './axios';
import type { ApiResponse } from '../types';

export interface TwoFactorStatus {
  enabled: boolean;
  email: string;
}

export interface EnableTwoFactorData {
  email?: string;
}

export interface ConfirmEnableTwoFactorData {
  code: string;
}

export interface DisableTwoFactorData {
  password: string;
}

export const settingsApi = {
  get2FAStatus: async () => {
    const response = await axios.get<ApiResponse<TwoFactorStatus>>('/settings/2fa');
    return response.data;
  },

  enable2FA: async (data?: EnableTwoFactorData) => {
    const response = await axios.post<
      ApiResponse<{ message: string; requiresVerification: boolean }>
    >('/settings/2fa/enable', data || {});
    return response.data;
  },

  confirmEnable2FA: async (data: ConfirmEnableTwoFactorData) => {
    const response = await axios.post<ApiResponse<{ message: string }>>(
      '/settings/2fa/confirm-enable',
      data
    );
    return response.data;
  },

  disable2FA: async (data: DisableTwoFactorData) => {
    const response = await axios.post<ApiResponse<{ message: string }>>(
      '/settings/2fa/disable',
      data
    );
    return response.data;
  },
};
