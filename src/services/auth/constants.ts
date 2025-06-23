export const AUTH_ENDPOINTS = {
  login: '/api/admin/login',
  userLogin: '/api/users/login',
} as const;

export const AUTH_STORAGE_KEYS = {
  token: 'auth_token',
  user: 'auth_user',
} as const; 