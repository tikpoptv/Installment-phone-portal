import { apiClient } from './api';

export interface Contract {
  id: string;
  user_name: string;
  product_name: string;
  category: string;
  total_price: number;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export async function getContracts(): Promise<Contract[]> {
  const res = await apiClient.get<Contract[]>('/api/contracts');
  return res.data;
} 