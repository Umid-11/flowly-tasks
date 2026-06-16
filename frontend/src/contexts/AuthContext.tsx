import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthState } from '@/types';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (username: string, firstName: string, lastName: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  updateUser: (user: Partial<User>) => void;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<boolean>;
  getAllUsers: () => User[];
  clearAllStorage: () => void;
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);

// JWT payload'dan istifadəçi obyekti yaradır — localStorage-ə user məlumatı yazılmır
function buildUserFromToken(token: string): User | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.nameid?.toString() ?? payload.sub?.toString() ?? '',
      name: `${payload.given_name ?? ''} ${payload.family_name ?? ''}`.trim(),
      username: payload.unique_name ?? payload.sub ?? '',
      email: payload.email ?? '',
      role: (payload.role?.toString()?.toLowerCase() as UserRole) ?? 'employee',
      isSuperAdmin: parseInt(payload.nameid ?? payload.sub ?? '0') === 1,
      createdAt: new Date(),
    };
  } catch {
    return null;
  }
}

let mockUsers: User[] = [];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Clear any legacy user data that might have been stored previously
    localStorage.removeItem('user');
    localStorage.removeItem('userInfo');
    // Initialize auth state based on token only
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const user = buildUserFromToken(storedToken);
      if (user) {
        return { user, isAuthenticated: true, isLoading: false };
      }
      // Invalid token – remove it
      localStorage.removeItem('token');
    }
    return { user: null, isAuthenticated: false, isLoading: false };
  });

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5064/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // HttpOnly refresh token cookie almaq üçün
      });

      if (response.ok) {
        const data = await response.json();

        // Clear any existing items before storing the access token
        localStorage.clear();
        localStorage.setItem('token', data.token);

        // User məlumatlarını token-dən decode edirik, localStorage-ə yazmırıq
        const user = buildUserFromToken(data.token);
        if (user) {
          setAuthState({ user, isAuthenticated: true, isLoading: false });
          return true;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }

    setAuthState(prev => ({ ...prev, isAuthenticated: false, isLoading: false }));
    return false;
  };

  const logout = async (): Promise<void> => {
    try {
      // Backend-ə logout sorğusu göndəririk ki, HttpOnly cookie silinsin
      await fetch('http://localhost:5064/api/Auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear all items from localStorage
    localStorage.clear();
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
  };

  const clearAllStorage = () => {
    localStorage.clear();
  };

  const register = async (
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5064/api/Auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, firstName, lastName, email, password }),
      });

      if (response.ok) return true;

      const errorData = await response.json();
      console.error('Registration failed:', errorData.message);
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...updates };
      // User məlumatı yalnız memory-də (authState) saxlanılır
      setAuthState(prev => ({ ...prev, user: updatedUser }));
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const roleIdMap: Record<UserRole, number> = {
        admin: 2,
        manager: 3,
        employee: 4,
      };

      const roleId = roleIdMap[newRole];
      if (!roleId) return false;

      const response = await fetch('http://localhost:5064/api/Users/update-role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: parseInt(userId), roleId }),
      });

      if (response.ok) {
        if (authState.user?.id === userId) {
          const updatedUser = { ...authState.user, role: newRole };
          setAuthState(prev => ({ ...prev, user: updatedUser }));
        }
        return true;
      }
    } catch (error) {
      console.error('Update role error:', error);
    }
    return false;
  };

  const getAllUsers = (): User[] => {
    if (authState.user?.isSuperAdmin) return mockUsers;
    return mockUsers.filter(u => !u.isSuperAdmin);
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        register,
        updateUser,
        updateUserRole,
        getAllUsers,
        clearAllStorage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
