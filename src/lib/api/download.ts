import { cookies } from "next/headers";
import { resolveBackendUrl } from "./client";
import { ApiError } from "./errors";
import type { ApiResponse } from "./types";

export type DownloadedFile = {
  filename: string;
  contentType: string;
  base64: string;
};

function parseFilename(contentDisposition: string | null) {
  if (!contentDisposition) {
    return undefined;
  }

  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const basicMatch = /filename="?([^";]+)"?/i.exec(contentDisposition);
  return basicMatch?.[1] ? decodeURIComponent(basicMatch[1]) : undefined;
}

function extractFileFromJsonData(
  data: unknown,
  fallbackFilename: string,
): DownloadedFile | null {
  if (typeof data === "string") {
    return {
      filename: fallbackFilename,
      contentType: "application/octet-stream",
      base64: data,
    };
  }

  if (!data || typeof data !== "object") {
    return null;
  }

  const record = data as Record<string, unknown>;
  const base64 =
    (typeof record.contenidoBase64 === "string" && record.contenidoBase64) ||
    (typeof record.base64 === "string" && record.base64) ||
    (typeof record.contenido === "string" && record.contenido) ||
    (typeof record.archivoBase64 === "string" && record.archivoBase64);

  if (!base64) {
    return null;
  }

  const filename =
    (typeof record.nombreArchivo === "string" && record.nombreArchivo) ||
    (typeof record.fileName === "string" && record.fileName) ||
    (typeof record.filename === "string" && record.filename) ||
    fallbackFilename;

  const contentType =
    (typeof record.contentType === "string" && record.contentType) ||
    (typeof record.tipoContenido === "string" && record.tipoContenido) ||
    "application/octet-stream";

  return { filename, contentType, base64 };
}

export async function serverDownloadRequest(
  path: string,
  fallbackFilename = "archivo",
): Promise<DownloadedFile> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const response = await fetch(resolveBackendUrl(path), {
    method: "GET",
    headers: {
      Accept: "*/*",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    let payload: ApiResponse<unknown> | null = null;

    try {
      payload = (await response.json()) as ApiResponse<unknown>;
    } catch {
      payload = null;
    }

    if (!response.ok || payload?.success === false) {
      throw new ApiError(
        payload?.message ?? "No fue posible descargar el archivo.",
        payload?.code ?? "DOWNLOAD_FAILED",
        response.status,
        payload?.errors,
      );
    }

    const file = extractFileFromJsonData(payload?.data, fallbackFilename);

    if (!file) {
      throw new ApiError(
        "El servidor no devolvió el archivo esperado.",
        "INVALID_DOWNLOAD",
        response.status,
      );
    }

    return file;
  }

  if (!response.ok) {
    throw new ApiError(
      "No fue posible descargar el archivo.",
      "DOWNLOAD_FAILED",
      response.status,
    );
  }

  const buffer = await response.arrayBuffer();

  return {
    filename: parseFilename(response.headers.get("content-disposition")) ?? fallbackFilename,
    contentType: contentType.split(";")[0]?.trim() || "application/octet-stream",
    base64: Buffer.from(buffer).toString("base64"),
  };
}
