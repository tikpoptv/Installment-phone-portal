import { apiClient } from './api';

export interface DashboardSummary {
  sales: {
    today: number;
    yesterday: number;
    percent_change: number;
    details: {
      payment_id: string;
      user_id: string;
      user_name: string;
      contract_id: string;
      amount: number;
      payment_date: string;
    }[];
  };
  outstanding: {
    today: number;
    yesterday: number;
    percent_change: number;
    details: {
      user_id: string;
      user_name: string;
      contract_id: string;
      outstanding_amount: number;
      due_date?: string; // เพิ่ม field due_date เพื่อรองรับข้อมูลจาก backend
      overdue_count?: number; // เพิ่ม field overdue_count ในแต่ละ detail
    }[];
  };
  orders: {
    today: number;
    yesterday: number;
    percent_change: number;
    details: {
      contract_id: string;
      user_id: string;
      user_name: string;
      total_price: number;
      status: string;
      created_at: string;
    }[];
  };
  new_customers: {
    today: number;
    yesterday: number;
    percent_change: number;
    details: {
      user_id: string;
      user_name: string;
      phone_number: string;
      created_at: string;
    }[];
  };
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const res = await apiClient.get<DashboardSummary>('/api/admin/dashboard-summary');
  return res.data;
} 