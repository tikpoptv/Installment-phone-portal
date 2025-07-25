import { apiClient } from './api';

export interface OutstandingInstallment {
  installment_number: number;
  due_date: string;
}

export interface TrackingOrder {
  contract_id: string;
  user_id: string;
  user_name: string;
  product_name: string;
  status: string;
  total_price: number;
  outstanding: number;
  outstanding_count: number;
  overdue_count: number;
  next_due_date: string;
  outstanding_installments: OutstandingInstallment[];
}

export interface TrackingOrdersResponse {
  orders: TrackingOrder[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  filters: Record<string, string | number | null>;
}

export interface GetTrackingOrdersParams {
  page?: number;
  limit?: number;
  user_id?: string;
  status?: string;
  search?: string;
  next_due_date_from?: string;
  next_due_date_to?: string;
  outstanding_min?: number;
  outstanding_max?: number;
  outstanding_count_min?: number;
  outstanding_count_max?: number;
  day_of_month?: number;
  overdue_count_min?: number;
  overdue_count_max?: number;
}

export async function getTrackingOrders(params?: GetTrackingOrdersParams): Promise<TrackingOrdersResponse> {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });
  }
  const res = await apiClient.get<TrackingOrdersResponse>(`/api/tracking/orders?${query.toString()}`);
  return res.data;
} 