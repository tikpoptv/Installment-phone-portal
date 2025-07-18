import { apiClient } from './api';

export interface IcloudCredential {
  id: string;
  owner_type: 'customer' | 'store';
  icloud_username: string;
  created_at: string;
}

export interface CreateIcloudCredentialPayload {
  owner_type: 'customer' | 'store';
  icloud_username: string;
  icloud_password: string;
  note?: string;
}

export interface IcloudCredentialResponse {
  id: string;
  owner_type: 'customer' | 'store';
  icloud_username: string;
  icloud_password: string;
  created_at: string;
}

export interface IcloudCredentialDetail {
  id: string;
  owner_type: 'customer' | 'store';
  icloud_username: string;
  icloud_password: string;
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateIcloudCredentialPayload {
  owner_type: 'customer' | 'store';
  icloud_username: string;
  icloud_password?: string;
  note?: string;
}

export async function getIcloudCredentials(params?: { page?: number; limit?: number; search?: string; owner_type?: string; }): Promise<{ items: IcloudCredential[]; total: number; page: number; limit: number; total_pages: number; }> {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.search) query.append('search', params.search);
  if (params?.owner_type) query.append('owner_type', params.owner_type);
  const res = await apiClient.get<{ items: IcloudCredential[]; total: number; page: number; limit: number; total_pages: number; }>(`/api/icloud-credentials?${query.toString()}`);
  return res.data;
}

export async function createIcloudCredential(payload: CreateIcloudCredentialPayload): Promise<IcloudCredentialResponse> {
  const res = await apiClient.post<IcloudCredentialResponse>('/api/icloud-credentials', payload);
  return res.data;
}

export async function getIcloudCredentialDetail(id: string): Promise<IcloudCredentialDetail> {
  const res = await apiClient.get<IcloudCredentialDetail>(`/api/icloud-credentials/${id}`);
  return res.data;
}

export async function updateIcloudCredential(id: string, payload: UpdateIcloudCredentialPayload): Promise<IcloudCredentialDetail> {
  const res = await apiClient.put<IcloudCredentialDetail>(`/api/icloud-credentials/${id}`, payload);
  return res.data;
}

export async function deleteIcloudCredential(id: string): Promise<{ success: boolean }> {
  const res = await apiClient.delete<{ success: boolean }>(`/api/icloud-credentials/${id}`);
  return res.data;
} 