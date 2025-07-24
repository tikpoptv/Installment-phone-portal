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

export interface CreatePaymentPayload {
  contract_id: string;
  payment_date: string;
  amount: number;
  method: 'cash' | 'bank_transfer' | 'online';
  proof_file?: File | null;
}

export interface PaymentDetail {
  id: string;
  contract_id: string;
  payment_date: string;
  amount: number;
  method: string;
  proof_file_filename: string | null;
  verify_status: string;
  verify_by?: string | null;
  verify_by_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserPaymentPayload {
  contract_id: string;
  payment_date: string;
  amount: number;
  method: 'cash' | 'bank_transfer' | 'online';
  proof_file?: File | null;
}

export interface UserStoreBankAccountsResponse {
  bank_accounts: Array<{
    bank_name: string;
    account_number: string;
    account_name: string;
  }>;
  promptpay_accounts: Array<{
    promptpay_id: string;
    account_name: string;
  }>;
}

export interface PaymentStatusSummaryItem {
  status: 'paid' | 'unpaid' | 'partial' | 'advance_paid';
  count: number;
  amount: number;
}

export interface PaymentStatusSummaryResponse {
  payment_status_summary: PaymentStatusSummaryItem[];
}

export async function getAllPayments(params?: { page?: number; limit?: number; search?: string; status?: string; method?: string; start_date?: string; end_date?: string; }) {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.search) query.append('search', params.search);
  if (params?.status) query.append('status', params.status);
  if (params?.method) query.append('method', params.method);
  if (params?.start_date) query.append('start_date', params.start_date);
  if (params?.end_date) query.append('end_date', params.end_date);
  const res = await apiClient.get(`/api/payment?${query.toString()}`);
  return res.data; // { items, total, page, limit, total_pages }
}

export async function createPayment(payload: CreatePaymentPayload) {
  const formData = new FormData();
  formData.append('contract_id', payload.contract_id);
  formData.append('payment_date', payload.payment_date);
  formData.append('amount', String(payload.amount));
  formData.append('method', payload.method);
  if (payload.proof_file) {
    formData.append('proof_file', payload.proof_file);
  }
  const res = await apiClient.post('/api/payment', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export async function createUserPayment(payload: CreateUserPaymentPayload) {
  const formData = new FormData();
  formData.append('contract_id', payload.contract_id);
  formData.append('payment_date', payload.payment_date);
  formData.append('amount', String(payload.amount));
  formData.append('method', payload.method);
  if (payload.proof_file) {
    formData.append('proof_file', payload.proof_file);
  }
  const res = await apiClient.post('/api/users/payment', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export async function getPaymentDetail(paymentId: string): Promise<PaymentDetail> {
  const res = await apiClient.get<PaymentDetail>(`/api/payment/${paymentId}`);
  return res.data;
}

export async function getPaymentProofFile(paymentId: string, filename: string): Promise<Blob> {
  const res = await apiClient.get<Blob>(
    `/api/payment/files/proof/${paymentId}/${filename}`,
    { responseType: 'blob' as const }
  );
  return res.data;
}

export async function getUserPaymentProofFile(paymentId: string, filename: string): Promise<Blob> {
  const res = await apiClient.get<Blob>(
    `/api/users/files/payment_proof/${paymentId}/${filename}`,
    { responseType: 'blob' as const }
  );
  return res.data;
}

export async function verifyPayment(paymentId: string, status: 'approved' | 'rejected', admin_id: string): Promise<void> {
  await apiClient.post(`/api/payment/${paymentId}/verify`, { status, admin_id });
}

export async function getUserStoreBankAccounts(): Promise<UserStoreBankAccountsResponse> {
  const res = await apiClient.get<UserStoreBankAccountsResponse>('/api/user/store-bank-accounts');
  return res.data;
}

export async function getPaymentStatusSummary(params?: { year?: number; months?: string; }): Promise<PaymentStatusSummaryResponse> {
  const query = new URLSearchParams();
  if (params?.year) query.append('year', params.year.toString());
  if (params?.months) query.append('months', params.months);
  const res = await apiClient.get<PaymentStatusSummaryResponse>(`/api/payment/status-summary?${query.toString()}`);
  return res.data;
} 