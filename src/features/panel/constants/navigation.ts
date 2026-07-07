import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Briefcase,
  Building2,
  ClipboardCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  Home,
  Layers,
  School,
  Shield,
  UserCircle,
  Users,
} from "lucide-react";
import { PANEL_PATHS, USER_ROLES, type UserRole } from "@/lib/auth/constants";
import { normalizeRoles } from "@/lib/auth/roles";

export type PanelNavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export type PanelNavGroup = {
  role: UserRole;
  label: string;
  basePath: string;
  items: PanelNavItem[];
};

function item(
  basePath: string,
  id: string,
  label: string,
  icon: LucideIcon,
  description?: string,
): PanelNavItem {
  return {
    id,
    label,
    href: id === "inicio" ? basePath : `${basePath}/${id}`,
    icon,
    description,
  };
}

export const PANEL_NAVIGATION: PanelNavGroup[] = [
  {
    role: USER_ROLES.ALUMNO,
    label: "Alumno",
    basePath: PANEL_PATHS.alumno,
    items: [
      item(PANEL_PATHS.alumno, "inicio", "Inicio", Home, "Resumen de tu participación."),
      item(PANEL_PATHS.alumno, "vacantes", "Vacantes", Briefcase, "Explora oportunidades disponibles."),
      item(PANEL_PATHS.alumno, "postulaciones", "Postulaciones", ClipboardList, "Consulta el estatus de tus postulaciones."),
      item(PANEL_PATHS.alumno, "proceso", "Mi proceso", FileText, "Seguimiento de tu servicio social o residencia."),
      item(PANEL_PATHS.alumno, "cv", "Mi CV", UserCircle, "Actualiza tu currículum vitae."),
    ],
  },
  {
    role: USER_ROLES.DELEGACION,
    label: "Delegación",
    basePath: PANEL_PATHS.delegacion,
    items: [
      item(PANEL_PATHS.delegacion, "inicio", "Inicio", Home, "Resumen operativo del programa."),
      item(PANEL_PATHS.delegacion, "vacantes", "Vacantes", Briefcase, "Gestión y revisión de vacantes."),
      item(PANEL_PATHS.delegacion, "postulaciones", "Postulaciones", ClipboardList, "Seguimiento de postulaciones."),
      item(PANEL_PATHS.delegacion, "procesos", "Alumnos", FileText, "Seguimiento de alumnos en servicio social."),
      item(
        PANEL_PATHS.delegacion,
        "validacion",
        "Validaciones",
        ClipboardCheck,
        "Revisa documentos, horas e incidencias.",
      ),
      item(
        PANEL_PATHS.delegacion,
        "alumnos",
        "Vinculaciones",
        School,
        "Asigna la escuela correcta a alumnos registrados.",
      ),
      item(PANEL_PATHS.delegacion, "reportes", "Reportes", BarChart3, "Indicadores y exportaciones."),
    ],
  },
  {
    role: USER_ROLES.TITULAR_AREA,
    label: "Titular de área",
    basePath: PANEL_PATHS.titular,
    items: [
      item(PANEL_PATHS.titular, "inicio", "Inicio", Home, "Resumen de tu área."),
      item(PANEL_PATHS.titular, "vacantes", "Vacantes", Briefcase, "Vacantes de tu dependencia."),
      item(PANEL_PATHS.titular, "postulaciones", "Postulaciones", ClipboardList, "Revisión de candidatos."),
      item(
        PANEL_PATHS.titular,
        "procesos",
        "Alumnos",
        GraduationCap,
        "Horas, incidencias, liberación y evaluación.",
      ),
    ],
  },
  {
    role: USER_ROLES.ADMINISTRADOR,
    label: "Administración",
    basePath: PANEL_PATHS.admin,
    items: [
      item(PANEL_PATHS.admin, "inicio", "Inicio", Home, "Resumen del sistema."),
      item(PANEL_PATHS.admin, "dependencias", "Dependencias", Building2, "Dependencias receptoras."),
      item(PANEL_PATHS.admin, "escuelas", "Escuelas", School, "Catálogo de instituciones educativas."),
      item(PANEL_PATHS.admin, "areas", "Áreas", Layers, "Áreas y titulares asignados."),
      item(PANEL_PATHS.admin, "usuarios", "Usuarios internos", Users, "Alta y administración de cuentas."),
    ],
  },
  {
    role: USER_ROLES.ENLACE_ESCOLAR,
    label: "Enlace escolar",
    basePath: PANEL_PATHS.enlace,
    items: [
      item(PANEL_PATHS.enlace, "inicio", "Inicio", Home, "Resumen de alumnos vinculados."),
      item(PANEL_PATHS.enlace, "alumnos", "Alumnos", GraduationCap, "Consulta de alumnos de tu escuela."),
      item(PANEL_PATHS.enlace, "procesos", "Procesos", FileText, "Seguimiento de procesos activos."),
      item(PANEL_PATHS.enlace, "reportes", "Reportes", BarChart3, "Reportes institucionales."),
    ],
  },
];

export function getNavigationForRole(role: UserRole) {
  return PANEL_NAVIGATION.find((group) => group.role === role) ?? null;
}

export function getAccessibleNavigations(roles: string[] | undefined | null) {
  const normalized = normalizeRoles(roles);

  return PANEL_NAVIGATION.filter((group) => normalized.includes(group.role));
}
