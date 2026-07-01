import { cookies } from "next/headers";
import { ApiError } from "./errors";
import { resolveBackendUrl } from "./client";
import type { ApiResponse } from "./types";

type ServerApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

async function getCookieHeader() {
  const cookieStore = await cookies();

  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

function isFormDataBody(body: unknown): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

function serializeRequestBody(body: unknown) {
  if (isFormDataBody(body)) {
    return body;
  }

  return JSON.stringify(body);
}

export async function serverApiRequest<T>(
  path: string,
  options: ServerApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  const { body, headers, auth = true, ...rest } = options;
  const hasJsonBody = body !== undefined && !isFormDataBody(body);

  const requestHeaders: HeadersInit = {
    Accept: "application/json",
    ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
    ...headers,
  };

  if (auth) {
    const cookieHeader = await getCookieHeader();

    if (cookieHeader) {
      (requestHeaders as Record<string, string>).Cookie = cookieHeader;
    }
  }

  const response = await fetch(resolveBackendUrl(path), {
    ...rest,
    headers: requestHeaders,
    body: body !== undefined ? serializeRequestBody(body) : undefined,
    cache: "no-store",
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
