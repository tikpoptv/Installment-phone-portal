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
  category?: string; // เพิ่ม field category เพื่อรองรับหมวดหมู่งวด เช่น down_payment, rent
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
  
  // เพิ่มข้อมูลตาม API Specification ใหม่
  if (payload.user_id) formData.append('user_id', payload.user_id as string);
  if (payload.product_id) formData.append('product_id', payload.product_id as string);
  if (payload.category) formData.append('category', payload.category as string);
  if (payload.total_price) formData.append('total_price', payload.total_price as string);
  if (payload.down_payment_amount) formData.append('down_payment_amount', payload.down_payment_amount as string);
  if (payload.rental_cost) formData.append('rental_cost', payload.rental_cost as string);
  if (payload.total_with_interest) formData.append('total_with_interest', payload.total_with_interest as string);
  if (payload.installment_months) formData.append('installment_months', payload.installment_months as string);
  if (payload.monthly_payment) formData.append('monthly_payment', payload.monthly_payment as string);
  if (payload.status) formData.append('status', payload.status as string);
  if (payload.start_date) formData.append('start_date', payload.start_date as string);
  if (payload.end_date) formData.append('end_date', payload.end_date as string);
  
  // จัดการไฟล์ PDPA
  if (payload.pdpa_consent_file && payload.pdpa_consent_file !== '' && payload.pdpa_consent_file !== 'null') {
    formData.append('pdpa_consent_file', payload.pdpa_consent_file as File);
  }
  
  return apiClient.post('/api/contracts/transaction', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

export async function createMinimalContract(userId: string, productId: string) {
  return apiClient.post('/api/contracts/minimal', {
    user_id: userId,
    product_id: productId
  });
}

export async function updateContractTransaction(contractId: string, payload: Record<string, unknown>) {
  const formData = new FormData();
  
  // เพิ่มข้อมูลตาม API Specification ใหม่
  if (payload.user_id) formData.append('user_id', payload.user_id as string);
  if (payload.product_id) formData.append('product_id', payload.product_id as string);
  if (payload.category) formData.append('category', payload.category as string);
  if (payload.total_price) formData.append('total_price', payload.total_price as string);
  if (payload.down_payment_amount) formData.append('down_payment_amount', payload.down_payment_amount as string);
  if (payload.rental_cost) formData.append('rental_cost', payload.rental_cost as string);
  if (payload.total_with_interest) formData.append('total_with_interest', payload.total_with_interest as string);
  if (payload.installment_months) formData.append('installment_months', payload.installment_months as string);
  if (payload.monthly_payment) formData.append('monthly_payment', payload.monthly_payment as string);
  if (payload.status) formData.append('status', payload.status as string);
  if (payload.start_date) formData.append('start_date', payload.start_date as string);
  if (payload.end_date) formData.append('end_date', payload.end_date as string);
  
  // จัดการไฟล์ PDPA
  if (payload.pdpa_consent_file && payload.pdpa_consent_file !== '' && payload.pdpa_consent_file !== 'null') {
    formData.append('pdpa_consent_file', payload.pdpa_consent_file as File);
  }
  
  return apiClient.put(`/api/contracts/${contractId}/transaction`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

export async function deleteMinimalContract(contractId: string) {
  return apiClient.delete(`/api/contracts/${contractId}/minimal`);
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