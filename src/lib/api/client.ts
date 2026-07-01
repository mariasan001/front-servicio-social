import { ApiError } from "./errors";
import type { ApiResponse } from "./types";

export const API_PROXY_PATH = "/api/backend";

const DEFAULT_API_BASE_URL = API_PROXY_PATH;

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL;
}

export function resolveApiUrl(path: string, origin?: string) {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (baseUrl.startsWith("http://") || baseUrl.startsWith("https://")) {
    return `${baseUrl.replace(/\/$/, "")}${normalizedPath}`;
  }

  if (origin) {
    return `${origin.replace(/\/$/, "")}${baseUrl.replace(/\/$/, "")}${normalizedPath}`;
  }

  return `${baseUrl.replace(/\/$/, "")}${normalizedPath}`;
}

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  const { body, headers, ...rest } = options;

  const response = await fetch(resolveApiUrl(path), {
    ...rest,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let payload: ApiResponse<T> | null = null;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.success === false) {
    throw new ApiError(
      payload?.message ?? "No fue posible completar la solicitud.",
      payload?.code ?? "REQUEST_FAILED",
      response.status,
      payload?.errors,
    );
  }

  if (!payload) {
    throw new ApiError(
      "La respuesta del servidor no es válida.",
      "INVALID_RESPONSE",
      response.status,
    );
  }

  return payload;
}
