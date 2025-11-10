import axios from 'axios';
import type { LoginRequest, LoginResponse, ProfileResponse, User } from '@/interfaces';

const AUTH_API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL as string) || 'https://66b7b94833d1.ngrok-free.app';

// Tạo axios instance riêng cho auth (không cần token)
const authApi = axios.create({
  baseURL: AUTH_API_BASE_URL,
  timeout: 30000,
});

authApi.interceptors.request.use(
  (config) => {
    config.headers['ngrok-skip-browser-warning'] = 'any-value';
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

authApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export const saveUserData = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const getStoredUser = (): User | null => {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
};

export const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await authApi.post<LoginResponse>('/api/auth/login', credentials);
  
  // Lưu tokens sau khi login thành công (không có user data trong response)
  localStorage.setItem(TOKEN_KEY, response.data.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
  
  return response.data;
};

export const fetchProfile = async (): Promise<User> => {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('No access token available');
  }
  
  const response = await authApi.get<ProfileResponse>('/api/auth/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  const user: User = response.data;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  
  return user;
};

export const logout = (): void => {
  clearAuthData();
};

export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  const response = await authApi.post<{ accessToken: string }>('/api/auth/refresh', {
    refreshToken,
  });
  
  localStorage.setItem(TOKEN_KEY, response.data.accessToken);
  
  return response.data.accessToken;
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken() && !!getStoredUser();
};
