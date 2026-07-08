import { resolveBackendUrl } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type { PublicTestimonioResponse } from "../types/public-testimonial.types";

const LANDING_TESTIMONIOS_REVALIDATE_SECONDS = 120;

async function fetchPublicApi<T>(path: string): Promise<T | null> {
  const response = await fetch(resolveBackendUrl(path), {
    method: "GET",
    headers: { Accept: "application/json" },
    next: { revalidate: LANDING_TESTIMONIOS_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as ApiResponse<T>;
  return payload.data ?? null;
}

export async function listPublicTestimonios() {
  const data = await fetchPublicApi<PublicTestimonioResponse[]>(
    "/api/public/testimonios",
  );

  return data ?? [];
}
