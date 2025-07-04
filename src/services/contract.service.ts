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
}

export interface Payment {
  id: string;
  payment_date: string;
  amount: number;
  method: string;
  proof_url: string | null;
  created_at: string;
}

export async function getContracts(): Promise<Contract[]> {
  const res = await apiClient.get<Contract[]>('/api/contracts');
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

export async function getContractPayments(contractId: string): Promise<Payment[]> {
  const res = await apiClient.get<Payment[]>(`/api/contracts/${contractId}/payments`);
  return res.data;
}

export async function getPdpaConsentFile(contractId: string, filename: string): Promise<Blob> {
  const res = await apiClient.get<Blob>(
    `/api/contracts/files/pdpa/${contractId}/${filename}`,
    { responseType: 'blob' }
  );
  return res.data;
} 