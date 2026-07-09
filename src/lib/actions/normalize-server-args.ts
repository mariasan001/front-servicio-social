const RSC_UNDEFINED = "$undefined";

export function normalizeOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === RSC_UNDEFINED) {
    return undefined;
  }

  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed || trimmed === RSC_UNDEFINED) {
      return undefined;
    }

    const parsed = Number(trimmed);

    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return undefined;
}

export function normalizeOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === RSC_UNDEFINED) {
    return undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed === RSC_UNDEFINED) {
    return undefined;
  }

  return trimmed;
}

/** Omite claves con valor `undefined` antes de enviar a server actions. */
export function compactPayload<T extends Record<string, unknown>>(payload: T): T {
  const result = {} as Record<string, unknown>;

  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }

  return result as T;
}

export function compactOptionalStrings<T extends Record<string, string>>(
  values: T,
  keys: readonly (keyof T)[],
): Partial<T> {
  const result: Partial<T> = {};

  for (const key of keys) {
    const trimmed = values[key].trim();
    if (trimmed) {
      result[key] = trimmed as T[typeof key];
    }
  }

  return result;
}
