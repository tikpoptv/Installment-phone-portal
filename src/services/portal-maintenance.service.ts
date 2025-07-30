import { apiClient } from './api';

export interface PortalMaintenanceResponse {
  key: string;
  value: string;
  value_type: 'string' | 'integer' | 'decimal' | 'boolean' | 'date' | 'json';
  description?: string;
  is_active?: boolean;
  updated_at?: string;
}

export async function getPortalMaintenance(): Promise<PortalMaintenanceResponse | null> {
  try {
    const res = await apiClient.get<PortalMaintenanceResponse>('/api/system/portal-maintenance');
    return res.data;
  } catch (error: unknown) {
    // ถ้าเป็น error "PortalMaintenance setting not found" ให้ return null
    if (error && typeof error === 'object' && 'error' in error && error.error === 'PortalMaintenance setting not found') {
      return null;
    }
    // ถ้าเป็น error อื่นๆ ให้ throw ต่อไป
    throw error;
  }
} 