import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authApi, userApi } from "@/lib/api";
import { getStoredSession, setStoredSession, subscribeSession } from "@/lib/session-store";
import type { AuthResponse, UserSession } from "@/lib/types";

type AuthContextValue = {
  user: UserSession | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: { email: string; password: string }) => Promise<AuthResponse>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    country?: string;
    timezone?: string;
  }) => Promise<AuthResponse>;
  continueAsGuest: () => Promise<AuthResponse>;
  startOAuth: (provider: "google" | "github", returnTo?: string) => void;
  completeOAuth: (token: string) => Promise<UserSession>;
  refreshProfile: () => Promise<UserSession | null>;
  updateLocalUser: (user: UserSession) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = getStoredSession();
  const [token, setToken] = useState<string | null>(initial?.token || null);
  const [user, setUser] = useState<UserSession | null>(initial?.user || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeSession((session) => {
      setToken(session?.token || null);
      setUser(session?.user || null);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      const existing = getStoredSession();
      if (!existing?.token) {
        setLoading(false);
        return;
      }
      try {
        const profile = await userApi.profile();
        if (!cancelled) {
          setStoredSession({ token: existing.token, user: profile });
        }
      } catch {
        if (!cancelled) {
          setStoredSession(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  async function commitAuth(request: Promise<AuthResponse>) {
    const result = await request;
    setStoredSession({ token: result.token, user: result.user });
    return result;
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      loading,
      login: (payload) => commitAuth(authApi.login(payload)),
      register: (payload) => commitAuth(authApi.register(payload)),
      continueAsGuest: () => commitAuth(authApi.guest()),
      startOAuth: (provider, returnTo = "/home") => {
        window.location.assign(authApi.oauthStartUrl(provider, returnTo));
      },
      completeOAuth: async (tokenValue) => {
        const profile = await authApi.meWithToken(tokenValue);
        setStoredSession({ token: tokenValue, user: profile.user });
        return profile.user;
      },
      refreshProfile: async () => {
        const existing = getStoredSession();
        if (!existing?.token) return null;
        const profile = await userApi.profile();
        setStoredSession({ token: existing.token, user: profile });
        return profile;
      },
      updateLocalUser: (nextUser) => {
        const existing = getStoredSession();
        if (!existing?.token) return;
        setStoredSession({ token: existing.token, user: nextUser });
      },
      logout: () => {
        setStoredSession(null);
      }
    }),
    [loading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
