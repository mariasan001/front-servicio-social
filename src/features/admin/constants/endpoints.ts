export type AdminEndpointDefinition = {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  operationId: string;
  serviceFunction: string;
};

export const ADMIN_SECTION_ENDPOINTS = {
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
  dependencias: [
    {
      method: "GET",
      path: "/api/dependencias",
      operationId: "listarDependencias",
      serviceFunction: "listDependencias()",
    },
    {
      method: "POST",
      path: "/api/dependencias",
      operationId: "crearDependencia",
      serviceFunction: "createDependencia()",
    },
    {
      method: "GET",
      path: "/api/dependencias/{idDependencia}",
      operationId: "obtenerDependencia",
      serviceFunction: "getDependencia()",
    },
    {
      method: "PATCH",
      path: "/api/dependencias/{idDependencia}",
      operationId: "actualizarDependencia",
      serviceFunction: "updateDependencia()",
    },
    {
      method: "PATCH",
      path: "/api/dependencias/{idDependencia}/activar",
      operationId: "activarDependencia",
      serviceFunction: "activateDependencia()",
    },
    {
      method: "PATCH",
      path: "/api/dependencias/{idDependencia}/desactivar",
      operationId: "desactivarDependencia",
      serviceFunction: "deactivateDependencia()",
    },
  ],
  escuelas: [
    {
      method: "GET",
      path: "/api/escuelas",
      operationId: "listarEscuelas",
      serviceFunction: "listEscuelas()",
    },
    {
      method: "POST",
      path: "/api/escuelas",
      operationId: "crearEscuela",
      serviceFunction: "createEscuela()",
    },
    {
      method: "GET",
      path: "/api/escuelas/{idEscuela}",
      operationId: "obtenerEscuela",
      serviceFunction: "getEscuela()",
    },
    {
      method: "PATCH",
      path: "/api/escuelas/{idEscuela}",
      operationId: "actualizarEscuela",
      serviceFunction: "updateEscuela()",
    },
    {
      method: "GET",
      path: "/api/escuelas/{idEscuela}/tokens",
      operationId: "listarTokens",
      serviceFunction: "listEscuelaTokens()",
    },
    {
      method: "POST",
      path: "/api/escuelas/{idEscuela}/tokens",
      operationId: "generarToken",
      serviceFunction: "generateEscuelaToken()",
    },
    {
      method: "PATCH",
      path: "/api/escuelas/{idEscuela}/tokens/{idToken}/suspender",
      operationId: "suspenderToken",
      serviceFunction: "suspendEscuelaToken()",
    },
    {
      method: "PATCH",
      path: "/api/escuelas/{idEscuela}/tokens/{idToken}/revocar",
      operationId: "revocarToken",
      serviceFunction: "revokeEscuelaToken()",
    },
    {
      method: "PATCH",
      path: "/api/escuelas/{idEscuela}/tokens/{idToken}/reactivar",
      operationId: "reactivarToken",
      serviceFunction: "reactivateEscuelaToken()",
    },
  ],
  areas: [
    {
      method: "GET",
      path: "/api/areas",
      operationId: "listarAreas",
      serviceFunction: "listAreas()",
    },
    {
      method: "POST",
      path: "/api/areas",
      operationId: "crearArea",
      serviceFunction: "createArea()",
    },
    {
      method: "GET",
      path: "/api/areas/{idArea}",
      operationId: "obtenerArea",
      serviceFunction: "getArea()",
    },
    {
      method: "PATCH",
      path: "/api/areas/{idArea}",
      operationId: "actualizarArea",
      serviceFunction: "updateArea()",
    },
    {
      method: "PATCH",
      path: "/api/areas/{idArea}/activar",
      operationId: "activarArea",
      serviceFunction: "activateArea()",
    },
    {
      method: "PATCH",
      path: "/api/areas/{idArea}/desactivar",
      operationId: "desactivarArea",
      serviceFunction: "deactivateArea()",
    },
    {
      method: "GET",
      path: "/api/areas/{idArea}/titulares",
      operationId: "listarTitulares",
      serviceFunction: "listAreaTitulares()",
    },
    {
      method: "POST",
      path: "/api/areas/{idArea}/titulares",
      operationId: "asignarTitular",
      serviceFunction: "assignAreaTitular()",
    },
    {
      method: "PATCH",
      path: "/api/areas/{idArea}/titulares/{idAsignacion}/principal",
      operationId: "marcarTitularPrincipal",
      serviceFunction: "setPrincipalAreaTitular()",
    },
    {
      method: "PATCH",
      path: "/api/areas/{idArea}/titulares/{idAsignacion}/desactivar",
      operationId: "desactivarTitular",
      serviceFunction: "deactivateAreaTitular()",
    },
  ],
  usuarios: [
    {
      method: "GET",
      path: "/api/admin/usuarios-internos",
      operationId: "listarUsuarios",
      serviceFunction: "listUsuariosInternos()",
    },
    {
      method: "POST",
      path: "/api/admin/usuarios-internos",
      operationId: "crearUsuario",
      serviceFunction: "createUsuarioInterno()",
    },
    {
      method: "GET",
      path: "/api/admin/usuarios-internos/{idUsuario}",
      operationId: "obtenerUsuario",
      serviceFunction: "getUsuarioInterno()",
    },
    {
      method: "PATCH",
      path: "/api/admin/usuarios-internos/{idUsuario}",
      operationId: "actualizarUsuario",
      serviceFunction: "updateUsuarioInterno()",
    },
    {
      method: "PATCH",
      path: "/api/admin/usuarios-internos/{idUsuario}/activar",
      operationId: "activarUsuario",
      serviceFunction: "activateUsuarioInterno()",
    },
    {
      method: "PATCH",
      path: "/api/admin/usuarios-internos/{idUsuario}/desactivar",
      operationId: "desactivarUsuario",
      serviceFunction: "deactivateUsuarioInterno()",
    },
    {
      method: "PATCH",
      path: "/api/admin/usuarios-internos/{idUsuario}/reset-password",
      operationId: "resetPassword",
      serviceFunction: "resetUsuarioInternoPassword()",
    },
  ],
} as const satisfies Record<string, AdminEndpointDefinition[]>;

export type AdminSectionSlug = keyof typeof ADMIN_SECTION_ENDPOINTS;
