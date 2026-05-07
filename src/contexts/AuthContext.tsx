import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthState } from '@/types';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  updateUser: (user: Partial<User>) => void;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<boolean>;
  getAllUsers: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo - using let so it can be updated
let mockUsers: User[] = [
  {
    id: '1',
    name: 'Super Admin User',
    username: 'superadmin',
    email: 'superadmin@example.com',
    role: 'admin',
    department: 'Management',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=superadmin',
    isSuperAdmin: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Admin User',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    department: 'Management',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    isSuperAdmin: false,
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'Manager User',
    username: 'manager',
    email: 'manager@example.com',
    role: 'manager',
    department: 'Engineering',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager',
    createdAt: new Date(),
  },
  {
    id: '4',
    name: 'Employee User',
    username: 'employee',
    email: 'employee@example.com',
    role: 'employee',
    department: 'Engineering',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=employee',
    createdAt: new Date(),
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem('user');
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Mock login - in production, this would call an API
    const user = mockUsers.find(u => u.username === username);
    if (user && password === 'password') {
      localStorage.setItem('user', JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    // Mock register - in production, this would call an API
    // Generate username from email or name
    const username = email.split('@')[0].toLowerCase();
    const newUser: User = {
      id: Date.now().toString(),
      name,
      username,
      email,
      role,
      createdAt: new Date(),
    };
    mockUsers.push(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    setAuthState({
      user: newUser,
      isAuthenticated: true,
      isLoading: false,
    });
    return true;
  };

  const updateUser = (updates: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole): Promise<boolean> => {
    // Update in mock data
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        role: newRole,
      };
      
      // If updating current user, update auth state
      if (authState.user?.id === userId) {
        const updatedUser = { ...authState.user, role: newRole };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setAuthState(prev => ({
          ...prev,
          user: updatedUser,
        }));
      }
      return true;
    }
    return false;
  };

  const getAllUsers = (): User[] => {
    return mockUsers;
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
