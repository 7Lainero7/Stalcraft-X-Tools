import { api } from "./BaseApi";

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: number;
    email: string;
    username: string;
    role: string;
  };
}

export const login = async (data: { email: string; password: string }): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const register = async (data: { email: string; username: string; password: string }): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const getMe = async (): Promise<AuthResponse['user']> => {
  const response = await api.get('/auth/me');
  return response.data;
};