"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getTopooAuthErrorMessage,
  isDesktopRuntime,
  normalizeTopooSession,
  openExternalAuthUrl,
  readStoredTopooProfile,
  readStoredTopooToken,
  topooGetSession,
  topooLoginWithPassword,
  topooLogout,
  TOPOO_AUTH_API_BASE,
  TOPOO_AUTH_PROVIDER_START_PATHS,
  topooReadJson,
  topooRegister,
  type TopooSession,
  type TopooSessionUser,
  writeStoredTopooProfile,
  writeStoredTopooToken,
} from "@/lib/topoo-auth";

type TopooAuthContextValue = {
  clearError: () => void;
  error: string | null;
  initialized: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithEmail: (input: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  oauthLogin: (provider: "google" | "github") => Promise<void>;
  pendingProvider: string;
  registerWithEmail: (input: {
    displayName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  session: TopooSession | null;
  token: string | null;
  user: TopooSessionUser | null;
};

const TopooAuthContext = createContext<TopooAuthContextValue | null>(null);

async function exchangeTokenForSession(token: string) {
  const payload = await topooGetSession(token);
  return normalizeTopooSession(payload.session || null);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<TopooSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingProvider, setPendingProvider] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const callbackToken = params.get("auth_token");
    const callbackError = params.get("auth_error");

    if (callbackToken) {
      writeStoredTopooToken(callbackToken);
      params.delete("auth_token");
      params.delete("auth_provider");
    }

    if (callbackError) {
      setError(callbackError);
      params.delete("auth_error");
      params.delete("auth_provider");
    }

    if (callbackToken || callbackError) {
      const nextSearch = params.toString();
      window.history.replaceState({}, "", `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}`);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function bootstrap() {
      const savedToken = readStoredTopooToken();
      const savedProfile = readStoredTopooProfile();
      if (!savedToken) {
        if (isActive) {
          setInitialized(true);
        }
        return;
      }

      if (isActive) {
        setIsLoading(true);
      }

      try {
        if (savedProfile && isActive) {
          setToken(savedToken);
          setSession({ user: savedProfile });
        }
        const nextSession = await exchangeTokenForSession(savedToken);
        if (!isActive) return;
        setToken(savedToken);
        setSession(nextSession);
        writeStoredTopooProfile(nextSession?.user || null);
      } catch {
        writeStoredTopooToken(null);
        writeStoredTopooProfile(null);
        if (!isActive) return;
        setToken(null);
        setSession(null);
      } finally {
        if (isActive) {
          setIsLoading(false);
          setInitialized(true);
        }
      }
    }

    void bootstrap();

    return () => {
      isActive = false;
    };
  }, []);

  async function applyAuthPayload(payload: Record<string, unknown>) {
    const nextToken = typeof payload.token === "string" ? payload.token : null;
    if (!nextToken) {
      throw new Error("Auth token missing from response.");
    }

    const nextSession =
      payload.session && typeof payload.session === "object"
        ? normalizeTopooSession(payload.session as TopooSession)
        : await exchangeTokenForSession(nextToken);

    writeStoredTopooToken(nextToken);
    writeStoredTopooProfile(nextSession?.user || null);
    setToken(nextToken);
    setSession(nextSession);
  }

  async function loginWithEmail(input: { email: string; password: string }) {
    setIsLoading(true);
    setError(null);

    try {
      const payload = await topooLoginWithPassword(input);
      await applyAuthPayload(payload);
    } catch (authError) {
      setError(getTopooAuthErrorMessage(authError));
      throw authError;
    } finally {
      setIsLoading(false);
      setInitialized(true);
    }
  }

  async function registerWithEmail(input: {
    displayName: string;
    email: string;
    password: string;
  }) {
    setIsLoading(true);
    setError(null);

    try {
      const payload = await topooRegister(input);
      await applyAuthPayload(payload);
    } catch (authError) {
      setError(getTopooAuthErrorMessage(authError));
      throw authError;
    } finally {
      setIsLoading(false);
      setInitialized(true);
    }
  }

  async function oauthLogin(provider: "google" | "github") {
    setError(null);

    const baseTarget = TOPOO_AUTH_PROVIDER_START_PATHS[provider];
    if (!baseTarget) {
      const nextError = `${provider} 登录入口还没有配置。`;
      setError(nextError);
      throw new Error(nextError);
    }

    setPendingProvider(provider);
    setIsLoading(true);

    const popupWindow =
      typeof window !== "undefined" && !isDesktopRuntime()
        ? window.open("", "topoo-auth-popup", "popup=yes,width=520,height=760,resizable=yes,scrollbars=yes")
        : null;

    try {
      if (typeof window !== "undefined" && !isDesktopRuntime() && !popupWindow) {
        throw new Error("浏览器拦截了登录弹窗。请允许此站点打开弹窗后重试。");
      }

      const startUrl = new URL(baseTarget);
      startUrl.searchParams.set("entranceType", "desktop");
      startUrl.searchParams.set("responseMode", "json");

      const startResponse = await fetch(startUrl.toString());
      const startPayload = await topooReadJson(startResponse);
      if (!startResponse.ok) {
        throw new Error(
          typeof startPayload?.error === "string" ? startPayload.error : `${provider} login start failed.`,
        );
      }

      const authorizeUrl = typeof startPayload?.authorizeUrl === "string" ? startPayload.authorizeUrl : null;
      const stateToken = typeof startPayload?.stateToken === "string" ? startPayload.stateToken : null;

      if (!authorizeUrl || !stateToken) {
        throw new Error(`${provider} login start response is incomplete.`);
      }

      if (isDesktopRuntime()) {
        const openedExternally = await openExternalAuthUrl(authorizeUrl);
        if (!openedExternally) {
          window.location.assign(authorizeUrl);
          return;
        }
      } else if (popupWindow) {
        popupWindow.location.href = authorizeUrl;
      }

      const pollUntil = Date.now() + 2 * 60 * 1000;
      while (Date.now() < pollUntil) {
        await new Promise((resolve) => window.setTimeout(resolve, 1200));

        const resultUrl = new URL(`${TOPOO_AUTH_API_BASE}/oauth/result`);
        resultUrl.searchParams.set("provider", provider);
        resultUrl.searchParams.set("state", stateToken);

        const resultResponse = await fetch(resultUrl.toString());
        const resultPayload = await topooReadJson(resultResponse);
        if (!resultResponse.ok) {
          throw new Error(
            typeof resultPayload?.error === "string" ? resultPayload.error : `${provider} login polling failed.`,
          );
        }

        if (resultPayload?.status === "pending") {
          continue;
        }

        if (resultPayload?.status === "completed" && typeof resultPayload?.token === "string") {
          popupWindow?.close();
          await applyAuthPayload(resultPayload);
          setPendingProvider("");
          return;
        }

        throw new Error(
          typeof resultPayload?.error === "string" ? resultPayload.error : `${provider} login failed.`,
        );
      }

      throw new Error(`${provider} login timed out. Return to Topoo and try again.`);
    } catch (authError) {
      popupWindow?.close();
      setError(getTopooAuthErrorMessage(authError));
      setPendingProvider("");
      throw authError;
    } finally {
      setIsLoading(false);
      setInitialized(true);
    }
  }

  async function logout() {
    const currentToken = token || readStoredTopooToken();
    setError(null);

    try {
      if (currentToken) {
        await topooLogout(currentToken);
      }
    } catch {
      // best-effort
    } finally {
      writeStoredTopooToken(null);
      writeStoredTopooProfile(null);
      setToken(null);
      setSession(null);
      setPendingProvider("");
      setInitialized(true);
    }
  }

  const value = useMemo<TopooAuthContextValue>(
    () => ({
      clearError: () => setError(null),
      error,
      initialized,
      isAuthenticated: Boolean(session?.user),
      isLoading,
      loginWithEmail,
      logout,
      oauthLogin,
      pendingProvider,
      registerWithEmail,
      session,
      token,
      user: session?.user || null,
    }),
    [error, initialized, isLoading, pendingProvider, session, token],
  );

  return <TopooAuthContext.Provider value={value}>{children}</TopooAuthContext.Provider>;
}

export function useTopooAuth() {
  const context = useContext(TopooAuthContext);

  if (!context) {
    throw new Error("useTopooAuth must be used inside AuthProvider");
  }

  return context;
}
