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

export async function getProducts(params?: { page?: number; limit?: number; search?: string; product_id?: string; status?: string; icloud_status?: string; store_locked?: boolean; min_price?: number; max_price?: number; }): Promise<{ items: Product[]; total: number; page: number; limit: number; total_pages: number; }> {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.search) query.append('search', params.search);
  if (params?.product_id) query.append('product_id', params.product_id);
  if (params?.status) query.append('status', params.status);
  if (params?.icloud_status) query.append('icloud_status', params.icloud_status);
  if (params?.store_locked !== undefined && params?.store_locked !== null) query.append('store_locked', params.store_locked.toString());
  if (params?.min_price !== undefined && params?.min_price !== null) query.append('min_price', params.min_price.toString());
  if (params?.max_price !== undefined && params?.max_price !== null) query.append('max_price', params.max_price.toString());
  const res = await apiClient.get<{ items: Product[]; total: number; page: number; limit: number; total_pages: number; }>(`/api/products?${query.toString()}`);
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

export async function getAvailableProducts(): Promise<Product[]> {
  const res = await apiClient.get<Product[]>('/api/products/available');
  return res.data;
}

export interface ProductStockSummaryItem {
  id: number;
  name: string;
  stock: number;
  status: 'normal' | 'warning' | 'error';
}

export async function getStockSummary(): Promise<ProductStockSummaryItem[]> {
  try {
    const res = await apiClient.get<ProductStockSummaryItem[]>('/api/products/stock-summary');
    return res.data;
  } catch (error) {
    console.error('Error fetching stock summary:', error);
    // Return empty array เมื่อเกิด error
    return [];
  }
} 