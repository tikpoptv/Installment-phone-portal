import { apiClient } from './api';

export interface CreateStoreBankAccountPayload {
  bank_name: string;
  account_number: string;
  promptpay_id?: string;
  account_name: string;
  owner_id?: string;
  is_default?: boolean;
  remark?: string;
}

export interface StoreBankAccountResponse {
  id: number;
  bank_name: string;
  account_number: string;
  promptpay_id?: string;
  account_name: string;
  owner_id?: string | null;
  is_default: boolean;
  remark?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export async function createStoreBankAccount(payload: CreateStoreBankAccountPayload): Promise<StoreBankAccountResponse> {
  const res = await apiClient.post<StoreBankAccountResponse>('/api/store-bank-accounts', payload);
  return res.data;
}

export async function getStoreBankAccounts(): Promise<StoreBankAccountResponse[]> {
  const res = await apiClient.get<StoreBankAccountResponse[]>('/api/store-bank-accounts');
  return res.data;
}

export async function updateStoreBankAccount(
  id: number | string,
  payload: {
    bank_name: string;
    account_number: string;
    promptpay_id?: string;
    account_name: string;
    owner_id?: string;
    is_default?: boolean;
    remark?: string;
  }
): Promise<{ success: boolean }> {
  const res = await apiClient.put<{ success: boolean }>(`/api/store-bank-accounts/${id}`, payload);
  return res.data;
}

export async function deleteStoreBankAccount(id: number | string): Promise<{ success: boolean }> {
  const res = await apiClient.delete<{ success: boolean }>(`/api/store-bank-accounts/${id}`);
  return res.data;
} 