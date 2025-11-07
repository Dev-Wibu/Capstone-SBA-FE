import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginRequest } from '@/interfaces';
import * as authService from '@/services/authService';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialized = useRef(false);

  console.log('🔄 [AUTH_PROVIDER] State:', { 
    hasUser: !!user, 
    isLoading, 
    isAuthenticated: !!user,
    isInitialized: isInitialized.current
  });

  // Khôi phục user từ localStorage khi app khởi động
  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (isInitialized.current) {
      console.log('⚠️ [AUTH_CONTEXT] Already initialized - skipping');
      return;
    }
    
    isInitialized.current = true;
    
    console.log('🔄 [AUTH_CONTEXT] Initializing - Checking stored auth data');
    const storedUser = authService.getStoredUser();
    const token = authService.getAccessToken();
    
    console.log('📦 [AUTH_CONTEXT] Stored data found:', {
      hasUser: !!storedUser,
      hasToken: !!token,
      userId: storedUser?.id,
      userEmail: storedUser?.email,
      userRole: storedUser?.role
    });
    
    if (storedUser && token) {
      console.log('✅ [AUTH_CONTEXT] Restoring user session:', storedUser.email);
      setUser(storedUser);
    } else {
      console.log('❌ [AUTH_CONTEXT] No valid session found');
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      console.log('🔐 [AUTH] Starting login with credentials:', { email: credentials.email });
      
      // Bước 1: Login để lấy tokens
      const loginResponse = await authService.login(credentials);
      console.log('✅ [AUTH] Login successful, received tokens:', {
        hasAccessToken: !!loginResponse.accessToken,
        hasRefreshToken: !!loginResponse.refreshToken
      });
      
      // Bước 2: Fetch profile để lấy thông tin user
      console.log('👤 [AUTH] Fetching user profile...');
      const userData = await authService.fetchProfile();
      console.log('✅ [AUTH] Profile fetched successfully:', {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        fullName: userData.fullName
      });
      
      // Bước 3: Cập nhật state
      setUser(userData);
      console.log('✅ [AUTH] Login flow completed successfully');
    } catch (error: any) {
      console.error('❌ [AUTH] Login error:', error);
      console.error('❌ [AUTH] Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method
        }
      });
      
      // Xóa tokens nếu có lỗi
      authService.logout();
      
      // Xử lý thông báo lỗi theo status code
      if (error.response?.status === 400) {
        throw new Error('Email hoặc mật khẩu không đúng');
      }
      throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  const logout = () => {
    console.log('🚪 [AUTH_CONTEXT] Logout called');
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        isAuthenticated: !!user,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
