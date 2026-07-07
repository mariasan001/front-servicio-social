import type { CartaMetadataResponse, DocumentoEstatusResponse } from "@/lib/domain";
import { calcularHorasEntre, formatEtiqueta } from "@/lib/domain";

type DocumentoLike = Pick<DocumentoEstatusResponse, "nombreDocumento" | "tipoDocumento">;

type HoraRegistradaLike = {
  horasRegistradas?: number | null;
  horaEntrada?: string | null;
  horaSalida?: string | null;
};

export function resolveDocumentoNombre(documento: DocumentoLike, fallback = "Documento") {
  return (
    documento.nombreDocumento?.trim() ||
    formatEtiqueta(documento.tipoDocumento, fallback)
  );
}

export function resolveFileTypeLabel(_documento?: DocumentoLike) {
  return "PDF";
}

export function resolveCartaLabel(carta: Pick<CartaMetadataResponse, "tipoCarta">) {
  return formatEtiqueta(carta.tipoCarta, "Carta");
}

export function resolveCartaBadgeLabel(tipoCarta?: string) {
  const normalized = tipoCarta?.trim().toUpperCase() ?? "";

  if (normalized.includes("ACEPTACION")) return "ACEP";
  if (normalized.includes("LIBERACION")) return "LIB";
  return "PDF";
}

export function resolveHorasRegistradas(hora: HoraRegistradaLike): number | null {
  if (hora.horasRegistradas != null && Number.isFinite(hora.horasRegistradas)) {
    return hora.horasRegistradas;
  }

  if (hora.horaEntrada && hora.horaSalida) {
    return calcularHorasEntre(hora.horaEntrada, hora.horaSalida);
  }

  return null;
}
