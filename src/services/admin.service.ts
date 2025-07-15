import { apiClient } from './api';

export interface Admin {
  id: string;
  username: string;
  role: 'superadmin' | 'staff';
  is_deleted: boolean;
  is_locked: boolean;
  is_creating: boolean;
  create_token: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterAdminPayload {
  username: string;
  role: 'superadmin' | 'staff';
}

export interface RegisterAdminResponse {
  id: string;
  username: string;
  role: 'superadmin' | 'staff';
  created_at: string;
  create_token: string;
}

export interface CheckCreateTokenResponse {
  valid: boolean;
  username?: string;
  role?: string;
}

export interface ActivateAdminResponse {
  id: string;
  username: string;
  role: 'superadmin' | 'staff';
}

export interface EditAdminModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: { username: string; role: 'superadmin' | 'staff' }) => void;
  adminId: string;
  initialUsername: string;
  initialRole: 'superadmin' | 'staff';
  isSubmitting?: boolean;
  errorMessage?: string;
}

export async function getAdmins(): Promise<Admin[]> {
  const res = await apiClient.get<Admin[]>('/api/admins');
  return res.data;
}

export async function registerAdmin(payload: RegisterAdminPayload): Promise<RegisterAdminResponse> {
  const res = await apiClient.post<RegisterAdminResponse>('/api/admin/register', payload);
  return res.data;
}

export async function checkCreateToken(token: string): Promise<CheckCreateTokenResponse> {
  const res = await apiClient.get<CheckCreateTokenResponse>(`/api/admin/check-create-token?token=${encodeURIComponent(token)}`);
  return res.data;
}

export async function activateAdmin(token: string, password: string): Promise<ActivateAdminResponse> {
  const res = await apiClient.post<ActivateAdminResponse>('/api/admin/activate', { token, password });
  return res.data;
}

export async function updateAdmin(adminId: string, payload: { username: string; role: 'superadmin' | 'staff' }) {
  const res = await apiClient.post<{ id: string; username: string; role: 'superadmin' | 'staff' }>(`/api/admins/${adminId}/edit`, payload);
  return res.data;
}

export async function lockAdmin(adminId: string, isLocked: boolean): Promise<{ id: string; is_locked: boolean }> {
  const res = await apiClient.post<{ id: string; is_locked: boolean }>(
    `/api/admins/${adminId}/lock`,
    { is_locked: isLocked }
  );
  return res.data;
} 