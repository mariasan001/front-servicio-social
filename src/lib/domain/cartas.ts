export type CartaDownloadKind = "aceptacion" | "liberacion";

export function resolveCartaDownloadKind(tipoCarta?: string): CartaDownloadKind | null {
  const value = tipoCarta?.trim().toUpperCase() ?? "";

  if (value.includes("ACEPTACION") || value.includes("ACEPTACIÓN")) {
    return "aceptacion";
  }

  if (value.includes("LIBERACION") || value.includes("LIBERACIÓN")) {
    return "liberacion";
  }

  return null;
}

export function cartaTipoIncludes(tipoCarta: string | undefined, kind: CartaDownloadKind) {
  const resolved = resolveCartaDownloadKind(tipoCarta);
  return resolved === kind;
}
