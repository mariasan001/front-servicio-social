export function normalizeDomainCode(value?: string | null) {
  return value?.trim().toUpperCase() ?? "";
}

export function matchesDomainCode(value: string | undefined | null, ...codes: string[]) {
  const normalized = normalizeDomainCode(value);
  return codes.some((code) => code === normalized);
}

export function readEntityEstatus(entity: unknown): string | undefined {
  if (entity && typeof entity === "object" && "estatus" in entity) {
    const estatus = (entity as { estatus?: unknown }).estatus;
    return typeof estatus === "string" ? estatus : undefined;
  }

  return undefined;
}
