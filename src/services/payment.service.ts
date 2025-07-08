import { apiClient } from './api';

export interface Payment {
  id: string;
  contract_id: string;
  payment_date: string;
  amount: number;
  method: string;
  verify_status: string;
  created_at: string;
}

export async function getAllPayments(): Promise<Payment[]> {
  const res = await apiClient.get<Payment[]>('/api/payment');
  return res.data;
} 