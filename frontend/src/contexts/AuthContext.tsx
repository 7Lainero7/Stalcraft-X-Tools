import { createContext, useContext, ReactNode, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../api/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    setUser(response.user);
    localStorage.setItem('accessToken', response.accessToken);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    queryClient.clear();
  };

  const value = {
    isAuthenticated: !!user,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};