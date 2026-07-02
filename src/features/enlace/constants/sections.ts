export const ENLACE_SECTIONS = [
  "inicio",
  "alumnos",
  "procesos",
  "reportes",
] as const;

export type EnlaceSectionSlug = (typeof ENLACE_SECTIONS)[number];
