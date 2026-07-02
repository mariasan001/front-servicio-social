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
