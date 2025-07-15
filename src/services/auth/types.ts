export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expires_in: number;
  user: {
    id: string;
    username: string;
    role: string;
    is_locked?: boolean;
  };
}

export interface UserLoginRequest {
  phone_number: string;
  password: string;
}

export interface UserLoginResponse {
  token: string;
  expires_in: number;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
  };
}

export interface User {
  id: string;
  username: string;
  role: string;
} 