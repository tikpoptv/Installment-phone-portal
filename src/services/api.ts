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
    // เช็ค network error หรือ backend ดับ
    if (
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.message === 'Network Error'
    ) {
      console.error('Network error intercepted by axios:', error);
      showBackendErrorModal();
    }
    // จัดการเฉพาะการลบ token เมื่อหมดอายุ
    // ไม่แสดง session expired ถ้าอยู่ที่หน้า login (เพราะเป็น login credentials ผิด)
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath.includes('/login');
      
      if (!isLoginPage) {
        window.dispatchEvent(new Event('session-expired'));
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

/**
 * เพิ่ม global error modal เมื่อเชื่อมต่อ backend ไม่ได้
 */
function showBackendErrorModal() {
  window.dispatchEvent(new CustomEvent('error-backend'));
}

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
        showBackendErrorModal();
        throw new Error('เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบหลังบ้าน กรุณาติดต่อผู้ดูแลระบบ');
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
export { API_BASE_URL }; 