import { apiClient } from './api';

export interface PhoneModel {
  id: string;
  model_name: string;
  created_at: string;
  updated_at?: string;
}

export async function getPhoneModels(): Promise<PhoneModel[]> {
  const res = await apiClient.get<PhoneModel[]>('/api/phone-models');
  return res.data;
}

export async function createPhoneModel(model_name: string): Promise<PhoneModel> {
  const res = await apiClient.post<PhoneModel>('/api/phone-models', { model_name });
  return res.data;
}

export async function updatePhoneModel(id: string, model_name: string): Promise<PhoneModel> {
  const res = await apiClient.put<PhoneModel>(`/api/phone-models/${id}`, { model_name });
  return res.data;
} 