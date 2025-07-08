import { apiClient } from '../api';
import type { ContractDetailType } from '../../pages/user/dashboard/ContractDetailModal';

export interface UserContract {
  id: string;
  user_name: string;
  product_name: string;
  category: string;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  current_installment: number;
  due_date: string;
  month_status: string;
  last_payment_date: string;
}

export async function getUserContracts(userId: string): Promise<UserContract[]> {
  const res = await apiClient.get<UserContract[]>(`/api/users/${userId}/contracts`);
  return res.data;
}

export async function getUserContractDetail(contractId: string, token: string): Promise<ContractDetailType> {
  const res = await apiClient.get<ContractDetailType>(
    `/api/users/contracts/${contractId}/detail`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

export async function getUserProductImage(productId: string, filename: string): Promise<Blob> {
  const res = await apiClient.get<Blob>(
    `/api/users/files/product_image/${productId}/${filename}`,
    { responseType: 'blob' as const }
  );
  return res.data;
} 