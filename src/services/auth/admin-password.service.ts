import apiClient from '../api';

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export async function changeAdminPassword(payload: ChangePasswordPayload): Promise<ChangePasswordResponse> {
  const res = await apiClient.put<ChangePasswordResponse>('/api/admin/password', payload);
  return res.data;
} 