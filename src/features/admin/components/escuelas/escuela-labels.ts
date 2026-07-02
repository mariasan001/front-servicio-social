import { estatusTone, formatEtiqueta as formatEtiquetaBase } from "@/lib/domain/labels";

const ESCUELA_LABEL_OVERRIDES: Record<string, string> = {
  ACTIVO: "Disponible",
};

export function formatEtiqueta(value?: string, fallback = "Sin información") {
  return formatEtiquetaBase(value, fallback, ESCUELA_LABEL_OVERRIDES);
}

export function escuelaEstatusTone(estatus?: string) {
  return estatusTone(estatus);
}

export { formatFecha } from "@/lib/domain/labels";
