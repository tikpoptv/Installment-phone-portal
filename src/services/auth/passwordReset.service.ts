import { apiClient } from '../api';

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
}

export interface PasswordResetResponse {
  message: string;
}

export interface PasswordResetCheckResponse {
  valid: boolean;
  message: string;
  email?: string;
  expires_at?: string;
}

/**
 * ขอรหัสผ่านรีเซ็ต
 * @param email อีเมลของผู้ใช้
 */
export async function requestPasswordReset(email: string): Promise<PasswordResetResponse> {
  const response = await apiClient.post<PasswordResetResponse>('/api/users/password/reset', {
    email
  });
  return response.data;
}

/**
 * ตรวจสอบสถานะ token
 * @param token รหัสยืนยัน
 */
export async function checkPasswordResetToken(token: string): Promise<PasswordResetCheckResponse> {
  const response = await apiClient.post<PasswordResetCheckResponse>('/api/users/password/reset/check', {
    token
  });
  return response.data;
}

/**
 * ยืนยันการรีเซ็ตรหัสผ่าน
 * @param token รหัสยืนยันจากอีเมล
 * @param password รหัสผ่านใหม่
 */
export async function confirmPasswordReset(token: string, password: string): Promise<PasswordResetResponse> {
  const response = await apiClient.post<PasswordResetResponse>('/api/users/password/reset/confirm', {
    token,
    password
  });
  return response.data;
} 