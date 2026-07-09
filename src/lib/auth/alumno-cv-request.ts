import type { NextRequest } from "next/server";
import { resolveBackendUrl } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type { CvCompletionSnapshot } from "@/lib/domain/cv";

export async function getCvFromRequest(
  request: NextRequest,
): Promise<CvCompletionSnapshot | null> {
  const cookie = request.headers.get("cookie");

  if (!cookie) {
    return null;
  }

  try {
    const response = await fetch(resolveBackendUrl("/api/alumno/cv"), {
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

    const payload = (await response.json()) as ApiResponse<CvCompletionSnapshot>;
    return payload.data ?? null;
  } catch {
    return null;
  }
}
