import { apiClient } from './api';

export interface PortalMaintenanceResponse {
  key: string;
  value: string;
  value_type: 'string' | 'integer' | 'decimal' | 'boolean' | 'date' | 'json';
  description?: string;
  is_active?: boolean;
  updated_at?: string;
}

export async function getPortalMaintenance(): Promise<PortalMaintenanceResponse> {
  const res = await apiClient.get<PortalMaintenanceResponse>('/api/system/portal-maintenance');
  return res.data;
} 