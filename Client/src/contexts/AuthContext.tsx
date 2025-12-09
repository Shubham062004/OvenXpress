// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'sonner';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'staff' | 'manager' | 'founder';
  branch?: number;
  staffId?: string;
  addresses?: Array<{
    _id: string;
    label: string;
    address: string;
    isDefault?: boolean;
  }>;
  birthday?: string;
  permissions?: string[];
  profileImage?: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log('🔐 User loaded from storage:', parsedUser.email, 'Role:', parsedUser.role);

          // Verify token with backend
          const response = await authAPI.getMe();
          if (response.data.success) {
            const updatedUser = response.data.data;
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            console.log('✅ User authenticated and updated:', updatedUser.email);
          }
        } catch (error) {
          console.error('❌ Token verification failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting login for:', email);
      
      const response = await authAPI.login({ email, password });
      
      if (response.data.success) {
        const { user: userData, token: userToken } = response.data.data;
        
        setUser(userData);
        setToken(userToken);
        
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('✅ Login successful for:', userData.email, 'Role:', userData.role, 'Branch:', userData.branch || 'N/A');
        
        toast.success(`Welcome back, ${userData.name}!`);
        return true;
      }
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
    }
    return false;
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      console.log('📝 Attempting registration for:', userData.email);
      
      const response = await authAPI.register(userData);
      
      if (response.data.success) {
        const { user: newUser, token: userToken } = response.data.data;
        
        setUser(newUser);
        setToken(userToken);
        
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        console.log('✅ Registration successful for:', newUser.email);
        
        toast.success(`Welcome to Oven Xpress, ${newUser.name}!`);
        return true;
      }
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    }
    return false;
  };

  const logout = () => {
    console.log('🚪 Logging out user:', user?.email);
    
    setUser(null);
    setToken(null);
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    toast.success('Logged out successfully');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('🔄 User updated:', updatedUser.email);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
