import { USER_ROLES } from "@/lib/auth/constants";
import type { StatusBadgeTone } from "@/shared/components/StatusBadge";
import {
  areaStatusLabel,
  areaStatusTone,
  formatFecha,
} from "../areas/area-labels";

const ROLE_LABELS: Record<string, string> = {
  [USER_ROLES.ADMINISTRADOR]: "Administración",
  [USER_ROLES.DELEGACION]: "Delegación",
  [USER_ROLES.TITULAR_AREA]: "Titular de área",
  [USER_ROLES.ENLACE_ESCOLAR]: "Enlace escolar",
  [USER_ROLES.ALUMNO]: "Alumno",
  ADMINISTRADOR: "Administración",
  DELEGACION: "Delegación",
  TITULAR_AREA: "Titular de área",
  ENLACE_ESCOLAR: "Enlace escolar",
  ALUMNO: "Alumno",
};

export function formatRol(rol: string) {
  const trimmed = rol.trim();
  const withPrefix = trimmed.startsWith("ROLE_") ? trimmed : `ROLE_${trimmed}`;

  return (
    ROLE_LABELS[trimmed] ??
    ROLE_LABELS[withPrefix] ??
    trimmed
      .replace(/^ROLE_/, "")
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/^\w/, (char) => char.toUpperCase())
  );
}

export function formatRoles(roles: string[]) {
  if (roles.length === 0) {
    return "Sin perfil asignado";
  }

  return roles.map(formatRol).join(", ");
}

export function usuarioActivoLabel(activo?: boolean) {
  return areaStatusLabel(activo);
}

export function usuarioActivoTone(activo?: boolean): StatusBadgeTone {
  return areaStatusTone(activo);
}

export function formatSiNo(value?: boolean, fallback = "No especificado") {
  if (value === true) {
    return "Sí";
  }

  if (value === false) {
    return "No";
  }

  return fallback;
}

export { formatFecha };
