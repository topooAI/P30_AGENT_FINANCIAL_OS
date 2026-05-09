export type TopooSessionUser = {
  id?: string;
  email?: string;
  displayName?: string | null;
  nickname?: string | null;
  avatarUrl?: string | null;
  avatar_url?: string | null;
};

export type TopooSession = {
  userId?: string;
  email?: string;
  displayName?: string | null;
  role?: string;
  status?: string;
  sessionId?: string;
  signedInAt?: string;
  expiresAt?: string;
  entranceType?: string;
  user?: TopooSessionUser | null;
  [key: string]: unknown;
};

const DEFAULT_TOPOO_AUTH_API_BASE = "https://auth.topoo.ai/api/auth";

export const TOPOO_AUTH_STORAGE_KEY = "topoo.auth.sessionToken.v3";
export const TOPOO_AUTH_PROFILE_STORAGE_KEY = "topoo.auth.profile.v1";
export const TOPOO_AUTH_API_BASE = normalizeUrl(
  process.env.NEXT_PUBLIC_TOPOO_AUTH_URL || DEFAULT_TOPOO_AUTH_API_BASE,
);
export const TOPOO_AUTH_PROVIDER_START_PATHS = {
  github: `${TOPOO_AUTH_API_BASE}/github/start`,
  google: `${TOPOO_AUTH_API_BASE}/google/start`,
} as const;

export class TopooAuthError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "TopooAuthError";
    this.status = status;
  }
}

function normalizeUrl(url: string) {
  return url.trim().replace(/\/+$/, "");
}

async function readJson(response: Response) {
  const text = await response.text();
  try {
    return text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    return { error: text || "Invalid server response." };
  }
}

async function assertOk(response: Response) {
  const payload = await readJson(response);
  if (!response.ok) {
    throw new TopooAuthError(
      typeof payload?.error === "string" ? payload.error : `Request failed (${response.status})`,
      response.status,
    );
  }
  return payload;
}

export async function topooLoginWithPassword(input: {
  email: string;
  password: string;
}) {
  return assertOk(
    await fetch(`${TOPOO_AUTH_API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: input.email.trim(),
        entranceType: "desktop",
        password: input.password,
      }),
    }),
  );
}

export async function topooRegister(input: {
  displayName: string;
  email: string;
  password: string;
}) {
  return assertOk(
    await fetch(`${TOPOO_AUTH_API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: input.displayName.trim(),
        email: input.email.trim(),
        entranceType: "desktop",
        password: input.password,
      }),
    }),
  );
}

export async function topooGetSession(token: string) {
  const payload = await assertOk(
    await fetch(`${TOPOO_AUTH_API_BASE}/session`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  );

  return payload as { session?: TopooSession | null };
}

export function normalizeTopooSession(session: TopooSession | null | undefined) {
  if (!session) {
    return null;
  }

  const normalizedUser =
    session.user ||
    (session.email || session.displayName || session.userId
      ? {
          id: typeof session.userId === "string" ? session.userId : undefined,
          email: typeof session.email === "string" ? session.email : undefined,
          displayName: typeof session.displayName === "string" ? session.displayName : undefined,
        }
      : null);

  return {
    ...session,
    user: normalizedUser,
  } satisfies TopooSession;
}

export async function topooLogout(token: string) {
  return assertOk(
    await fetch(`${TOPOO_AUTH_API_BASE}/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }),
  );
}

export async function topooReadJson(response: Response) {
  return readJson(response);
}

export function readStoredTopooToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOPOO_AUTH_STORAGE_KEY);
}

export function writeStoredTopooToken(token: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!token) {
    window.localStorage.removeItem(TOPOO_AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(TOPOO_AUTH_STORAGE_KEY, token);
}

export function readStoredTopooProfile() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(TOPOO_AUTH_PROFILE_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as TopooSessionUser;
  } catch {
    window.localStorage.removeItem(TOPOO_AUTH_PROFILE_STORAGE_KEY);
    return null;
  }
}

export function writeStoredTopooProfile(profile: TopooSessionUser | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!profile) {
    window.localStorage.removeItem(TOPOO_AUTH_PROFILE_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(TOPOO_AUTH_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function isDesktopRuntime() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean((window as Window & { __TAURI__?: unknown }).__TAURI__);
}

export async function openExternalAuthUrl(target: string) {
  const runtimeWindow = window as Window & {
    __TAURI__?: {
      core?: { invoke?: (cmd: string, args?: Record<string, unknown>) => Promise<unknown> };
      opener?: { openUrl?: (url: string) => Promise<void> };
    };
  };
  const tauri = runtimeWindow.__TAURI__;

  try {
    if (tauri?.opener?.openUrl) {
      await tauri.opener.openUrl(target);
      return true;
    }

    if (tauri?.core?.invoke) {
      await tauri.core.invoke("plugin:opener|open_url", { url: target });
      return true;
    }
  } catch {
    // Fall through to browser open.
  }

  try {
    const popup = window.open(target, "_blank", "noopener,noreferrer");
    if (popup) {
      popup.opener = null;
      return true;
    }
  } catch {
    // Final fallback below.
  }

  return false;
}

export function getTopooAuthErrorMessage(error: unknown) {
  if (error instanceof TopooAuthError) {
    return error.message;
  }

  if (error instanceof Error) {
    if (error.name === "TypeError" || /fetch/i.test(error.message)) {
      return "无法连接 Topoo 登录服务。";
    }
    return error.message;
  }

  return "登录失败，请稍后重试。";
}
