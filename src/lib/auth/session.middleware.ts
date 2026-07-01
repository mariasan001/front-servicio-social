import type { NextRequest } from "next/server";
import type { AuthUser } from "@/lib/api/types";
import { resolveApiUrl } from "@/lib/api/client";

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
    const response = await fetch(
      resolveApiUrl("/auth/me", request.nextUrl.origin),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: cookie,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as AuthMeResponse;
    return payload.data;
  } catch {
    return null;
  }
}
