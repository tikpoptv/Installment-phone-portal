import { apiClient } from './api';

export interface SystemSetting {
  key: string;
  value: string;
  value_type: 'string' | 'integer' | 'decimal' | 'boolean' | 'date' | 'json';
  description?: string;
  is_active?: boolean;
}

export interface SystemSettingResponse {
  key: string;
  value: string;
  value_type: 'string' | 'integer' | 'decimal' | 'boolean' | 'date' | 'json';
  description?: string;
  is_active?: boolean;
  updated_at?: string;
}

export interface MonthlyGoalsDataResponse {
  year: number;
  monthly_sales: number[];
  monthly_due: number[];
}

export async function createSystemSetting(setting: SystemSetting) {
  const res = await apiClient.post('/api/admin/system-settings', setting);
  return res.data;
}

export async function putSystemSetting(key: string, data: Partial<SystemSetting>) {
  const res = await apiClient.put(`/api/admin/system-settings/${key}`, data);
  return res.data;
}

export async function getSystemSettings(): Promise<SystemSettingResponse[]> {
  const res = await apiClient.get<SystemSettingResponse[]>('/api/admin/system-settings');
  return res.data;
}

export async function getMonthlyGoalsData(year?: number): Promise<MonthlyGoalsDataResponse> {
  const res = await apiClient.get<MonthlyGoalsDataResponse>('/api/system/monthly-goals', {
    params: year ? { year } : undefined
  });
  return res.data;
} 