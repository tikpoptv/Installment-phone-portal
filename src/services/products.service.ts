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
  store_locked: boolean;
}

export interface ProductContract {
  contract_id: string;
  status: string;
}

export interface BindIcloudCredentialPayload {
  mode?: 'single' | 'both';
  // single
  type?: 'store' | 'customer';
  icloud_credential_id?: string;
  icloud_status?: 'lock' | 'unlock';
  // both
  store_icloud_credential_id?: string | null;
  store_icloud_status?: 'lock' | 'unlock';
  customer_icloud_credential_id?: string | null;
  customer_icloud_status?: 'lock' | 'unlock';
}

export interface ProductDetailWithIcloud extends Product {
  icloud_credential_id?: string | null;
}

export interface ProductDetailFull extends ProductDetailWithIcloud {
  owner_username?: string;
  store_locked: boolean;
}

export interface UpdateProductPayload {
  status: string;
  imei?: string;
  price?: number;
  cost_price?: number;
  remark?: string;
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

export async function getProductDetail(productId: string): Promise<ProductDetailFull> {
  const res = await apiClient.get<ProductDetailFull>(`/api/products/${productId}/detail`);
  return res.data;
}

export async function getProductImageBlob(productId: string, filename: string): Promise<Blob> {
  const res = await apiClient.get(`/api/products/files/product_image/${productId}/${filename}`, {
    responseType: 'blob',
  });
  return res.data as Blob;
}

export async function getContractsByProductId(productId: string): Promise<ProductContract[]> {
  const res = await apiClient.get<ProductContract[]>(`/api/products/${productId}/contract`);
  // เรียง contract_id จากใหม่ไปเก่า (สมมติ contract_id เป็น CT00012, CT00011, ...)
  return res.data.sort((a, b) => b.contract_id.localeCompare(a.contract_id));
}

export async function bindIcloudCredentialToProduct(productId: string, payload: BindIcloudCredentialPayload) {
  const res = await apiClient.post(`/api/products/${productId}/icloud-credential`, payload);
  return res.data;
}

export async function updateProduct(productId: string, payload: UpdateProductPayload) {
  const res = await apiClient.post(`/api/products/${productId}/edit`, payload);
  return res.data;
}

export async function setProductStoreLocked(productId: string, locked: boolean): Promise<{ id: string; store_locked: boolean }> {
  const res = await apiClient.post<{ id: string; store_locked: boolean }>(
    `/api/products/${productId}/store-locked`,
    { store_locked: locked }
  );
  return res.data;
} 