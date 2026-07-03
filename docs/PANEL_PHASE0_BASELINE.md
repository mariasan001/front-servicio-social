# Fase 0 — Línea base del panel

Documento de referencia antes de Fase 1 (alinear API) y mejoras de UI por rol.

## Punto de partida

| Campo | Valor |
|-------|--------|
| **Commit** | `d91d631` — `feat(panel): mejorar activacion de procesos y registro de horas del alumno` |
| **Rama** | `feature/setup-inicial` |
| **Frontend** | `http://localhost:3000` (`npm run dev`) |
| **Backend** | `http://localhost:8080` (`API_PROXY_TARGET` en `.env.local`) |
| **Repo backend** | `../Back_end/dgp-servicio-social-service` |

### Entorno mínimo

1. Copiar `.env.example` → `.env.local` en el frontend.
2. Backend Java corriendo en `:8080`.
3. Reiniciar `npm run dev` tras cambios en `next.config.ts`.
4. Usuarios de prueba por rol (admin, delegación, titular, enlace, alumno).

### Cómo marcar pruebas

En la tabla de abajo, actualiza la columna **Estado**:

| Símbolo | Significado |
|---------|-------------|
| ✅ | Probado end-to-end; resultado correcto en UI y backend |
| ⚠️ | Probado parcialmente o con workaround conocido |
| ❌ | Falla confirmada (anotar error en Notas) |
| ⬜ | No probado aún |
| 🔧 | Previsto roto por desalineación API (Fase 1) |

---

## Flujo principal (referencia)

```
Postulación (titular) → Proceso creado → Alumno sube docs
→ Delegación aprueba docs → LISTO_PARA_ACTIVACION
→ Delegación: horas requeridas + carta de aceptación → ACTIVO
→ Alumno registra horas → Titular/Delegación validan
→ Liberación técnica + evaluación → Carta liberación
```

---

## Inventario: probado en sesión vs pendiente

Lo marcado ✅ en esta tabla refleja lo ejercitado durante el desarrollo reciente.  
Lo marcado 🔧 viene de la auditoría de payloads (Fase 1).

### Alumno

| Flujo | Ruta | Estado | Notas |
|-------|------|--------|-------|
| Ver inicio / vacantes | `/panel/alumno` | ⬜ | |
| Postularse a vacante | `/panel/alumno/vacantes` | ⬜ | |
| Ver postulaciones | `/panel/alumno/postulaciones` | ⬜ | |
| Cancelar postulación | postulaciones modal | ⬜ | |
| Subir documentos | `/panel/alumno/proceso` | ⚠️ | Fix `bodySizeLimit` 10mb; requiere dev server reiniciado |
| Registrar horas | `/panel/alumno/proceso` | ✅ | Requiere descripción + máx. 12 h/día |
| Actualizar bitácora observada | `/panel/alumno/proceso` | ⬜ | |
| Descargar carta / documento | `/panel/alumno/proceso` | ⬜ | |
| Editar CV | `/panel/alumno/cv` | ⬜ | |
| Notificaciones leer | `/panel/alumno/notificaciones` | ⬜ | |

### Titular

| Flujo | Ruta | Estado | Notas |
|-------|------|--------|-------|
| Dashboard inicio | `/panel/titular` | ⬜ | |
| CRUD vacante / enviar a revisión | `/panel/titular/vacantes` | ⬜ | |
| Registrar examen finalizado | `/panel/titular/postulaciones` | ⚠️ | UI corregida; validar con backend |
| Aceptar postulación | `/panel/titular/postulaciones` | ⚠️ | 🔧 payload `comentario` vs `comentarioTitular` |
| Rechazar postulación | `/panel/titular/postulaciones` | 🔧 | payload `motivo` vs `motivoRechazo` |
| Registrar horas manual | `/panel/titular/procesos` | ⬜ | |
| Validar / observar / rechazar hora | `/panel/titular/procesos` | 🔧 | `comentario` vs `comentarioDelegacion` |
| Liberación técnica | `/panel/titular/procesos` | 🔧 | |
| Evaluación final | `/panel/titular/procesos` | 🔧 | falta `estatus` en request |
| Ver incidencias | `/panel/titular/incidencias` | ⬜ | solo lectura |

### Delegación

| Flujo | Ruta | Estado | Notas |
|-------|------|--------|-------|
| Dashboard inicio | `/panel/delegacion` | ⬜ | |
| Publicar / cerrar vacante | `/panel/delegacion/vacantes` | ⬜ | |
| Rechazar vacante | `/panel/delegacion/vacantes` | 🔧 | `motivo` vs `motivoRechazo` |
| Ver postulación | `/panel/delegacion/postulaciones` | ⬜ | solo lectura |
| Aprobar / observar / rechazar documento | `/panel/delegacion/documentos` | ✅ | observar/rechazar 🔧 si `observacion` ≠ `comentario` |
| Capturar horas requeridas | `/panel/delegacion/procesos` | ✅ | no activa solo; guarda horas |
| Activar proceso (carta aceptación) | `/panel/delegacion/procesos` | ✅ | emisión carta → ACTIVO |
| Cancelar proceso | `/panel/delegacion/procesos` | 🔧 | `motivo` vs `motivoCancelacion` |
| Validar / observar / rechazar hora | `/panel/delegacion/horas` | 🔧 | campos comentario |
| Resolver / cancelar incidencia | `/panel/delegacion/incidencias` | 🔧 | shape resolver incidencia |
| Normalizar alumno escuela | `/panel/delegacion/alumnos` | ⬜ | |
| Exportar reporte | `/panel/delegacion/reportes` | ⬜ | |

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
| Escuelas + tokens invitación | `/panel/admin/escuelas` | ⬜ | |
| Áreas + titulares | `/panel/admin/areas` | ⬜ | |
| Usuarios internos | `/panel/admin/usuarios` | ⬜ | |

### Auth (fuera del panel)

| Flujo | Ruta | Estado | Notas |
|-------|------|--------|-------|
| Login | `/login` | ⬜ | |
| Registro alumno con token | `/registro` | ⬜ | |
| Recuperar contraseña | auth público | ❌ | endpoints no existen en backend |

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
| 6 | Alumno | Postularse | Postulación creada | ⬜ | |
| 7 | Titular | Registrar examen + aceptar | Postulación aceptada | ⬜ | |
| 8 | Alumno | Subir docs obligatorios | Archivos en revisión | ⬜ | |
| 9 | Delegación | Aprobar todos los docs | Proceso LISTO_PARA_ACTIVACION | ⬜ | |
| 10 | Delegación | Horas + activar (carta) | Proceso ACTIVO | ⬜ | |
| 11 | Alumno | Registrar horas (≤12h, con descripción) | Registro REGISTRADO/PENDIENTE | ⬜ | |
| 12 | Delegación | Validar hora | Hora validada, acumuladas suben | ⬜ | |
| 13 | Titular | Liberación técnica | Registro emitido | ⬜ | |
| 14 | Titular | Evaluación final | Evaluación registrada | ⬜ | |
| 15 | Delegación | Carta liberación (si aplica) | Carta emitida, proceso avanza | ⬜ | |

---

## Criterio de salida de Fase 0

Fase 0 está **completa** cuando:

1. Este documento tiene la columna **Estado** actualizada para los 15 casos smoke (aunque algunos sean ❌ o 🔧).
2. Cada ❌/🔧 tiene **Notas** con mensaje de error o código API (`VALIDATION_ERROR`, etc.).
3. El equipo acuerda que **no se toca UI** hasta cerrar Fase 1 para los casos 🔧.

---

## Siguiente paso

**Fase 1 — Alinear payloads** con DTOs en `Back_end/dgp-servicio-social-service/src/main/java/.../dto/*Request.java`.

Prioridad: filas marcadas 🔧 en las tablas de arriba.
