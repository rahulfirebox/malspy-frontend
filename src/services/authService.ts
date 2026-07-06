import apiClient from './apiClient';
import { API } from '@/lib/apiEndpoints';
import { unwrapApiData } from '@/lib/apiUtils';
import { useAuthStore } from '@/stores/authStore';
import type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '@/lib/schemas/auth';
import type { LoginResponse, RegisterResponse, User } from '@/types';

export const authService = {
  async login(data: LoginInput): Promise<LoginResponse> {
    const res = await apiClient.post(API.auth.login, data);
    return unwrapApiData<LoginResponse>(res.data);
  },

  async register(data: RegisterInput): Promise<RegisterResponse> {
    const res = await apiClient.post<RegisterResponse>(API.auth.register, data);
    return res.data;
  },

  async forgotPassword(data: ForgotPasswordInput): Promise<void> {
    await apiClient.post(API.auth.forgotPassword, data);
  },

  async resetPassword(token: string, data: ResetPasswordInput): Promise<void> {
    await apiClient.post(API.auth.resetPassword, { token, ...data });
  },

  async verifyEmail(token: string): Promise<void> {
    await apiClient.post(API.auth.verifyEmail, { token });
  },

  async refresh(refreshToken: string): Promise<{ access: string; refresh?: string }> {
    const res = await apiClient.post(API.auth.refresh, { refresh: refreshToken });
    return unwrapApiData<{ access: string; refresh?: string }>(res.data);
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(API.auth.logout);
    } catch (error) {
      throw error;
    } finally {
      useAuthStore.getState().clearAuth();
    }
  },

  async getMe(): Promise<User> {
    const res = await apiClient.get(API.auth.me);
    return unwrapApiData<User>(res.data);
  },

  async updateMe(data: { name: string; notify_email: boolean }): Promise<User> {
    const res = await apiClient.patch<User>(API.auth.me, data);
    return res.data;
  },
};
