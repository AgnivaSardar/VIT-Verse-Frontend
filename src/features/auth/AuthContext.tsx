import React, { createContext, useReducer, useEffect, type ReactNode } from 'react';
import { authApi } from '../../services/authApi';  // ✅ Import authApi

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  isEmailVerified?: boolean;
  isSuperAdmin?: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'teacher';
    studentRegID?: string;
    employeeID?: string;
  }) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_TOKEN'; payload: { user: User; token: string } };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
      };
    case 'LOGOUT':
      return { ...state, user: null, token: null };
    case 'RESTORE_TOKEN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
      };
    default:
      return state;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('authUser');
    console.log('🔍 AuthContext - Restoring from localStorage:', { token: !!token, user });
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        // Normalize stored user shape to ensure we show a proper display name
        const normalized = {
          id: Number(parsedUser?.id ?? parsedUser?.userID ?? 0),
          name: String(parsedUser?.name ?? parsedUser?.userName ?? parsedUser?.userEmail ?? parsedUser?.email ?? ''),
          email: String(parsedUser?.email ?? parsedUser?.userEmail ?? ''),
          role: parsedUser?.role ?? 'student',
        } as User;
        // If the stored name looks like an email and we have a separate userName, prefer that
        if (normalized.name.includes('@') && parsedUser?.userName) {
          normalized.name = parsedUser.userName;
        }

        dispatch({
          type: 'RESTORE_TOKEN',
          payload: { user: normalized, token },
        });
      } catch (error) {
        console.error('🔍 AuthContext - Error parsing user:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // ✅ FIXED: USE authApi.login() - Vite proxy magic!
  const login = async (identifier: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authApi.login({ identifier, password });
      
      const data = response.data || response;
      const token = data.token;
      // Backend returns { token, user: { id, name, email, role, ... } }
      const payloadUser = (data as any).user ?? (data as any);

      const user: User = {
        id: Number(payloadUser?.id ?? payloadUser?.userID ?? 0),
        name: String(payloadUser?.name ?? payloadUser?.userName ?? identifier),
        email: String(payloadUser?.email ?? payloadUser?.userEmail ?? identifier),
        role: (payloadUser?.role as any) || 'student',
      };

      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'teacher';
    studentRegID?: string;
    employeeID?: string;
  }) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await authApi.register(data);  // ✅ Use authApi!
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {  // ✅ Relative URL!
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      dispatch({ type: 'LOGOUT' });
      window.location.reload();
    }
  };

  const value: AuthContextType = {
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    isAuthenticated: !!state.token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
