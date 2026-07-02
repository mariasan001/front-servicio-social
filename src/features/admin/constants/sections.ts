export const ADMIN_SECTIONS = [
  "inicio",
  "dependencias",
  "escuelas",
  "areas",
  "usuarios",
] as const;

export type AdminSectionSlug = (typeof ADMIN_SECTIONS)[number];
