"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTopooAuth } from "../_components/auth-provider";
import { Button } from "@/fumadocs-system/components/ui/button";

type AuthMode = "login" | "register";

export default function AuthPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    error,
    initialized,
    isAuthenticated,
    isLoading,
    loginWithEmail,
    logout,
    oauthLogin,
    pendingProvider,
    registerWithEmail,
    user,
  } = useTopooAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
  });
  const [localError, setLocalError] = useState("");
  const nextPath = searchParams.get("next")?.startsWith("/") ? searchParams.get("next")! : "/";

  useEffect(() => {
    if (!initialized || !isAuthenticated) {
      return;
    }

    router.replace(nextPath);
  }, [initialized, isAuthenticated, nextPath, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError("");

    try {
      if (mode === "register") {
        if (!form.displayName.trim()) {
          setLocalError("Display name is required.");
          return;
        }

        await registerWithEmail({
          displayName: form.displayName,
          email: form.email,
          password: form.password,
        });
        return;
      }

      await loginWithEmail({
        email: form.email,
        password: form.password,
      });
    } catch {
      return;
    }
  }

  if (!initialized) {
    return (
      <div className="topoo-auth-screen">
        <div className="topoo-auth-shell">
          <div className="topoo-auth-meta">Checking session...</div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="topoo-auth-screen">
        <div className="topoo-auth-shell">
          <div className="topoo-auth-heading">
            <div className="topoo-auth-title">Signed in to Topoo</div>
            <div className="topoo-auth-subtitle">
              Redirecting you into P27...
            </div>
          </div>
          <Button className="topoo-auth-primary" onClick={() => router.replace(nextPath)}>
            Continue
          </Button>
          <Button className="topoo-auth-secondary" onClick={() => void logout()} variant="outline">
            Log out
          </Button>
        </div>
      </div>
    );
  }

  const disabled =
    isLoading ||
    !form.email.trim() ||
    !form.password.trim() ||
    (mode === "register" && !form.displayName.trim());

  return (
    <div className="topoo-auth-screen">
      <div className="topoo-auth-shell">
        <div className="topoo-auth-heading">
          <div className="topoo-auth-title">
            {mode === "register" ? "Create your Topoo account" : "Sign in to Topoo"}
          </div>
          <div className="topoo-auth-subtitle">
            {mode === "register"
              ? "Use the same auth entry and account model as Topoo integration."
              : "Use your existing Topoo credentials to enter P27."}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="topoo-auth-form">
          {mode === "register" ? (
            <input
              type="text"
              placeholder="Display name"
              value={form.displayName}
              onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
              className="topoo-auth-input"
              autoComplete="name"
            />
          ) : null}

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="topoo-auth-input"
            autoComplete="email"
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            className="topoo-auth-input"
            autoComplete={mode === "register" ? "new-password" : "current-password"}
          />

          {localError || error ? <div className="topoo-auth-error">{localError || error}</div> : null}

          <Button type="submit" disabled={disabled} className="topoo-auth-primary">
            {isLoading ? "Please wait" : mode === "register" ? "Create account" : "Continue"}
          </Button>
        </form>

        <div className="topoo-auth-oauth-group">
          <Button
            type="button"
            variant="outline"
            className="topoo-auth-secondary"
            onClick={() => void oauthLogin("google")}
          >
            {pendingProvider === "google" && isLoading ? (
              "Please wait"
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </span>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="topoo-auth-secondary"
            onClick={() => void oauthLogin("github")}
          >
            {pendingProvider === "github" && isLoading ? (
              "Please wait"
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.532 1.03 1.532 1.03.891 1.529 2.341 1.088 2.91.832.091-.647.349-1.088.635-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.748-1.025 2.748-1.025.546 1.376.202 2.393.1 2.646.64.698 1.026 1.591 1.026 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.579.688.481C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                Continue with GitHub
              </span>
            )}
          </Button>
        </div>

        <button
          type="button"
          onClick={() => {
            setLocalError("");
            setMode((current) => (current === "register" ? "login" : "register"));
          }}
          className="topoo-auth-switch"
        >
          {mode === "register"
            ? "Already have an account? Sign in"
            : "Need an account? Create one"}
        </button>
      </div>
    </div>
  );
}
