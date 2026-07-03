import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  Award,
  Bell,
  CalendarCheck,
  ClipboardList,
  FileCheck,
  FileText,
  GraduationCap,
  ScrollText,
  Sparkles,
} from "lucide-react";
import { formatFecha } from "@/lib/domain";
import type { NotificacionBase } from "@/lib/domain";

export type NotificacionIconTone =
  | "success"
  | "warning"
  | "danger"
  | "brand"
  | "gold"
  | "info";

export type NotificacionPresentation = {
  icon: LucideIcon;
  tone: NotificacionIconTone;
};

type NotificacionPresentationInput = Pick<NotificacionBase, "tipo" | "titulo" | "mensaje">;

const TIPO_PRESENTATION: Record<string, NotificacionPresentation> = {
  POSTULACION_ACEPTADA: { icon: ClipboardList, tone: "success" },
  POSTULACION_RECHAZADA: { icon: ClipboardList, tone: "danger" },
  DOCUMENTO_APROBADO: { icon: FileCheck, tone: "success" },
  DOCUMENTO_OBSERVADO: { icon: FileText, tone: "warning" },
  DOCUMENTO_RECHAZADO: { icon: FileText, tone: "danger" },
  CARTA_ACEPTACION_EMITIDA: { icon: ScrollText, tone: "brand" },
  PROCESO_ACTIVADO: { icon: Sparkles, tone: "gold" },
  HORA_OBSERVADA: { icon: CalendarCheck, tone: "warning" },
  HORA_RECHAZADA: { icon: CalendarCheck, tone: "danger" },
  HORAS_COMPLETAS: { icon: CalendarCheck, tone: "success" },
  EVALUACION_FINAL_REGISTRADA: { icon: Award, tone: "success" },
  LIBERACION_TECNICA_EMITIDA: { icon: GraduationCap, tone: "brand" },
  CARTA_LIBERACION_EMITIDA: { icon: ScrollText, tone: "brand" },
  INCIDENCIA_REGISTRADA: { icon: ArrowLeftRight, tone: "warning" },
  INCIDENCIA_RESUELTA: { icon: ArrowLeftRight, tone: "success" },
};

function buildHaystack(input: NotificacionPresentationInput) {
  return [input.tipo, input.titulo, input.mensaje]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" ")
    .toUpperCase();
}

function matchByKeywords(haystack: string): NotificacionPresentation | null {
  if (
    haystack.includes("RECHAZ") ||
    haystack.includes("NEGAD") ||
    haystack.includes("DENEG")
  ) {
    return { icon: FileText, tone: "danger" };
  }

  if (haystack.includes("OBSERV") || haystack.includes("INCIDENCIA")) {
    return { icon: FileText, tone: "warning" };
  }

  if (
    haystack.includes("APROB") ||
    haystack.includes("ACEPT") ||
    haystack.includes("COMPLET") ||
    haystack.includes("LIBER") ||
    haystack.includes("RESUEL")
  ) {
    return { icon: FileCheck, tone: "success" };
  }

  if (haystack.includes("CARTA")) {
    return { icon: ScrollText, tone: "brand" };
  }

  if (haystack.includes("DOCUMENT")) {
    return { icon: FileText, tone: "info" };
  }

  if (haystack.includes("HORA") || haystack.includes("ASISTENCIA")) {
    return { icon: CalendarCheck, tone: "warning" };
  }

  if (haystack.includes("POSTUL") || haystack.includes("VACANT") || haystack.includes("EXAMEN")) {
    return { icon: ClipboardList, tone: "gold" };
  }

  if (haystack.includes("PROCESO") || haystack.includes("ACTIV")) {
    return { icon: Sparkles, tone: "gold" };
  }

  if (haystack.includes("EVALUAC") || haystack.includes("NOMINA") || haystack.includes("PAGO")) {
    return { icon: Award, tone: "brand" };
  }

  return null;
}

export function getNotificacionPresentation(
  input: NotificacionPresentationInput | string,
): NotificacionPresentation {
  if (typeof input === "string") {
    const tipo = input.trim().toUpperCase();
    return TIPO_PRESENTATION[tipo] ?? matchByKeywords(tipo) ?? { icon: Bell, tone: "info" };
  }

  const tipo = input.tipo?.trim().toUpperCase() ?? "";
  if (tipo && TIPO_PRESENTATION[tipo]) {
    return TIPO_PRESENTATION[tipo];
  }

  const haystack = buildHaystack(input);
  if (haystack) {
    const matched = matchByKeywords(haystack);
    if (matched) {
      return matched;
    }
  }

  return { icon: Bell, tone: "info" };
}

export function formatNotificacionTiempo(fecha?: string) {
  if (!fecha?.trim()) {
    return "Sin fecha";
  }

  const parsed = new Date(fecha);
  if (Number.isNaN(parsed.getTime())) {
    return formatFecha(fecha);
  }

  const now = Date.now();
  const diffMs = now - parsed.getTime();

  if (diffMs < 0) {
    return formatFecha(fecha);
  }

  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) {
    return "Hace un momento";
  }

  if (diffMinutes < 60) {
    return `Hace ${diffMinutes} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `Hace ${diffHours} h`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 1) {
    return "Ayer";
  }

  if (diffDays < 7) {
    return `Hace ${diffDays} días`;
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: parsed.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  }).format(parsed);
}
