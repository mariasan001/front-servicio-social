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

export async function ensureClientSession() {
  const session = await fetchClientSession();

  if (!session) {
    redirectToLogin();
    return false;
  }

  return true;
}

export function getSessionCheckIntervalMs() {
  return SESSION_CHECK_INTERVAL_MS;
}
