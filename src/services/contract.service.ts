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