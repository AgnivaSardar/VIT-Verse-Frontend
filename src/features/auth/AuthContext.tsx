import React, { createContext, useReducer, useEffect, type ReactNode } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'teacher';
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'student' | 'teacher') => Promise<void>;
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
  const AUTH_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  useEffect(() => {
    // Restore token from localStorage on mount
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('authUser');
    if (token && user) {
      try {
        dispatch({
          type: 'RESTORE_TOKEN',
          payload: { user: JSON.parse(user), token },
        });
      } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`${AUTH_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      const token = data.data?.token || data.token;
      const user: User = {
        id: data.data?.userID || data.userID,
        name: data.data?.name || email,
        email: data.data?.email || email,
        role: data.data?.role || 'student',
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

  const register = async (
    name: string,
    email: string,
    password: string,
    role: 'student' | 'teacher'
  ) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`${AUTH_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!response.ok) throw new Error('Registration failed');

      const data = await response.json();
      const user: User = data.data || { id: 0, name, email, role };

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token: '' },
      });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    dispatch({ type: 'LOGOUT' });
  };

  const value: AuthContextType = {
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
