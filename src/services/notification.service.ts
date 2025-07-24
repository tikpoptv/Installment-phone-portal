import apiClient from './api';

export interface AdminNotification {
  id: number;
  type: string;
  title: string;
  description: string;
  created_at: string;
  status: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  source_file?: string;
  line_number?: number;
}

export interface AdminNotificationSummary {
  total: number;
  by_level: Record<string, number>;
}

export interface AdminNotificationResponse {
  summary: AdminNotificationSummary;
  notifications: AdminNotification[];
  page: number;
  limit: number;
  total_pages: number;
}

export async function getAdminNotifications(params?: { page?: number; limit?: number }): Promise<AdminNotificationResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  const res = await apiClient.get<AdminNotificationResponse>(`/api/admin/notifications${query.toString() ? '?' + query.toString() : ''}`);
  return res.data;
} 