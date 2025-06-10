import api from '../api';
import type { LoginResponse } from './types';

const AUTH_ENDPOINT = '/api/admin/login';

const STORAGE_KEYS = {
  token: 'auth_token',
  expiresIn: 'auth_expires_in',
  user: 'auth_user'
} as const;

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(AUTH_ENDPOINT, { username, password });
    
    // เก็บข้อมูลทั้งหมดที่ได้จาก response
    localStorage.setItem(STORAGE_KEYS.token, response.data.token);
    localStorage.setItem(STORAGE_KEYS.expiresIn, response.data.expires_in.toString());
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(response.data.user));
    
    return response.data;
  },

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.token);
  },

  getUser(): LoginResponse['user'] | null {
    const user = localStorage.getItem(STORAGE_KEYS.user);
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    const expiresIn = localStorage.getItem(STORAGE_KEYS.expiresIn);
    
    if (!token || !expiresIn) return false;
    
    // ตรวจสอบว่า token หมดอายุหรือยัง
    const expiresAt = parseInt(expiresIn) * 1000; // แปลงเป็น milliseconds
    return Date.now() < expiresAt;
  }
}; 