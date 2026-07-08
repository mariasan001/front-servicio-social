import { resolveBackendUrl } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";

export const PUBLIC_API_REVALIDATE_SECONDS = 120;

export type PublicApiFailureReason = "not_found" | "unavailable";

export type PublicApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: PublicApiFailureReason };

export async function publicApiGet<T>(
  path: string,
  revalidate = PUBLIC_API_REVALIDATE_SECONDS,
): Promise<PublicApiResult<T>> {
  try {
    const response = await fetch(resolveBackendUrl(path), {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate },
    });

    if (response.status === 404) {
      return { ok: false, reason: "not_found" };
    }

    if (!response.ok) {
      return { ok: false, reason: "unavailable" };
    }

    const payload = (await response.json()) as ApiResponse<T>;

    if (payload.data === undefined || payload.data === null) {
      return { ok: false, reason: "unavailable" };
    }

    return { ok: true, data: payload.data };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}
