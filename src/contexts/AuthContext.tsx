import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, role?: Role, name?: string) => Promise<User>;
  register: (name: string, email: string, phone: string, role: Role) => Promise<User>;
  logout: () => void;
  switchRole: (role: Role) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  isCustomer: boolean;
}

const DEMO_USERS: Record<Role, User> = {
  ADMIN: {
    id: 'user-admin',
    name: 'Quản Trị Viên Auto Smart',
    email: 'admin@autosmart.vn',
    role: 'ADMIN',
    phone: '0988 888 888',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  SELLER: {
    id: 'user-seller',
    name: 'Nguyễn Văn Minh (Chuyên Viên Bán Xe)',
    email: 'seller@autosmart.vn',
    role: 'SELLER',
    phone: '0903 123 456',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-02-15T00:00:00.000Z',
  },
  CUSTOMER: {
    id: 'user-customer',
    name: 'Trần Văn Hoàng (Khách Hàng)',
    email: 'khachhang@autosmart.vn',
    role: 'CUSTOMER',
    phone: '0912 888 999',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-03-01T00:00:00.000Z',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = api.getStoredUser();
    return saved || DEMO_USERS.CUSTOMER; // Default logged in as customer for seamless browsing
  });

  useEffect(() => {
    api.saveStoredUser(user);
  }, [user]);

  const login = async (email: string, role: Role = 'CUSTOMER', name?: string): Promise<User> => {
    // Check if matches known demo email
    let matchedRole = role;
    if (email.includes('admin')) matchedRole = 'ADMIN';
    else if (email.includes('seller')) matchedRole = 'SELLER';

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name || (matchedRole === 'ADMIN' ? 'Admin Tổng' : matchedRole === 'SELLER' ? 'Đại Lý Xe' : 'Khách Hàng Thân Thiết'),
      email,
      role: matchedRole,
      createdAt: new Date().toISOString(),
    };

    setUser(newUser);
    return newUser;
  };

  const register = async (name: string, email: string, phone: string, role: Role): Promise<User> => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      phone,
      role,
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role: Role) => {
    setUser(DEMO_USERS[role]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        switchRole,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isSeller: user?.role === 'SELLER' || user?.role === 'ADMIN',
        isCustomer: user?.role === 'CUSTOMER',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
