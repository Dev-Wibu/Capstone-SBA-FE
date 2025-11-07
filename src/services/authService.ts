import axios from 'axios';
import type { LoginRequest, LoginResponse, ProfileResponse, User } from '@/interfaces';

// Lấy base URL từ Vite env (VITE_API_BASE_URL). Nếu không có, fallback về localhost
const AUTH_API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8080';

console.log('🌐 [AUTH_SERVICE] API Base URL:', AUTH_API_BASE_URL);
console.log('🌐 [AUTH_SERVICE] Raw env:', import.meta.env.VITE_API_BASE_URL);

// Tạo axios instance riêng cho auth (không cần token)
const authApi = axios.create({
  baseURL: AUTH_API_BASE_URL,
  timeout: 30000,
});

// Request interceptor cho auth API
authApi.interceptors.request.use(
  (config) => {
    console.log('📤 [AUTH_SERVICE] Outgoing request:', {
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      method: config.method,
      headers: config.headers
    });
    
    // Thêm header skip ngrok warning
    config.headers['ngrok-skip-browser-warning'] = 'any-value';
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
  (error) => {
    console.error('❌ [AUTH_SERVICE] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
authApi.interceptors.response.use(
  (response) => {
    console.log('📥 [AUTH_SERVICE] Response received:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ [AUTH_SERVICE] Response error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// ==================== AUTH STORAGE ====================

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

/**
 * Lưu user data vào localStorage (sau khi fetch profile)
 */
export const saveUserData = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Lấy access token từ localStorage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Lấy refresh token từ localStorage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Lấy user data từ localStorage
 */
export const getStoredUser = (): User | null => {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
};

/**
 * Xóa toàn bộ auth data từ localStorage
 */
export const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// ==================== AUTH API CALLS ====================

/**
 * Login API
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await authApi.post<LoginResponse>('/api/auth/login', credentials);
  
  // Lưu tokens sau khi login thành công (không có user data trong response)
  localStorage.setItem(TOKEN_KEY, response.data.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
  
  return response.data;
};

/**
 * Fetch user profile (call after login)
 */
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
  
  // Lưu user data vào localStorage
  const user: User = response.data;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  
  return user;
};

/**
 * Logout (client-side only - xóa tokens)
 */
export const logout = (): void => {
  clearAuthData();
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  const response = await authApi.post<{ accessToken: string }>('/api/auth/refresh', {
    refreshToken,
  });
  
  // Cập nhật access token mới
  localStorage.setItem(TOKEN_KEY, response.data.accessToken);
  
  return response.data.accessToken;
};

/**
 * Kiểm tra xem user đã login chưa
 */
export const isAuthenticated = (): boolean => {
  return !!getAccessToken() && !!getStoredUser();
};
