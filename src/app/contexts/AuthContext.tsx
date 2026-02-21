import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { login as apiLogin, register as apiRegister, type LoginResponse, type RegisterResponse } from "@/services/authService";
import { fetchCurrentUser, type CurrentUser } from "@/services/userService";
import { ApiError } from "@/app/api/http";

const STORAGE_KEY = "auth_token";
const EMAIL_KEY = "auth_email";
const PHONE_KEY = "auth_phone";
const NAME_KEY = "auth_name";

type AuthContextValue = {
  token: string | null;
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  email: string | null;
  phone: string | null;
  name: string | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<RegisterResponse>;
  logout: () => void;
  refreshUser: (tokenOverride?: string) => Promise<CurrentUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const persistBasics = useCallback((next: { token?: string | null; email?: string | null; phone?: string | null; name?: string | null }) => {
    if (typeof next.token !== "undefined") {
      setToken(next.token);
      if (next.token) localStorage.setItem(STORAGE_KEY, next.token); else localStorage.removeItem(STORAGE_KEY);
    }
    if (typeof next.email !== "undefined") {
      setEmail(next.email);
      if (next.email) localStorage.setItem(EMAIL_KEY, next.email); else localStorage.removeItem(EMAIL_KEY);
    }
    if (typeof next.phone !== "undefined") {
      setPhone(next.phone ?? null);
      if (next.phone) localStorage.setItem(PHONE_KEY, next.phone); else localStorage.removeItem(PHONE_KEY);
    }
    if (typeof next.name !== "undefined") {
      setName(next.name ?? null);
      if (next.name) localStorage.setItem(NAME_KEY, next.name); else localStorage.removeItem(NAME_KEY);
    }
  }, []);

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    persistBasics({ token: null, email: null, phone: null, name: null });
  }, [persistBasics]);

  const hydrateFromStorage = useCallback(async () => {
    const storedToken = localStorage.getItem(STORAGE_KEY);
    const storedEmail = localStorage.getItem(EMAIL_KEY);
    const storedPhone = localStorage.getItem(PHONE_KEY);
    const storedName = localStorage.getItem(NAME_KEY);

    if (storedToken) {
      setToken(storedToken);
      persistBasics({ email: storedEmail, phone: storedPhone, name: storedName });
      try {
        const me = await fetchCurrentUser(storedToken);
        setUser(me);
        persistBasics({ email: me.email, phone: me.phone ?? storedPhone, name: me.name });
      } catch (err) {
        const isUnauthorized = err instanceof ApiError && err.status === 401;
        if (isUnauthorized) clearSession();
      }
    }

    setIsAuthReady(true);
  }, [clearSession, persistBasics]);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const refreshUser = useCallback(async (tokenOverride?: string) => {
    const activeToken = tokenOverride ?? token;
    if (!activeToken) return null;
    try {
      const me = await fetchCurrentUser(activeToken);
      setUser(me);
      persistBasics({ email: me.email, phone: me.phone ?? undefined, name: me.name });
      return me;
    } catch (err) {
      const isUnauthorized = err instanceof ApiError && err.status === 401;
      if (isUnauthorized) clearSession();
      throw err;
    }
  }, [token, persistBasics, clearSession]);

  const login = async (emailInput: string, password: string) => {
    const res = await apiLogin(emailInput, password);
    persistBasics({ token: res.token, email: emailInput });
    await refreshUser(res.token).catch(() => {});
    return res;
  };

  const register = async (nameInput: string, emailInput: string, password: string, phoneInput?: string) => {
    const res = await apiRegister(nameInput, emailInput, password, phoneInput);
    persistBasics({ email: emailInput, name: nameInput, phone: phoneInput });
    return res;
  };

  const logout = () => {
    clearSession();
  };

  const value = useMemo(
    () => ({ token, user, email, phone, name, isAuthenticated: Boolean(token), isAuthReady, login, register, logout, refreshUser }),
    [token, user, email, phone, name, isAuthReady, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
