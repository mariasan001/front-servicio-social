export const DELEGACION_SECTIONS = [
  "inicio",
  "vacantes",
  "postulaciones",
  "procesos",
  "documentos",
  "horas",
  "incidencias",
  "alumnos",
  "reportes",
] as const;

export type DelegacionSectionSlug = (typeof DELEGACION_SECTIONS)[number];
