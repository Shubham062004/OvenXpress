import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI, setAuthToken } from '@/services/api';

type PlainObject = Record<string, unknown>;

export interface User {
  _id?: string;
  name?: string;
  email?: string;
  [k: string]: unknown;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register?: (payload: PlainObject) => Promise<boolean>;
  setUserFromLocal?: (u: User | null, t?: string | null) => void;
}

const AUTH_USER_KEY = 'user';
const AUTH_TOKEN_KEY = 'token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

function safeParseUser(raw: string | null): User | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as User;
  } catch {
    // ignore
  }
  return null;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() =>
    safeParseUser(localStorage.getItem(AUTH_USER_KEY))
  );
  const [token, setToken] = useState<string | null>(() => {
    try {
      const t = localStorage.getItem(AUTH_TOKEN_KEY);
      return t && t !== 'undefined' ? t : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
    } else {
      setAuthToken(null);
    }
  }, [token]);

  const persistAuth = (u: User | null, t: string | null) => {
    if (t && typeof t === 'string' && t.length > 0) {
      localStorage.setItem(AUTH_TOKEN_KEY, t);
      setToken(t);
      setAuthToken(t);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setToken(null);
      setAuthToken(null);
    }

    if (u && typeof u === 'object') {
      try {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));
      } catch {
        // ignore
      }
      setUser(u);
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
      setUser(null);
    }
  };

  const extractTokenAndUser = (payload: unknown): { token?: string; user?: User } => {
    if (!payload || typeof payload !== 'object') return {};
    const obj = payload as PlainObject;

    // Common shapes:
    // { token, user }
    // { success: true, data: { token, user } }
    // { data: { token, user } }
    if (typeof obj['token'] === 'string') return { token: obj['token'] as string, user: obj['user'] as User | undefined };
    if (obj['data'] && typeof obj['data'] === 'object') {
      const data = obj['data'] as PlainObject;
      const token = typeof data['token'] === 'string' ? (data['token'] as string) : undefined;
      const user = data['user'] && typeof data['user'] === 'object' ? (data['user'] as User) : undefined;
      if (token || user) return { token, user };
    }
    if (obj['user'] && typeof obj['user'] === 'object') return { user: obj['user'] as User };
    return {};
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      const payload = res?.data ?? res;
      const { token: foundToken, user: foundUser } = extractTokenAndUser(payload);

      if (!foundToken || typeof foundToken !== 'string' || foundToken.length === 0) {
        // Ensure we never write "undefined" to localStorage
        persistAuth(null, null);
        setLoading(false);
        return false;
      }

      persistAuth(foundUser ?? null, foundToken);
      setLoading(false);
      return true;
    } catch (err: unknown) {
      // On error ensure we don't persist invalid data
      persistAuth(null, null);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    persistAuth(null, null);
  };

  const register = async (payload: PlainObject): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await authAPI.register(payload);
      const { token: foundToken, user: foundUser } = extractTokenAndUser(res?.data ?? res);
      if (foundToken && typeof foundToken === 'string') {
        persistAuth(foundUser ?? null, foundToken);
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch {
      setLoading(false);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: Boolean(token),
    loading,
    login,
    logout,
    register,
    setUserFromLocal: (u, t) => persistAuth(u ?? null, t ?? null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
