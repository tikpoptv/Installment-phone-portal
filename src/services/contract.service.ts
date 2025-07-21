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

export interface ContractUser {
  id: string;
  first_name: string;
  last_name: string;
}

export interface ContractProduct {
  id: string;
  model_name: string;
  imei: string;
  price: number;
}

export interface ContractDetail {
  id: string;
  category: string;
  total_price: number;
  total_with_interest: number;
  installment_months: number;
  monthly_payment: number;
  status: string;
  start_date: string;
  end_date: string;
  last_payment_date: string | null;
  pdpa_consent_file_url: string | null;
  pdpa_consent_file_filename: string | null;
  created_at: string;
  updated_at: string;
  user: ContractUser | null;
  product: ContractProduct | null;
  down_payment_amount?: number;
  rental_cost?: number;
}

export interface Payment {
  id: string;
  payment_date: string;
  amount: number;
  method: string;
  proof_url: string | null;
  created_at: string;
}

export interface ContractPayment {
  id: string;
  payment_date: string;
  amount: number;
  method: string;
  verify_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Installment {
  id: number;
  installment_number: number;
  due_date: string;
  amount: number;
  amount_paid: number;
  status: 'unpaid' | 'paid' | 'partial' | 'skipped' | 'final_payment';
  paid_at?: string;
  is_final_payment: boolean;
  note?: string;
}

export interface Discount {
  id: number;
  discount_type: 'early_closure' | 'custom_offer';
  discount_amount: number;
  final_amount: number;
  approved_by: string;
  approved_at: string;
  note?: string;
}

export interface ContractPaymentsResponse {
  payments: ContractPayment[];
  installments: Installment[];
  discounts: Discount[];
  remaining_amount: number;
  overdue_months: number;
  total_due_this_month: number;
}

export interface CreateDiscountPayload {
  discount_type: 'early_closure' | 'custom_offer';
  discount_amount: number;
  final_amount: number;
  approved_by?: string;
  note?: string;
}

export async function getContracts(params?: { page?: number; limit?: number; search?: string; status?: string; category?: string; product_name?: string; start_date?: string; end_date?: string; }): Promise<{ items: Contract[]; total: number; page: number; limit: number; total_pages: number; }> {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.search) query.append('search', params.search);
  if (params?.status) query.append('status', params.status);
  if (params?.category) query.append('category', params.category);
  if (params?.product_name) query.append('product_name', params.product_name);
  if (params?.start_date) query.append('start_date', params.start_date);
  if (params?.end_date) query.append('end_date', params.end_date);
  const res = await apiClient.get<{ items: Contract[]; total: number; page: number; limit: number; total_pages: number; }>(`/api/orders?${query.toString()}`);
  return res.data;
}

export async function createContract(payload: Record<string, unknown>) {
  const formData = new FormData();
  formData.append('total_with_interest', payload.total_with_interest?.toString() ?? '0');
  formData.append('installment_months', payload.installment_months?.toString() ?? '0');
  formData.append('monthly_payment', payload.monthly_payment?.toString() ?? '0');
  formData.append('start_date', String(payload.start_date ?? '1970-01-01'));
  formData.append('end_date', String(payload.end_date ?? '1970-01-01'));
  Object.entries(payload).forEach(([key, value]) => {
    if (
      key === 'total_with_interest' ||
      key === 'installment_months' ||
      key === 'monthly_payment' ||
      key === 'start_date' ||
      key === 'end_date'
    ) {
      return;
    }
    if (key === 'pdpa_consent_file' && value && value !== '' && value !== 'null') {
      formData.append(key, value as File);
    } else {
      formData.append(key, value as string);
    }
  });
  return apiClient.post('/api/contracts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

export async function getContractDetail(id: string): Promise<ContractDetail> {
  const res = await apiClient.get<ContractDetail>(`/api/contracts/detail/${id}`);
  return res.data;
}

export async function getContractPayments(contractId: string): Promise<ContractPaymentsResponse> {
  const res = await apiClient.get<ContractPaymentsResponse>(`/api/contracts/${contractId}/payments`);
  return res.data;
}

export async function getPdpaConsentFile(contractId: string, filename: string): Promise<Blob> {
  const res = await apiClient.get<Blob>(
    `/api/contracts/files/pdpa/${contractId}/${filename}`,
    { responseType: 'blob' }
  );
  return res.data;
}

export async function postDiscountToContract(contractId: string, payload: CreateDiscountPayload) {
  return apiClient.post(`/api/contracts/${contractId}/discounts`, payload);
}

export async function updateContractStatus(contractId: string, status: string): Promise<{ id: string; status: string }> {
  const res = await apiClient.put<{ id: string; status: string }>(
    `/api/contracts/${contractId}/status`,
    { status }
  );
  return res.data;
} 