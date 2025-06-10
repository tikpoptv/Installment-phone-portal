export const AUTH_ENDPOINTS = {
  login: '/api/admin/login',
} as const;

export const AUTH_STORAGE_KEYS = {
  token: 'auth_token',
  user: 'auth_user',
} as const; 