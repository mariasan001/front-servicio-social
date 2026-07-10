# Documentación técnica

Guías del repositorio `front-servicio-social`.

**Orden recomendado:** [ARQUITECTURA](./ARQUITECTURA.md) → [SEGURIDAD](./SEGURIDAD.md) → [FLUJOS](./FLUJOS.md) → [PANEL_CONVENTIONS](./PANEL_CONVENTIONS.md) → [DEPLOY](./DEPLOY.md).

---

## Índice

| Documento | Audiencia | Contenido |
|-----------|-----------|-----------|
| **[ARQUITECTURA.md](./ARQUITECTURA.md)** | Todos | Capas, rutas, roles, APIs, módulos compartidos |
| **[SEGURIDAD.md](./SEGURIDAD.md)** | Dev / ops / QA | Controles, checklists objetivos, flujos sensibles |
| **[FLUJOS.md](./FLUJOS.md)** | Producto / QA / dev | Diagramas Mermaid: sesión, registro, postulación, proceso |
| **[PANEL_CONVENTIONS.md](./PANEL_CONVENTIONS.md)** | Desarrollo panel | Modales, actions, payloads, UI |
| **[PANEL_PHASE0_BASELINE.md](./PANEL_PHASE0_BASELINE.md)** | QA / release | Smoke E2E por rol + criterio de salida |
| **[DEPLOY.md](./DEPLOY.md)** | Ops / release | Env, Docker, CI, health, rollback |

**Tests:** `npm run test` · `npm run test:coverage` · `npm run test:e2e` (públicas/auth/a11y/health) · `npm run test:e2e:panel` (roles, requiere `E2E_*`)

---

## Arranque local (pasos)

1. `cp .env.example .env.local`
2. Ajustar `API_PROXY_TARGET=http://localhost:8080`
3. Arrancar backend Java en `:8080`
4. `npm install` → `npm run dev` → http://localhost:3000

Antes de PR:

```bash
npm run check
npm run test:coverage
npm run test:e2e
```

Despliegue: [DEPLOY.md](./DEPLOY.md). Seguridad: [SEGURIDAD.md](./SEGURIDAD.md).

---

## Mapa mental

```
┌─────────────────────────────────────────────────────────┐
│  Público                                                │
│  /  /vacantes  /login  /registro[/{token}]              │
│  /recuperar-contrasena  /restablecer-contrasena[/{token}]│
└──────────────────────────┬──────────────────────────────┘
                           │ cookie de sesión
┌──────────────────────────▼──────────────────────────────┐
│  Panel /panel/{rol}/{seccion}                           │
│  alumno · titular · delegacion · admin · enlace         │
└──────────────────────────┬──────────────────────────────┘
                           │ server actions + services
┌──────────────────────────▼──────────────────────────────┐
│  Backend Java  ←  proxy /api/backend                    │
└─────────────────────────────────────────────────────────┘
```

---

## Módulos transversales

| Módulo | Ubicación | Uso |
|--------|-----------|-----|
| Auth / sesión | `src/lib/auth/` | Middleware, redirects, roles |
| Dominio | `src/lib/domain/` | Gates UI y reglas |
| Actions | `src/lib/actions/` | `runAuthorizedAction`, `compactPayload` |
| Exámenes | `shared/components/examen/` | Titular / alumno / monitor |
| Horas | `shared/proceso/horas/` | Alumno y titular |
| Encuestas | `lib/services/public-encuestas.service.ts` + action alumno | Landing + satisfacción |
| Monitoreo | `instrumentation.ts`, `lib/monitoring/` | Sentry opcional |
| Health | `src/app/api/health/route.ts` | Liveness + backend up/down |

---

## Rutas auth (referencia)

| Ruta | Qué hace |
|------|----------|
| `/login` | Acceso; `?next=` solo si es path interno seguro |
| `/registro` | Alta sin token |
| `/registro/{token}` | Alta con invitación de escuela (`?token=` redirige aquí) |
| `/recuperar-contrasena` | Solicitar enlace |
| `/restablecer-contrasena/{token}` | Nueva contraseña (`?token=` redirige aquí) |

---

## Dónde poner código nuevo

| Cambio | Ubicación |
|--------|-----------|
| Pantalla panel | `features/{rol}/sections/` + `components/` |
| Regla de negocio | `lib/domain/` |
| HTTP multi-rol | `lib/services/` |
| UI compartida | `shared/components/` |
| Mutación | `features/{rol}/actions/` + `runAuthorizedAction` + `compactPayload` |

**Prohibido:** imports entre features de roles distintos.

---

## Más información

- Convenciones agentes/Next: `AGENTS.md`
- Backend: `../Back_end/dgp-servicio-social-service`
