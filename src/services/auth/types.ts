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
  };
}

export interface User {
  id: string;
  username: string;
  role: string;
} 