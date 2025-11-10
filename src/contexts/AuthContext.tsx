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

  // Khôi phục user từ localStorage khi app khởi động
  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (isInitialized.current) {
      return;
    }
    
    isInitialized.current = true;
    
    const storedUser = authService.getStoredUser();
    const token = authService.getAccessToken();
    
    if (storedUser && token) {
      setUser(storedUser);
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      await authService.login(credentials);
      
      const userData = await authService.fetchProfile();
      
      setUser(userData);
    } catch (error: any) {
      authService.logout();
      
      if (error.response?.status === 400) {
        throw new Error('Email hoặc mật khẩu không đúng');
      }
      throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  const logout = () => {
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
