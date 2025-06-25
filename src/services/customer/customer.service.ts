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

export async function getCustomers(): Promise<Customer[]> {
  const res = await apiClient.get<Customer[]>('/api/admin/users');
  return res.data;
} 