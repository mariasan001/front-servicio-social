import { resolveApiUrl } from "@/lib/api/client";
import type { AuthUser } from "@/lib/api/types";
import { redirectToLogin } from "./unauthorized";

const SESSION_CHECK_INTERVAL_MS = 90_000;

type AuthMeResponse = {
  success?: boolean;
  data?: AuthUser | null;
};

export async function fetchClientSession() {
  try {
    const response = await fetch(resolveApiUrl("/auth/me"), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as AuthMeResponse;
    return payload.data ?? null;
  } catch {
    return null;
  }
}

export async function ensureClientSession(options?: { retries?: number }) {
  const retries = options?.retries ?? 1;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const session = await fetchClientSession();

    if (session) {
      return true;
    }

    if (attempt < retries) {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 400);
      });
    }
  }

  redirectToLogin();
  return false;
}

export function getSessionCheckIntervalMs() {
  return SESSION_CHECK_INTERVAL_MS;
}
