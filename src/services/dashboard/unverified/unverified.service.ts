import { apiClient } from '../../api';

export interface UnverifiedUser {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  created_at: string;
}

export async function getUnverifiedUsers(): Promise<UnverifiedUser[]> {
  const res = await apiClient.get<UnverifiedUser[]>('/api/admin/users/unverified');
  return res.data;
} 