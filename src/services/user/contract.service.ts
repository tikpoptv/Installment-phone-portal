import { apiClient } from '../api';

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
  discounts: {
    id: number;
    discount_type: string;
    discount_amount: number;
    final_amount: number;
    approved_by: string;
    approved_at: string;
    note?: string;
  }[];
}

export interface ContractDetailType {
  id: string;
  category: string;
  installment_months: number;
  monthly_payment: number;
  status: string;
  start_date: string;
  end_date: string;
  last_payment_date: string;
  created_at: string;
  updated_at: string;
  product: {
    id: string;
    model_name: string;
    imei: string;
    price: number;
    available_stock: number;
    product_image_filenames: string[];
  };
  payments: {
    id: string;
    payment_date: string;
    amount: number;
    method: string;
    proof_file_filename: string | null;
    verify_status: string;
    created_at: string;
  }[];
  down_payment_amount: number;
  remaining_amount?: number;
  overdue_months?: number;
  total_due_this_month?: number;
  discounts?: {
    id: number;
    discount_type: string;
    discount_amount: number;
    final_amount: number;
    approved_by: string;
    approved_at: string;
    note?: string;
  }[];
}

export interface UserContractPaymentsResponse {
  remaining_balance: number;
  monthly_payment: number;
  paid_installments: number;
  last_payment_date: string | null;
  payments: {
    id: string;
    payment_date: string;
    amount: number;
    method: string;
    proof_file_filename: string | null;
    verify_status: string;
    created_at: string;
  }[];
  installments: {
    id: number;
    installment_number: number;
    due_date: string;
    amount: number;
    amount_paid: number;
    status: string;
    paid_at?: string;
    is_final_payment: boolean;
    note?: string;
    category?: string; // เพิ่ม field category เพื่อรองรับหมวดหมู่งวด เช่น down_payment, rent
  }[];
  overdue_amount?: number; // เพิ่ม field overdue_amount เพื่อรองรับข้อมูลจาก backend
}

export async function getUserContracts(userId: string): Promise<UserContract[]> {
  const res = await apiClient.get<UserContract[]>(`/api/users/${userId}/contracts`);
  return res.data;
}

export async function getUserContractDetail(contractId: string): Promise<ContractDetailType> {
  const res = await apiClient.get<ContractDetailType>(
    `/api/users/contracts/${contractId}/detail`
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

export async function getUserContractPayments(contractId: string): Promise<UserContractPaymentsResponse> {
  const res = await apiClient.get<UserContractPaymentsResponse>(`/api/users/contracts/${contractId}/payments`);
  return res.data;
} 