export type EnlaceEndpointDefinition = {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  operationId: string;
  serviceFunction: string;
};

export const ENLACE_SECTION_ENDPOINTS = {
  inicio: [
    {
      method: "GET",
      path: "/api/enlace/dashboard/resumen",
      operationId: "resumen",
      serviceFunction: "getDashboardResumen()",
    },
    {
      method: "GET",
      path: "/api/health",
      operationId: "health",
      serviceFunction: "getHealth()",
    },
    {
      method: "GET",
      path: "/auth/me",
      operationId: "me",
      serviceFunction: "getServerSession()",
    },
  ],
  alumnos: [
    {
      method: "GET",
      path: "/api/enlace/alumnos/{idAlumno}",
      operationId: "obtenerAlumno",
      serviceFunction: "getAlumno()",
    },
    {
      method: "GET",
      path: "/api/enlace/alumnos",
      operationId: "listarAlumnos",
      serviceFunction: "listAlumnos()",
    },
  ],
  procesos: [
    {
      method: "GET",
      path: "/api/enlace/procesos/{idProceso}/cartas",
      operationId: "listarCartas",
      serviceFunction: "listProcesoCartas()",
    },
    {
      method: "GET",
      path: "/api/enlace/procesos/{idProceso}/documentos",
      operationId: "listarDocumentos",
      serviceFunction: "listProcesoDocumentos()",
    },
    {
      method: "GET",
      path: "/api/enlace/procesos/{idProceso}/horas/resumen",
      operationId: "resumenHoras",
      serviceFunction: "getProcesoHorasResumen()",
    },
    {
      method: "GET",
      path: "/api/enlace/procesos/{idProceso}",
      operationId: "obtenerProceso",
      serviceFunction: "getProceso()",
    },
  ],
  reportes: [
    {
      method: "GET",
      path: "/api/enlace/reportes/alumnos",
      operationId: "reporteAlumnos",
      serviceFunction: "getReporteAlumnos()",
    },
  ],
} as const satisfies Record<string, EnlaceEndpointDefinition[]>;

export type EnlaceSectionSlug = keyof typeof ENLACE_SECTION_ENDPOINTS;
