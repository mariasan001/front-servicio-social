import type { NextRequest } from "next/server";
import { resolveBackendUrl } from "@/lib/api/client";
import type { AuthUser } from "@/lib/api/types";
import { normalizeAuthUser } from "./roles";

type AuthMeResponse = {
  success: boolean;
  data: AuthUser | null;
};

export async function getSessionFromRequest(request: NextRequest) {
  const cookie = request.headers.get("cookie");

  if (!cookie) {
    return null;
  }

  try {
    const response = await fetch(resolveBackendUrl("/auth/me"), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Cookie: cookie,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as AuthMeResponse;

    if (!payload.data) {
      return null;
    }

    return normalizeAuthUser(payload.data);
  } catch {
    return null;
  }
}
