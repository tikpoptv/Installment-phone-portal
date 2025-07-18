import { apiClient } from '../api';

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  created_at: string;
  is_verified: boolean;
}

export async function getCustomers(params?: { page?: number; limit?: number; search?: string; is_verified?: boolean; }): Promise<{ items: Customer[]; total: number; page: number; limit: number; total_pages: number; }> {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.search) query.append('search', params.search);
  if (params?.is_verified !== undefined) query.append('is_verified', params.is_verified ? 'true' : 'false');
  const res = await apiClient.get<{ items: Customer[]; total: number; page: number; limit: number; total_pages: number; }>(`/api/admin/users?${query.toString()}`);
  return res.data; // { items, total, page, limit, total_pages }
} 