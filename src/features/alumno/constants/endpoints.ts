export type AlumnoEndpointDefinition = {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  operationId: string;
  serviceFunction: string;
};

export const ALUMNO_SECTION_ENDPOINTS = {
  inicio: [
    {
      method: "GET",
      path: "/api/alumno/procesos/actual",
      operationId: "obtenerProcesoActual",
      serviceFunction: "getProcesoActual()",
    },
    {
      method: "GET",
      path: "/api/health",
      operationId: "health",
      serviceFunction: "getHealth()",
    },
    {
      method: "GET",
      path: "/api/notificaciones/no-leidas/count",
      operationId: "contarNoLeidas",
      serviceFunction: "countNotificacionesNoLeidas()",
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
      method: "GET",
      path: "/api/alumno/vacantes/{idVacante}",
      operationId: "detalleVacante_3",
      serviceFunction: "getVacante()",
    },
    {
      method: "GET",
      path: "/api/alumno/vacantes",
      operationId: "listarVacantes_3",
      serviceFunction: "listVacantes()",
    },
  ],
  postulaciones: [
    {
      method: "PATCH",
      path: "/api/alumno/postulaciones/{idPostulacion}/cancelar",
      operationId: "cancelarPostulacion",
      serviceFunction: "cancelPostulacion()",
    },
    {
      method: "GET",
      path: "/api/alumno/postulaciones/{idPostulacion}",
      operationId: "detallePostulacion_2",
      serviceFunction: "getPostulacion()",
    },
    {
      method: "GET",
      path: "/api/alumno/postulaciones",
      operationId: "listarPostulaciones",
      serviceFunction: "listPostulaciones()",
    },
    {
      method: "POST",
      path: "/api/alumno/postulaciones",
      operationId: "crearPostulacion",
      serviceFunction: "createPostulacion()",
    },
  ],
  proceso: [
    {
      method: "GET",
      path: "/api/alumno/procesos/{idProceso}/carta-aceptacion/archivo",
      operationId: "obtenerArchivoCartaAceptacion_1",
      serviceFunction: "getCartaAceptacionArchivo()",
    },
    {
      method: "GET",
      path: "/api/alumno/procesos/{idProceso}/carta-aceptacion",
      operationId: "obtenerCartaAceptacion_1",
      serviceFunction: "getCartaAceptacion()",
    },
    {
      method: "GET",
      path: "/api/alumno/procesos/{idProceso}/carta-liberacion/archivo",
      operationId: "obtenerArchivoCartaLiberacion_1",
      serviceFunction: "getCartaLiberacionArchivo()",
    },
    {
      method: "GET",
      path: "/api/alumno/procesos/{idProceso}/carta-liberacion",
      operationId: "obtenerCartaLiberacion_1",
      serviceFunction: "getCartaLiberacion()",
    },
    {
      method: "GET",
      path: "/api/alumno/procesos/{idProceso}/cartas",
      operationId: "listarCartas_2",
      serviceFunction: "listProcesoCartas()",
    },
    {
      method: "GET",
      path: "/api/alumno/procesos/{idProceso}/documentos/{idProcesoDocumento}/archivo-actual",
      operationId: "descargarArchivoActual_1",
      serviceFunction: "downloadDocumentoArchivoActual()",
    },
    {
      method: "POST",
      path: "/api/alumno/procesos/{idProceso}/documentos/{idProcesoDocumento}/archivo",
      operationId: "subirArchivo",
      serviceFunction: "uploadDocumentoArchivo()",
    },
    {
      method: "GET",
      path: "/api/alumno/procesos/{idProceso}/documentos",
      operationId: "listarDocumentos_2",
      serviceFunction: "listProcesoDocumentos()",
    },
    {
      method: "GET",
      path: "/api/alumno/procesos/{idProceso}/evaluacion-final",
      operationId: "obtenerEvaluacionFinal_2",
      serviceFunction: "getProcesoEvaluacionFinal()",
    },
    {
      method: "PATCH",
      path: "/api/alumno/procesos/{idProceso}/horas/{idAsistencia}/bitacora",
      operationId: "actualizarBitacora",
      serviceFunction: "updateProcesoHoraBitacora()",
    },
    {
      method: "GET",
      path: "/api/alumno/procesos/{idProceso}/horas/resumen",
      operationId: "resumen_1",
      serviceFunction: "getProcesoHorasResumen()",
    },
    {
      method: "GET",
      path: "/api/alumno/procesos/{idProceso}/horas",
      operationId: "listarHoras_1",
      serviceFunction: "listProcesoHoras()",
    },
    {
      method: "POST",
      path: "/api/alumno/procesos/{idProceso}/horas",
      operationId: "registrarHora_2",
      serviceFunction: "registerProcesoHora()",
    },
    {
      method: "GET",
      path: "/api/alumno/procesos/{idProceso}/incidencias",
      operationId: "listarProceso_2",
      serviceFunction: "listProcesoIncidencias()",
    },
    {
      method: "GET",
      path: "/api/alumno/procesos/{idProceso}/liberacion-tecnica",
      operationId: "obtenerLiberacionTecnica_2",
      serviceFunction: "getProcesoLiberacionTecnica()",
    },
    {
      method: "GET",
      path: "/api/alumno/procesos/{idProceso}",
      operationId: "detalleProceso_2",
      serviceFunction: "getProceso()",
    },
    {
      method: "GET",
      path: "/api/alumno/procesos",
      operationId: "listarProcesos_2",
      serviceFunction: "listProcesos()",
    },
  ],
  cv: [
    {
      method: "GET",
      path: "/api/alumno/cv",
      operationId: "obtenerCv",
      serviceFunction: "getCv()",
    },
    {
      method: "PATCH",
      path: "/api/alumno/cv",
      operationId: "actualizarCv",
      serviceFunction: "updateCv()",
    },
  ],
  notificaciones: [
    {
      method: "PATCH",
      path: "/api/notificaciones/{idNotificacion}/leer",
      operationId: "marcarLeida",
      serviceFunction: "markNotificacionRead()",
    },
    {
      method: "PATCH",
      path: "/api/notificaciones/leer-todas",
      operationId: "marcarTodasLeidas",
      serviceFunction: "markAllNotificacionesRead()",
    },
    {
      method: "GET",
      path: "/api/notificaciones",
      operationId: "listar",
      serviceFunction: "listNotificaciones()",
    },
  ],
} as const satisfies Record<string, AlumnoEndpointDefinition[]>;

export type AlumnoSectionSlug = keyof typeof ALUMNO_SECTION_ENDPOINTS;
