import type { StatusBadgeTone } from "@/shared/components/StatusBadge";

export function areaStatusLabel(activa?: boolean) {
  if (activa === false) {
    return "Inactiva";
  }

  return "Activa";
}

export function areaStatusTone(activa?: boolean): StatusBadgeTone {
  if (activa === false) {
    return "neutral";
  }

  return "success";
}

export function titularStatusLabel(vigente?: boolean) {
  if (vigente === false) {
    return "Sin vigencia";
  }

  return "En funciones";
}

export function titularStatusTone(vigente?: boolean): StatusBadgeTone {
  if (vigente === false) {
    return "warning";
  }

  return "success";
}

export function formatContacto(correo?: string, telefono?: string) {
  if (correo && telefono) {
    return `${correo} · ${telefono}`;
  }

  return correo ?? telefono ?? "Sin datos de contacto";
}

export function formatFecha(value?: string) {
  if (!value) {
    return "No registrada";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
  }).format(date);
}
