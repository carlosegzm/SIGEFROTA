import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import type { Role } from '../types';

interface DecodedToken {
  sub: string;
  role: Role;
  exp: number;
}

interface AuthContextData {
  token: string | null;
  role: Role | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  userEmail: string | null;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const getInitialState = () => {
  const storedToken = localStorage.getItem('token');
  if (storedToken) {
    try {
      const decoded = jwtDecode<DecodedToken>(storedToken);
      if (decoded.exp * 1000 > Date.now()) {
        return { token: storedToken, role: decoded.role, userEmail: decoded.sub };
      }
    } catch {
      // invalid token
    }
  }
  return { token: null, role: null, userEmail: null };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const initialState = getInitialState();
  const [token, setToken] = useState<string | null>(initialState.token);
  const [role, setRole] = useState<Role | null>(initialState.role);
  const [userEmail, setUserEmail] = useState<string | null>(initialState.userEmail);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    setToken(null);
    setRole(null);
    setUserEmail(null);
    localStorage.removeItem('token');
    if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const timeToExpire = decoded.exp * 1000 - Date.now();
        if (timeToExpire <= 0) {
          logout();
        } else {
          setRole(decoded.role);
          setUserEmail(decoded.sub);
          localStorage.setItem('token', token);
          timeoutId = setTimeout(() => {
            logout();
          }, timeToExpire);
        }
      } catch {
        logout();
      }
    } else {
      setRole(null);
      setUserEmail(null);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [token, logout]);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const login = useCallback((newToken: string) => {
    setToken(newToken);
  }, []);

  const isManager = role === 'FLEET_MANAGER';

  return (
    <AuthContext.Provider value={{ token, role, userEmail, login, logout, isAuthenticated: !!token && !!role, isManager }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
