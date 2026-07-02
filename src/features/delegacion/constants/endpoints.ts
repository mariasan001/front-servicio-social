export type DelegacionEndpointDefinition = {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  operationId: string;
  serviceFunction: string;
};

export const DELEGACION_SECTION_ENDPOINTS = {
  inicio: [
    {
      method: "GET",
      path: "/api/delegacion/liberaciones-tecnicas/pendientes-carta",
      operationId: "listarPendientesCarta",
      serviceFunction: "listLiberacionesPendientesCarta()",
    },
    {
      method: "GET",
      path: "/api/delegacion/notificaciones/correos",
      operationId: "listar_1",
      serviceFunction: "listNotificacionesCorreos()",
    },
    {
      method: "GET",
      path: "/api/delegacion/reportes/dashboard",
      operationId: "dashboard",
      serviceFunction: "getDashboard()",
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
  vacantes: [
    {
      method: "PATCH",
      path: "/api/delegacion/vacantes/{idVacante}/cerrar",
      operationId: "cerrarVacante",
      serviceFunction: "closeVacante()",
    },
    {
      method: "PATCH",
      path: "/api/delegacion/vacantes/{idVacante}/publicar",
      operationId: "publicarVacante",
      serviceFunction: "publishVacante()",
    },
    {
      method: "PATCH",
      path: "/api/delegacion/vacantes/{idVacante}/rechazar",
      operationId: "rechazarVacante",
      serviceFunction: "rejectVacante()",
    },
    {
      method: "GET",
      path: "/api/delegacion/vacantes/{idVacante}",
      operationId: "detalleVacante_2",
      serviceFunction: "getVacante()",
    },
    {
      method: "GET",
      path: "/api/delegacion/vacantes",
      operationId: "listarVacantes_2",
      serviceFunction: "listVacantes()",
    },
  ],
  postulaciones: [
    {
      method: "GET",
      path: "/api/delegacion/postulaciones/{idPostulacion}",
      operationId: "detallePostulacion_1",
      serviceFunction: "getPostulacion()",
    },
    {
      method: "GET",
      path: "/api/delegacion/postulaciones",
      operationId: "listarPostulaciones_2",
      serviceFunction: "listPostulaciones()",
    },
  ],
  procesos: [
    {
      method: "PATCH",
      path: "/api/delegacion/procesos/{idProceso}/cancelar",
      operationId: "cancelarProceso",
      serviceFunction: "cancelProceso()",
    },
    {
      method: "GET",
      path: "/api/delegacion/procesos/{idProceso}/carta-aceptacion/archivo",
      operationId: "obtenerArchivoCartaAceptacion",
      serviceFunction: "downloadProcesoCartaAceptacionArchivo()",
    },
    {
      method: "POST",
      path: "/api/delegacion/procesos/{idProceso}/carta-aceptacion/emitir-con-archivo",
      operationId: "emitirCartaAceptacionConArchivo",
      serviceFunction: "emitProcesoCartaAceptacionConArchivo()",
    },
    {
      method: "POST",
      path: "/api/delegacion/procesos/{idProceso}/carta-aceptacion/emitir",
      operationId: "emitirCartaAceptacion",
      serviceFunction: "emitProcesoCartaAceptacion()",
    },
    {
      method: "GET",
      path: "/api/delegacion/procesos/{idProceso}/carta-aceptacion",
      operationId: "obtenerCartaAceptacion",
      serviceFunction: "getProcesoCartaAceptacion()",
    },
    {
      method: "GET",
      path: "/api/delegacion/procesos/{idProceso}/carta-liberacion/archivo",
      operationId: "obtenerArchivoCartaLiberacion",
      serviceFunction: "downloadProcesoCartaLiberacionArchivo()",
    },
    {
      method: "POST",
      path: "/api/delegacion/procesos/{idProceso}/carta-liberacion/emitir-con-archivo",
      operationId: "emitirCartaLiberacionConArchivo",
      serviceFunction: "emitProcesoCartaLiberacionConArchivo()",
    },
    {
      method: "POST",
      path: "/api/delegacion/procesos/{idProceso}/carta-liberacion/emitir",
      operationId: "emitirCartaLiberacion",
      serviceFunction: "emitProcesoCartaLiberacion()",
    },
    {
      method: "GET",
      path: "/api/delegacion/procesos/{idProceso}/carta-liberacion",
      operationId: "obtenerCartaLiberacion",
      serviceFunction: "getProcesoCartaLiberacion()",
    },
    {
      method: "GET",
      path: "/api/delegacion/procesos/{idProceso}/cartas",
      operationId: "listarCartas_1",
      serviceFunction: "listProcesoCartas()",
    },
    {
      method: "PATCH",
      path: "/api/delegacion/procesos/{idProceso}/documentos/{idProcesoDocumento}/aprobar",
      operationId: "aprobarDocumento",
      serviceFunction: "approveProcesoDocumento()",
    },
    {
      method: "GET",
      path: "/api/delegacion/procesos/{idProceso}/documentos/{idProcesoDocumento}/archivo-actual",
      operationId: "descargarArchivoActual",
      serviceFunction: "downloadProcesoDocumentoArchivo()",
    },
    {
      method: "PATCH",
      path: "/api/delegacion/procesos/{idProceso}/documentos/{idProcesoDocumento}/observar",
      operationId: "observarDocumento",
      serviceFunction: "observeProcesoDocumento()",
    },
    {
      method: "PATCH",
      path: "/api/delegacion/procesos/{idProceso}/documentos/{idProcesoDocumento}/rechazar",
      operationId: "rechazarDocumento",
      serviceFunction: "rejectProcesoDocumento()",
    },
    {
      method: "GET",
      path: "/api/delegacion/procesos/{idProceso}/documentos",
      operationId: "listarDocumentos_1",
      serviceFunction: "listProcesoDocumentos()",
    },
    {
      method: "GET",
      path: "/api/delegacion/procesos/{idProceso}/evaluacion-final",
      operationId: "obtenerEvaluacionFinal_1",
      serviceFunction: "getProcesoEvaluacionFinal()",
    },
    {
      method: "PATCH",
      path: "/api/delegacion/procesos/{idProceso}/horas-requeridas",
      operationId: "capturarHorasRequeridas",
      serviceFunction: "setProcesoHorasRequeridas()",
    },
    {
      method: "PATCH",
      path: "/api/delegacion/procesos/{idProceso}/horas/{idAsistencia}/cancelar",
      operationId: "cancelarHora",
      serviceFunction: "cancelProcesoHora()",
    },
    {
      method: "PATCH",
      path: "/api/delegacion/procesos/{idProceso}/horas/{idAsistencia}/observar",
      operationId: "observarHora_1",
      serviceFunction: "observeProcesoHora()",
    },
    {
      method: "PATCH",
      path: "/api/delegacion/procesos/{idProceso}/horas/{idAsistencia}/rechazar",
      operationId: "rechazarHora_1",
      serviceFunction: "rejectProcesoHora()",
    },
    {
      method: "PATCH",
      path: "/api/delegacion/procesos/{idProceso}/horas/{idAsistencia}/validar",
      operationId: "validarHora_1",
      serviceFunction: "validateProcesoHora()",
    },
    {
      method: "GET",
      path: "/api/delegacion/procesos/{idProceso}/horas",
      operationId: "listarHorasProceso",
      serviceFunction: "listProcesoHoras()",
    },
    {
      method: "POST",
      path: "/api/delegacion/procesos/{idProceso}/horas",
      operationId: "registrarHora_1",
      serviceFunction: "registerProcesoHora()",
    },
    {
      method: "GET",
      path: "/api/delegacion/procesos/{idProceso}/incidencias",
      operationId: "listarProceso_1",
      serviceFunction: "listarProceso_1()",
    },
    {
      method: "POST",
      path: "/api/delegacion/procesos/{idProceso}/incidencias",
      operationId: "registrarIncidencia_1",
      serviceFunction: "registerProcesoIncidencia()",
    },
    {
      method: "GET",
      path: "/api/delegacion/procesos/{idProceso}/liberacion-tecnica",
      operationId: "obtenerLiberacionTecnica_1",
      serviceFunction: "getProcesoLiberacionTecnica()",
    },
    {
      method: "GET",
      path: "/api/delegacion/procesos/{idProceso}",
      operationId: "detalleProceso_1",
      serviceFunction: "getProceso()",
    },
    {
      method: "GET",
      path: "/api/delegacion/procesos",
      operationId: "listarProcesos_1",
      serviceFunction: "listProcesos()",
    },
  ],
  documentos: [
    {
      method: "GET",
      path: "/api/delegacion/documentos/pendientes",
      operationId: "listarPendientes_1",
      serviceFunction: "listDocumentosPendientes()",
    },
  ],
  horas: [
    {
      method: "GET",
      path: "/api/delegacion/horas/pendientes",
      operationId: "listarPendientes",
      serviceFunction: "listHorasPendientes()",
    },
  ],
  incidencias: [
    {
      method: "PATCH",
      path: "/api/delegacion/incidencias/{idIncidencia}/cancelar",
      operationId: "cancelarIncidencia",
      serviceFunction: "cancelIncidencia()",
    },
    {
      method: "PATCH",
      path: "/api/delegacion/incidencias/{idIncidencia}/resolver",
      operationId: "resolverIncidencia",
      serviceFunction: "resolveIncidencia()",
    },
    {
      method: "GET",
      path: "/api/delegacion/incidencias/{idIncidencia}",
      operationId: "detalleIncidencia_1",
      serviceFunction: "getIncidencia()",
    },
    {
      method: "GET",
      path: "/api/delegacion/incidencias",
      operationId: "listarGlobal",
      serviceFunction: "listIncidencias()",
    },
  ],
  alumnos: [
    {
      method: "POST",
      path: "/api/delegacion/alumnos/{idAlumno}/crear-escuela-y-normalizar",
      operationId: "crearEscuelaYNormalizar",
      serviceFunction: "createEscuelaAndNormalizeAlumno()",
    },
    {
      method: "GET",
      path: "/api/delegacion/alumnos/{idAlumno}/cv",
      operationId: "obtenerCvAlumno",
      serviceFunction: "getAlumnoCv()",
    },
    {
      method: "PATCH",
      path: "/api/delegacion/alumnos/{idAlumno}/normalizar-escuela",
      operationId: "normalizarConEscuelaExistente",
      serviceFunction: "normalizeAlumnoEscuela()",
    },
    {
      method: "GET",
      path: "/api/delegacion/alumnos/escuela-por-normalizar",
      operationId: "listarPorNormalizar",
      serviceFunction: "listAlumnosPorNormalizar()",
    },
  ],
  reportes: [
    {
      method: "GET",
      path: "/api/delegacion/reportes/documentos/export",
      operationId: "exportarDocumentos",
      serviceFunction: "buildDelegacionReportExportUrl()",
    },
    {
      method: "GET",
      path: "/api/delegacion/reportes/documentos",
      operationId: "documentos",
      serviceFunction: "getReporteDocumentos()",
    },
    {
      method: "GET",
      path: "/api/delegacion/reportes/horas/export",
      operationId: "exportarHoras",
      serviceFunction: "buildDelegacionReportExportUrl()",
    },
    {
      method: "GET",
      path: "/api/delegacion/reportes/horas",
      operationId: "horas",
      serviceFunction: "getReporteHoras()",
    },
    {
      method: "GET",
      path: "/api/delegacion/reportes/incidencias/export",
      operationId: "exportarIncidencias",
      serviceFunction: "buildDelegacionReportExportUrl()",
    },
    {
      method: "GET",
      path: "/api/delegacion/reportes/incidencias",
      operationId: "incidencias",
      serviceFunction: "getReporteIncidencias()",
    },
    {
      method: "GET",
      path: "/api/delegacion/reportes/liberaciones/export",
      operationId: "exportarLiberaciones",
      serviceFunction: "buildDelegacionReportExportUrl()",
    },
    {
      method: "GET",
      path: "/api/delegacion/reportes/liberaciones",
      operationId: "liberaciones",
      serviceFunction: "getReporteLiberaciones()",
    },
    {
      method: "GET",
      path: "/api/delegacion/reportes/postulaciones/export",
      operationId: "exportarPostulaciones",
      serviceFunction: "buildDelegacionReportExportUrl()",
    },
    {
      method: "GET",
      path: "/api/delegacion/reportes/postulaciones",
      operationId: "postulaciones",
      serviceFunction: "getReportePostulaciones()",
    },
    {
      method: "GET",
      path: "/api/delegacion/reportes/procesos/export",
      operationId: "exportarProcesos",
      serviceFunction: "buildDelegacionReportExportUrl()",
    },
    {
      method: "GET",
      path: "/api/delegacion/reportes/procesos",
      operationId: "procesos",
      serviceFunction: "getReporteProcesos()",
    },
    {
      method: "GET",
      path: "/api/delegacion/reportes/vacantes/export",
      operationId: "exportarVacantes",
      serviceFunction: "buildDelegacionReportExportUrl()",
    },
    {
      method: "GET",
      path: "/api/delegacion/reportes/vacantes",
      operationId: "vacantes",
      serviceFunction: "getReporteVacantes()",
    },
  ],
} as const satisfies Record<string, DelegacionEndpointDefinition[]>;

export type DelegacionSectionSlug = keyof typeof DELEGACION_SECTION_ENDPOINTS;
