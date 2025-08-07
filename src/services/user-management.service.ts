import { apiClient } from './api';

// User Management API Interfaces
export interface DeletedUser {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface DeletedUsersResponse {
  users: DeletedUser[];
  count: number;
}

export interface DeleteUserResponse {
  message: string;
  user_id: string;
}

export interface RestoreUserResponse {
  message: string;
  user_id: string;
}

/**
 * ลบผู้ใช้ (Soft Delete)
 * @param userId ID ของผู้ใช้ที่ต้องการลบ
 * @returns DeleteUserResponse
 */
export async function deleteUser(userId: string): Promise<DeleteUserResponse> {
  const res = await apiClient.delete<DeleteUserResponse>(`/api/admin/users/${userId}`);
  return res.data;
}

/**
 * กู้คืนผู้ใช้ที่ถูกลบ
 * @param userId ID ของผู้ใช้ที่ต้องการกู้คืน
 * @returns RestoreUserResponse
 */
export async function restoreUser(userId: string): Promise<RestoreUserResponse> {
  const res = await apiClient.post<RestoreUserResponse>(`/api/admin/users/${userId}/restore`);
  return res.data;
}

/**
 * ดูรายการผู้ใช้ที่ถูกลบ
 * @returns DeletedUsersResponse
 */
export async function getDeletedUsers(): Promise<DeletedUsersResponse> {
  const res = await apiClient.get<DeletedUsersResponse>('/api/admin/users/deleted');
  return res.data;
} 