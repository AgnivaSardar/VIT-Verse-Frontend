import React, { createContext, useReducer, useEffect, type ReactNode } from 'react';

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
  const AUTH_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Restore token from localStorage on mount
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('authUser');
    console.log('🔍 AuthContext - Restoring from localStorage:', { token: !!token, user });
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        console.log('🔍 AuthContext - Parsed user:', parsedUser);
        console.log('🔍 AuthContext - isSuperAdmin:', parsedUser.isSuperAdmin);
        dispatch({
          type: 'RESTORE_TOKEN',
          payload: { user: parsedUser, token },
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

  const login = async (identifier: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`${AUTH_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier, password }),
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      const token = data.data?.token || data.token;
      const payloadUser = data.data?.user || data.user || data.data;
      const user: User = {
        id: payloadUser?.id || payloadUser?.userID,
        name: payloadUser?.name || payloadUser?.userName || identifier,
        email: payloadUser?.email || payloadUser?.userEmail || identifier,
        role: payloadUser?.role || 'student',
        isEmailVerified: payloadUser?.isEmailVerified ?? true,
        isSuperAdmin: payloadUser?.isSuperAdmin ?? false,
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
      const response = await fetch(`${AUTH_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Registration failed');

      await response.json();
      // After registration, user needs to verify OTP - don't auto-login
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = () => {
    // Call backend to clear cookie
    fetch(`${AUTH_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    }).catch(err => console.error('Logout failed:', err))
      .finally(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        dispatch({ type: 'LOGOUT' });
        window.location.reload();
      });
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
