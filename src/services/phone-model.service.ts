import { apiClient } from './api';

export interface PhoneModel {
  id: string;
  model_name: string;
  created_at: string;
  updated_at?: string;
}

export async function getPhoneModels(): Promise<PhoneModel[]> {
  const res = await apiClient.get<{ data: PhoneModel[]; message?: string }>('/api/phone-models');
  // รองรับ response format ใหม่ {"data":[],"message":"No data"}
  if (res.data && typeof res.data === 'object' && 'data' in res.data) {
    return res.data.data || [];
  }
  // รองรับ response format เดิม (array โดยตรง)
  return Array.isArray(res.data) ? res.data : [];
}

export async function createPhoneModel(model_name: string): Promise<PhoneModel> {
  const res = await apiClient.post<PhoneModel>('/api/phone-models', { model_name });
  return res.data;
}

export async function updatePhoneModel(id: string, model_name: string): Promise<PhoneModel> {
  const res = await apiClient.put<PhoneModel>(`/api/phone-models/${id}`, { model_name });
  return res.data;
} 