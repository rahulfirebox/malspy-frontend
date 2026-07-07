import apiClient from './apiClient';
import { API } from '@/lib/apiEndpoints';
import {
  unwrapApiData,
  normalizeAuthTokens,
  extractUserFromAuthPayload,
} from '@/lib/apiUtils';
import { useAuthStore } from '@/stores/authStore';
import type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '@/lib/schemas/auth';
import type { LoginResponse, RegisterResponse, User } from '@/types';

export interface LoginResult extends LoginResponse {
  user?: User;
}

export const authService = {
  async login(data: LoginInput): Promise<LoginResult> {
    const res = await apiClient.post(API.auth.login, data);
    const tokens = normalizeAuthTokens(res.data);
    const user = extractUserFromAuthPayload(res.data) ?? undefined;
    return { ...tokens, user };
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
    return normalizeAuthTokens(res.data);
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
    return extractUserFromAuthPayload(res.data) ?? unwrapApiData<User>(res.data);
  },

  async updateMe(data: { name: string; notify_email: boolean }): Promise<User> {
    const res = await apiClient.patch(API.auth.me, data);
    return extractUserFromAuthPayload(res.data) ?? unwrapApiData<User>(res.data);
  },
};
