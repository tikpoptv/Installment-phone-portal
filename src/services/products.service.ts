import { apiClient } from './api';

export interface CreateProductPayload {
  phone_model_id: string;
  status?: string;
  imei?: string;
  price: number;
  cost_price?: number;
  available_stock?: number;
  icloud_status: string;
  owner_id?: string;
  remark?: string;
  images: File[];
}

export interface ProductResponse {
  id: string;
  status: string;
  imei: string;
  price: number;
  icloud_status: string;
  created_at: string;
  // ... อื่น ๆ ตาม schema จริง
}

export interface Product {
  id: string;
  model_name: string;
  status: string;
  imei: string;
  price: number;
  icloud_status: string;
  remark: string;
  created_at: string;
}

export async function createProduct(payload: CreateProductPayload): Promise<ProductResponse> {
  const formData = new FormData();
  formData.append('phone_model_id', payload.phone_model_id);
  if (payload.status) formData.append('status', payload.status);
  if (payload.imei) formData.append('imei', payload.imei);
  formData.append('price', String(payload.price));
  if (payload.cost_price !== undefined) formData.append('cost_price', String(payload.cost_price));
  if (payload.available_stock !== undefined) formData.append('available_stock', String(payload.available_stock));
  formData.append('icloud_status', payload.icloud_status);
  if (payload.owner_id) formData.append('owner_id', payload.owner_id);
  if (payload.remark) formData.append('remark', payload.remark);
  payload.images.forEach(img => formData.append('images', img));

  const res = await apiClient.post<ProductResponse>('/api/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function getProducts(): Promise<Product[]> {
  const res = await apiClient.get<Product[]>('/api/products');
  return res.data;
} 