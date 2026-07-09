# Fase 0 — Línea base del panel

Documento de referencia para smoke tests end-to-end del panel (`/panel/*`).

| Documento relacionado | Contenido |
|-----------------------|-----------|
| [ARQUITECTURA.md](./ARQUITECTURA.md) | Mapa de capas, rutas y APIs |
| [FLUJOS.md](./FLUJOS.md) | Diagramas de sesión, postulación, proceso y exámenes |
| [PANEL_CONVENTIONS.md](./PANEL_CONVENTIONS.md) | Convenciones de desarrollo del panel |
| [DEPLOY.md](./DEPLOY.md) | Despliegue a producción |

---

## Punto de partida

| Campo | Valor |
|-------|--------|
| **Commit** | `57523d8` — `feat(release): harden production readiness to 10/10` |
| **Rama** | `feature/setup-inicial` |
| **Frontend** | `http://localhost:3000` (`npm run dev`) |
| **Backend** | `http://localhost:8080` (`API_PROXY_TARGET` en `.env.local`) |
| **Repo backend** | `../Back_end/dgp-servicio-social-service` |

### Entorno mínimo

1. Copiar `.env.example` → `.env.local` en el frontend.
2. Backend Java corriendo en `:8080`.
3. Reiniciar `npm run dev` tras cambios en `next.config.ts`.
4. Usuarios de prueba por rol (admin, delegación, titular, enlace, alumno).

### Calidad automatizada (local / CI)

| Comando | Qué valida |
|---------|------------|
| `npm run typecheck` | TypeScript sin emit |
| `npm run lint` | ESLint (0 errores) |
| `npm run check` | typecheck + lint |
| `npm run test` | Vitest — reglas de dominio y auth |
| `npm run test:coverage` | Vitest + umbrales de cobertura |
| `npm run test:e2e` | Playwright — rutas públicas, auth, a11y y health |
| `npm run test:e2e:panel` | Playwright — smoke por rol (requiere `E2E_*` en env) |
| `npm run analyze` | Build + reporte de bundles (`@next/bundle-analyzer`) |
| `npm run build` | Build de producción |

Workflow: `.github/workflows/ci.yml` — jobs **quality** (typecheck, lint, coverage, audit, build) y **e2e** (Playwright).

**Nota:** el E2E de CI cubre rutas públicas/auth/a11y. Los smokes del panel por rol (`npm run test:e2e:panel`) se ejecutan cuando hay credenciales `E2E_*` en el entorno; los 15 flujos críticos del inventario siguen siendo checklist manual.

### Cambios estructurales desde la línea base anterior

- **Auth centralizado** en `src/lib/auth/` (login, guest, postulación, CV).
- **Guards en server actions** con `runAuthorizedAction` (`src/lib/actions/run-authorized-action.ts`).
- **Servicios compartidos** en `src/lib/services/` (exámenes monitor, encuestas públicas).
- **Horas compartidas** en `src/shared/proceso/horas/` (calendario + modales alumno/titular).
- **Exámenes monitor** en `src/shared/components/examen/ExamenesMonitorView.tsx` (delegación + admin).
- **Modales grandes refactorizados** con hooks y secciones (`useDelegacionProcesoDetailModal`, `useTitularProcesoDetailModal`, examen alumno, vacante titular).
- **Headers de seguridad** en `next.config.ts` (CSP, HSTS en producción).

### Cómo marcar pruebas

En las tablas de abajo, actualiza la columna **Estado**:

| Símbolo | Significado |
|---------|-------------|
| ✅ | Probado end-to-end; resultado correcto en UI y backend |
| ⚠️ | Probado parcialmente o con workaround conocido |
| ❌ | Falla confirmada (anotar error en Notas) |
| ⬜ | No probado aún en esta línea base (`57523d8`) |

> Los estados heredados de sesiones anteriores se resetean a ⬜ salvo donde el código o CI dan evidencia directa.

---

## Mapa de navegación por rol

Fuente: `src/features/panel/constants/navigation.ts`.

### Alumno — `/panel/alumno`

| Sección | Ruta |
|---------|------|
| Inicio | `/panel/alumno` |
| Vacantes | `/panel/alumno/vacantes` |
| Postulaciones | `/panel/alumno/postulaciones` |
| Mi proceso | `/panel/alumno/proceso` |
| Mi CV | `/panel/alumno/cv` |

Rutas auxiliares:

- Examen en línea: `/panel/alumno/postulaciones/{idPostulacion}/examen`
- Deep link horas: `/panel/alumno/proceso?fecha=YYYY-MM-DD&entrada=…&salida=…`

Las **notificaciones** viven en la bandeja del **Inicio** (`AlumnoNotificacionesTray`), no hay sección `/notificaciones`.

### Titular — `/panel/titular`

| Sección | Ruta |
|---------|------|
| Inicio | `/panel/titular` |
| Vacantes | `/panel/titular/vacantes` |
| Postulaciones | `/panel/titular/postulaciones` |
| Exámenes | `/panel/titular/examenes` |
| Alumnos (seguimiento) | `/panel/titular/procesos` |
| Incidencias (pestaña) | `/panel/titular/procesos/incidencias` |

Redirect legacy: `/panel/titular/incidencias` → `/panel/titular/procesos/incidencias`.

### Delegación — `/panel/delegacion`

| Sección | Ruta |
|---------|------|
| Inicio | `/panel/delegacion` |
| Vacantes | `/panel/delegacion/vacantes` |
| Postulaciones | `/panel/delegacion/postulaciones` |
| Alumnos (procesos) | `/panel/delegacion/procesos` |
| Validaciones | `/panel/delegacion/validacion/{sub}` |
| Vinculaciones | `/panel/delegacion/alumnos` |
| Encuestas | `/panel/delegacion/encuestas` |
| Exámenes (monitor) | `/panel/delegacion/examenes` |
| Reportes | `/panel/delegacion/reportes` |

Sub-secciones de **Validaciones** (`DelegacionValidacionLayout`):

| Sub-sección | Ruta |
|-------------|------|
| Documentos | `/panel/delegacion/validacion/documentos` |
| Horas | `/panel/delegacion/validacion/horas` |
| Incidencias | `/panel/delegacion/validacion/incidencias` |

Redirects legacy: `/panel/delegacion/documentos|horas|incidencias` → `/panel/delegacion/validacion/…`.

### Admin — `/panel/admin`

| Sección | Ruta |
|---------|------|
| Inicio | `/panel/admin` |
| Dependencias | `/panel/admin/dependencias` |
| Escuelas | `/panel/admin/escuelas` |
| Áreas | `/panel/admin/areas` |
| Exámenes (monitor) | `/panel/admin/examenes` |
| Usuarios internos | `/panel/admin/usuarios` |

### Enlace — `/panel/enlace`

| Sección | Ruta |
|---------|------|
| Inicio | `/panel/enlace` |
| Alumnos | `/panel/enlace/alumnos` |
| Procesos | `/panel/enlace/procesos` |
| Reportes | `/panel/enlace/reportes` |

---

## Flujo principal (referencia)

```
Postulación (titular) → Proceso creado → Alumno sube docs
→ Delegación aprueba docs (validacion/documentos) → LISTO_PARA_ACTIVACION
→ Delegación: horas requeridas + carta de aceptación (procesos) → ACTIVO
→ Alumno registra horas → Titular/Delegación validan (validacion/horas)
→ Liberación técnica + evaluación (titular/procesos) → Carta liberación
```

Diagrama ampliado: [FLUJOS.md §5](./FLUJOS.md#5-ciclo-de-vida-del-proceso).

---

## Inventario por rol

Payloads de mutación alineados con `src/lib/domain/requests.ts` y helpers en `src/lib/domain/`.

### Alumno

| Flujo | Ruta / ubicación | Estado | Notas |
|-------|------------------|--------|-------|
| Ver inicio / resumen | `/panel/alumno` | ⬜ | Incluye bandeja de notificaciones |
| Marcar notificación leída | Inicio → bandeja | ⬜ | `notificaciones.actions` + `runAuthorizedAction` |
| Postularse a vacante | `/panel/alumno/vacantes` | ⬜ | Requiere CV completo (`lib/domain/cv.ts`) |
| Ver postulaciones | `/panel/alumno/postulaciones` | ⬜ | |
| Cancelar postulación | Modal postulaciones | ⬜ | |
| Contestar examen en línea | `…/postulaciones/{id}/examen` | ⬜ | Refactor: `useAlumnoExamenPostulacion` + paneles |
| Subir documentos | `/panel/alumno/proceso` | ⬜ | `bodySizeLimit` 2mb en `next.config.ts` |
| Registrar horas | `/panel/alumno/proceso` | ⬜ | Calendario en `shared/proceso/horas`; máx. 12 h/día |
| Actualizar bitácora observada | Modal día (proceso) | ⬜ | Solo descripción si estatus lo permite |
| Encuesta de satisfacción | Modal en resumen proceso | ⬜ | `lib/services/public-encuestas.service.ts` |
| Descargar carta / documento | `/panel/alumno/proceso` | ⬜ | |
| Editar CV | `/panel/alumno/cv` | ⬜ | Redirect si `?motivo=postulacion` sin CV |

### Titular

| Flujo | Ruta / ubicación | Estado | Notas |
|-------|------------------|--------|-------|
| Dashboard inicio | `/panel/titular` | ⬜ | |
| CRUD vacante / enviar a revisión | `/panel/titular/vacantes` | ⬜ | Form: `useTitularVacanteForm` |
| Asociar examen a vacante | `/panel/titular/vacantes` | ⬜ | `requiereExamen` + selector |
| CRUD examen diagnóstico | `/panel/titular/examenes` | ⬜ | `TitularExamenManageModal` |
| Ver postulaciones | `/panel/titular/postulaciones` | ⬜ | |
| Registrar examen manual (legacy) | Modal postulación | ⚠️ | Convive con examen en línea |
| Ver resultado examen automático | Detalle postulación | ⬜ | `TitularPostulacionExamenResultado` |
| Aceptar / rechazar postulación | Modal postulación | ⬜ | `comentario` / `motivo` vía dominio |
| Seguimiento alumnos | `/panel/titular/procesos` | ⬜ | Modal: `useTitularProcesoDetailModal` |
| Registrar horas manual | Modal proceso → horas | ⬜ | `TitularHoraDiaDetailModal` |
| Validar / observar / rechazar hora | Modal proceso → horas | ⬜ | |
| Liberación técnica | Modal proceso | ⬜ | Sección dedicada |
| Evaluación final | Modal proceso | ⬜ | `CrearEvaluacionFinalRequest` |
| Bandeja incidencias | `/panel/titular/procesos/incidencias` | ⬜ | Pestaña en seguimiento |

### Delegación

| Flujo | Ruta / ubicación | Estado | Notas |
|-------|------------------|--------|-------|
| Dashboard inicio | `/panel/delegacion` | ⬜ | |
| Publicar / cerrar vacante | `/panel/delegacion/vacantes` | ⬜ | |
| Rechazar vacante | Modal vacante | ⬜ | `motivo` vía `RechazarVacanteRequest` |
| Ver postulación | `/panel/delegacion/postulaciones` | ⬜ | Solo lectura |
| Aprobar / observar / rechazar documento | `…/validacion/documentos` | ⬜ | |
| Validar / observar / rechazar hora | `…/validacion/horas` | ⬜ | |
| Resolver / cancelar incidencia | `…/validacion/incidencias` | ⬜ | |
| Capturar horas requeridas | `/panel/delegacion/procesos` | ⬜ | `horasRequeridasDraft` en modal |
| Activar proceso (carta aceptación) | `/panel/delegacion/procesos` | ⬜ | Emisión carta → ACTIVO |
| Cancelar proceso | Modal proceso | ⬜ | `motivo` vía `CancelarProcesoRequest` |
| Normalizar alumno escuela | `/panel/delegacion/alumnos` | ⬜ | |
| Moderar encuesta/testimonio | `/panel/delegacion/encuestas` | ⬜ | |
| Consultar examen diagnóstico | `/panel/delegacion/examenes` | ⬜ | `ExamenesMonitorView` (solo lectura) |
| Exportar reporte PDF | `/panel/delegacion/reportes` | ⬜ | jsPDF |

### Enlace

| Flujo | Ruta | Estado | Notas |
|-------|------|--------|-------|
| Dashboard | `/panel/enlace` | ⬜ | |
| Ver detalle alumno | `/panel/enlace/alumnos` | ⬜ | |
| Ver proceso (solo lectura) | `/panel/enlace/procesos` | ⬜ | |
| Reportes | `/panel/enlace/reportes` | ⬜ | |

### Admin

| Flujo | Ruta | Estado | Notas |
|-------|------|--------|-------|
| Dashboard | `/panel/admin` | ⬜ | |
| Dependencias CRUD + activar | `/panel/admin/dependencias` | ⬜ | |
| Escuelas + tokens invitación | `/panel/admin/escuelas` | ⬜ | Modal: `EscuelaDetailInfo` + `EscuelaInvitacionesPanel` |
| Áreas + titulares | `/panel/admin/areas` | ⬜ | |
| Consultar exámenes (monitor) | `/panel/admin/examenes` | ⬜ | `ExamenesMonitorView` + `getExamenMonitorAction` (ADMIN) |
| Usuarios internos | `/panel/admin/usuarios` | ⬜ | |

### Auth (fuera del panel)

| Flujo | Ruta | Estado | Notas |
|-------|------|--------|-------|
| Login | `/login` | ⬜ | Redirect seguro con `isSafeInternalPath` |
| Registro alumno (manual) | `/registro` | ⬜ | `RegisterForm` + `useRegisterToken` |
| Registro con token escuela | `/registro/alumno?token=…` | ⬜ | |
| Recuperar contraseña | `/recuperar-contrasena` | ⬜ | `POST /auth/password/forgot` — envía enlace al correo |
| Restablecer contraseña | `/restablecer-contrasena/{token}` | ⬜ | `POST /auth/password/reset` — path preferido; `?token=` redirige |

---

## Checklist smoke test (15 casos críticos)

Ejecutar en orden cuando sea posible (un flujo completo de punta a punta).

| # | Rol | Acción | Resultado esperado | Estado | Notas |
|---|-----|--------|-------------------|--------|-------|
| 1 | Admin | Crear dependencia y activarla | Aparece en listado activa | ⬜ | |
| 2 | Admin | Generar token escuela | Token vigente copiable | ⬜ | |
| 3 | Alumno | Registrarse con token | Cuenta creada, login OK | ⬜ | |
| 4 | Titular | Crear vacante y enviar a revisión | Estatus pendiente revisión | ⬜ | |
| 5 | Delegación | Publicar vacante | Visible para alumno | ⬜ | |
| 6 | Alumno | Postularse | Postulación creada | ⬜ | CV completo |
| 6b | Titular | Crear y activar examen + asociar a vacante | Vacante con examen requerido | ⬜ | |
| 6c | Alumno | Contestar examen en línea | Estatus examen FINALIZADO | ⬜ | |
| 7 | Titular | Ver resultado + aceptar postulación | Postulación aceptada | ⬜ | |
| 8 | Alumno | Subir docs obligatorios | Archivos en revisión | ⬜ | |
| 9 | Delegación | Aprobar todos los docs | Proceso LISTO_PARA_ACTIVACION | ⬜ | `validacion/documentos` |
| 10 | Delegación | Horas + activar (carta) | Proceso ACTIVO | ⬜ | `procesos` modal |
| 11 | Alumno | Registrar horas (≤12h, con descripción) | Registro pendiente/validado | ⬜ | |
| 12 | Delegación | Validar hora | Hora validada, acumuladas suben | ⬜ | `validacion/horas` |
| 13 | Titular | Liberación técnica | Registro emitido | ⬜ | |
| 14 | Titular | Evaluación final | Evaluación registrada | ⬜ | |
| 15 | Delegación | Carta liberación (si aplica) | Carta emitida, proceso avanza | ⬜ | |

---

## Criterio de salida de Fase 0

Fase 0 está **completa** cuando:

1. **`npm run check` y `npm run build`** pasan en local (y en CI).
2. Este documento tiene la columna **Estado** actualizada para los 15 casos smoke.
3. Cada ❌ tiene **Notas** con mensaje de error o código API (`VALIDATION_ERROR`, etc.).
4. El panel cumple convenciones de [PANEL_CONVENTIONS.md](./PANEL_CONVENTIONS.md):
   - Shell de modales (`DetailModal.module.css`)
   - Server actions con `runAuthorizedAction`
   - Servicios cross-rol en `lib/services/` (no imports `features/A → features/B`)
   - Reglas de negocio en `lib/domain/`

---

## Siguiente paso

1. Levantar backend en `:8080` y frontend con `npm run dev`.
2. Ejecutar los 15 smoke tests y actualizar estados en este archivo.
3. Registrar bloqueos de API en la columna **Notas** (con código HTTP o mensaje del backend).

Excepción conocida fuera del panel: rediseño visual de `/login`.
