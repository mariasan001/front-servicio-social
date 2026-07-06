import type { CartaMetadataResponse, ProcesoDocumentoResponse, ProcesoHoraResponse } from "../../types/delegacion.types";
import { calcularHorasEntre, formatEtiqueta } from "@/lib/domain";

export function resolveDocumentoNombre(documento: ProcesoDocumentoResponse) {
  return documento.nombreDocumento?.trim() || formatEtiqueta(documento.tipoDocumento, "Documento");
}

export function resolveFileTypeLabel(documento: ProcesoDocumentoResponse) {
  const haystack = `${documento.nombreDocumento ?? ""} ${documento.tipoDocumento ?? ""}`.toLowerCase();

  if (haystack.includes("pdf")) return "PDF";
  if (haystack.includes("excel") || haystack.includes("xls")) return "XLS";
  if (haystack.includes("jpg") || haystack.includes("jpeg") || haystack.includes("png")) return "IMG";
  if (haystack.includes("word") || haystack.includes("doc")) return "DOC";
  return "DOC";
}

export function resolveCartaLabel(carta: CartaMetadataResponse) {
  return formatEtiqueta(carta.tipoCarta, "Carta");
}

export function resolveCartaBadgeLabel(tipoCarta?: string) {
  const normalized = tipoCarta?.trim().toUpperCase() ?? "";

  if (normalized.includes("ACEPTACION")) return "ACEP";
  if (normalized.includes("LIBERACION")) return "LIB";
  return "PDF";
}

export function resolveHorasRegistradas(hora: ProcesoHoraResponse): number | null {
  if (hora.horasRegistradas != null && Number.isFinite(hora.horasRegistradas)) {
    return hora.horasRegistradas;
  }

  if (hora.horaEntrada && hora.horaSalida) {
    return calcularHorasEntre(hora.horaEntrada, hora.horaSalida);
  }

  return null;
}
