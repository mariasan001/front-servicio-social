export type TitularEndpointDefinition = {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  operationId: string;
  serviceFunction: string;
};

export const TITULAR_SECTION_ENDPOINTS = {
  inicio: [
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
  vacantes: [
    {
      method: "PATCH",
      path: "/api/titular/vacantes/{idVacante}/cancelar",
      operationId: "cancelarVacante",
      serviceFunction: "cancelVacante()",
    },
    {
      method: "POST",
      path: "/api/titular/vacantes/{idVacante}/enviar-revision",
      operationId: "enviarRevision",
      serviceFunction: "sendVacanteToReview()",
    },
    {
      method: "GET",
      path: "/api/titular/vacantes/{idVacante}",
      operationId: "detalleVacante",
      serviceFunction: "getVacante()",
    },
    {
      method: "PATCH",
      path: "/api/titular/vacantes/{idVacante}",
      operationId: "actualizarVacante",
      serviceFunction: "updateVacante()",
    },
    {
      method: "GET",
      path: "/api/titular/vacantes",
      operationId: "listarVacantes",
      serviceFunction: "listVacantes()",
    },
    {
      method: "POST",
      path: "/api/titular/vacantes",
      operationId: "crearVacante",
      serviceFunction: "createVacante()",
    },
  ],
  postulaciones: [
    {
      method: "PATCH",
      path: "/api/titular/postulaciones/{idPostulacion}/aceptar",
      operationId: "aceptarPostulacion",
      serviceFunction: "acceptPostulacion()",
    },
    {
      method: "PATCH",
      path: "/api/titular/postulaciones/{idPostulacion}/examen-finalizado",
      operationId: "examenFinalizado",
      serviceFunction: "markPostulacionExamFinished()",
    },
    {
      method: "PATCH",
      path: "/api/titular/postulaciones/{idPostulacion}/rechazar",
      operationId: "rechazarPostulacion",
      serviceFunction: "rejectPostulacion()",
    },
    {
      method: "GET",
      path: "/api/titular/postulaciones/{idPostulacion}",
      operationId: "detallePostulacion",
      serviceFunction: "getPostulacion()",
    },
    {
      method: "GET",
      path: "/api/titular/postulaciones",
      operationId: "listarPostulaciones_1",
      serviceFunction: "listPostulaciones()",
    },
  ],
  procesos: [
    {
      method: "GET",
      path: "/api/titular/procesos/{idProceso}/evaluacion-final",
      operationId: "obtenerEvaluacionFinal",
      serviceFunction: "getProcesoEvaluacionFinal()",
    },
    {
      method: "POST",
      path: "/api/titular/procesos/{idProceso}/evaluacion-final",
      operationId: "registrarEvaluacionFinal",
      serviceFunction: "registerProcesoEvaluacionFinal()",
    },
    {
      method: "PATCH",
      path: "/api/titular/procesos/{idProceso}/horas/{idAsistencia}/observar",
      operationId: "observarHora",
      serviceFunction: "observeProcesoHora()",
    },
    {
      method: "PATCH",
      path: "/api/titular/procesos/{idProceso}/horas/{idAsistencia}/rechazar",
      operationId: "rechazarHora",
      serviceFunction: "rejectProcesoHora()",
    },
    {
      method: "PATCH",
      path: "/api/titular/procesos/{idProceso}/horas/{idAsistencia}/validar",
      operationId: "validarHora",
      serviceFunction: "validateProcesoHora()",
    },
    {
      method: "GET",
      path: "/api/titular/procesos/{idProceso}/horas",
      operationId: "listarHoras",
      serviceFunction: "listProcesoHoras()",
    },
    {
      method: "POST",
      path: "/api/titular/procesos/{idProceso}/horas",
      operationId: "registrarHora",
      serviceFunction: "registerProcesoHora()",
    },
    {
      method: "GET",
      path: "/api/titular/procesos/{idProceso}/incidencias",
      operationId: "listarProceso",
      serviceFunction: "listProcesoIncidencias()",
    },
    {
      method: "POST",
      path: "/api/titular/procesos/{idProceso}/incidencias",
      operationId: "registrarIncidencia",
      serviceFunction: "registerProcesoIncidencia()",
    },
    {
      method: "GET",
      path: "/api/titular/procesos/{idProceso}/liberacion-tecnica",
      operationId: "obtenerLiberacionTecnica",
      serviceFunction: "getProcesoLiberacionTecnica()",
    },
    {
      method: "POST",
      path: "/api/titular/procesos/{idProceso}/liberacion-tecnica",
      operationId: "emitirLiberacionTecnica",
      serviceFunction: "emitProcesoLiberacionTecnica()",
    },
    {
      method: "GET",
      path: "/api/titular/procesos/{idProceso}",
      operationId: "detalleProceso",
      serviceFunction: "getProceso()",
    },
    {
      method: "GET",
      path: "/api/titular/procesos",
      operationId: "listarProcesos",
      serviceFunction: "listProcesos()",
    },
  ],
  incidencias: [
    {
      method: "GET",
      path: "/api/titular/incidencias/{idIncidencia}",
      operationId: "detalleIncidencia",
      serviceFunction: "getIncidencia()",
    },
    {
      method: "GET",
      path: "/api/titular/incidencias",
      operationId: "listarIncidencias",
      serviceFunction: "listIncidencias()",
    },
  ],
} as const satisfies Record<string, TitularEndpointDefinition[]>;

export type TitularSectionSlug = keyof typeof TITULAR_SECTION_ENDPOINTS;
