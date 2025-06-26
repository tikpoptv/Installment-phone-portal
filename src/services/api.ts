import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_TIMEOUT = 30000; // 30 seconds
const GET_FETCH_ERROR = import.meta.env.VITE_GET_FETCH_ERROR === 'true';

// Types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// สร้าง axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_TIMEOUT,
});

// เพิ่ม interceptor สำหรับเพิ่ม token ในทุก request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// เพิ่ม interceptor สำหรับจัดการ error
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // จัดการเฉพาะการลบ token เมื่อหมดอายุ
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error.response?.data);
  }
);

// สร้าง wrapper functions สำหรับ HTTP methods
export const apiClient = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await api.get<T>(url, config);
      return {
        data: response.data,
        status: response.status,
        message: response.statusText
      };
    } catch (err) {
      if (GET_FETCH_ERROR) {
        window.location.replace('/error');
        throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาติดต่อผู้ดูแลระบบให้ดำเนินการแก้ไข');
      } else {
        throw err;
      }
    }
  },

  post: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.post<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
      message: response.statusText
    };
  },

  put: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.put<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
      message: response.statusText
    };
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.delete<T>(url, config);
    return {
      data: response.data,
      status: response.status,
      message: response.statusText
    };
  }
};

export default apiClient; 