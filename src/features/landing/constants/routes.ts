export const PUBLIC_VACANTES_ROUTES = {
  directory: "/vacantes",
  detail: (idVacante: number | string) => `/vacantes/${idVacante}`,
} as const;
