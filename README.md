# Servicio Social Edomex — Frontend

Plataforma web del **Gobierno del Estado de México** para servicio social, prácticas y residencias en dependencias estatales.

Stack: **Next.js 16** · **React 19** · **TypeScript** · CSS Modules · Node **≥ 22**.

---

## Inicio rápido (pasos)

1. Clonar el repo y entrar a la carpeta.
2. `cp .env.example .env.local`
3. Dejar `API_PROXY_TARGET=http://localhost:8080` (o la URL de tu API).
4. Arrancar el backend Java en `:8080`.
5. `npm install` → `npm run dev` → http://localhost:3000

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8080 |
| Health front | http://localhost:3000/api/health |

El navegador llama a `/api/backend/*`; Next reescribe hacia `API_PROXY_TARGET`.

---

## Variables de entorno

| Variable | Obligatoria prod | Descripción |
|----------|------------------|-------------|
| `API_PROXY_TARGET` | **Sí** | Origen del backend (build falla si falta en prod) |
| `NEXT_PUBLIC_API_URL` | Recomendada | Base del browser (default `/api/backend`) |
| `NEXT_PUBLIC_SITE_URL` | Recomendada | URL pública (SEO, sitemap, invitaciones) |
| `NEXT_PUBLIC_SENTRY_DSN` | Opcional | Activa Sentry (server + boundaries) |
| `E2E_*_USER` / `E2E_*_PASSWORD` | Opcional | Smokes de panel por rol |

Detalle: [docs/DEPLOY.md](./docs/DEPLOY.md) · seguridad: [docs/SEGURIDAD.md](./docs/SEGURIDAD.md).

---

## Roles

| Rol | Ruta | Función |
|-----|------|---------|
| Público | `/`, `/vacantes` | Landing y vacantes |
| Alumno | `/panel/alumno` | CV, postulación, proceso, horas |
| Titular | `/panel/titular` | Vacantes, postulaciones, exámenes |
| Delegación | `/panel/delegacion` | Publicación, validaciones, procesos |
| Admin | `/panel/admin` | Catálogos y usuarios |
| Enlace | `/panel/enlace` | Consulta alumnos de su escuela |

---

## Auth pública

| Ruta | Descripción |
|------|-------------|
| `/login` | Sesión (`?next=` sanitizado) |
| `/registro` | Alta sin token |
| `/registro/{token}` | Alta con invitación (`?token=` → redirect al path) |
| `/recuperar-contrasena` | Solicitar enlace |
| `/restablecer-contrasena/{token}` | Nueva contraseña (`?token=` → redirect) |

---

## Arquitectura (una línea)

```
Section (server) → View (client) → Modal → action + runAuthorizedAction → service → backend
```

- Mutaciones del panel: **solo** server actions (no `apiRequest` desde el modal).
- Payloads: `compactPayload()` — nunca `undefined`.
- Reglas UI: `src/lib/domain/`. Autorización final: **backend**.

---

## Scripts

```bash
npm run check           # typecheck + lint
npm run test            # Vitest
npm run test:coverage   # umbrales CI
npm run test:e2e        # públicas, auth, a11y, health
npm run test:e2e:panel  # smokes por rol (requiere E2E_*)
npm run analyze         # bundle analyzer
npm run build && npm run start
```

CI: quality (check + coverage + audit + build) → e2e Playwright.

---

## Documentación

| Documento | Para qué |
|-----------|----------|
| [docs/README.md](./docs/README.md) | Índice |
| [docs/SEGURIDAD.md](./docs/SEGURIDAD.md) | Controles y checklists de seguridad |
| [docs/ARQUITECTURA.md](./docs/ARQUITECTURA.md) | Mapa del sistema |
| [docs/FLUJOS.md](./docs/FLUJOS.md) | Diagramas de negocio |
| [docs/PANEL_CONVENTIONS.md](./docs/PANEL_CONVENTIONS.md) | Cómo desarrollar el panel |
| [docs/PANEL_PHASE0_BASELINE.md](./docs/PANEL_PHASE0_BASELINE.md) | Smoke QA |
| [docs/DEPLOY.md](./docs/DEPLOY.md) | Deploy, Docker, health |

---

## Seguridad (resumen)

1. Cookie de sesión (backend) + middleware de roles.
2. `runAuthorizedAction` en mutaciones del panel.
3. Tokens de registro/reset en **path**, no en query.
4. Headers: CSP, HSTS (prod), `X-Frame-Options`, `nosniff`.
5. El proxy `/api/backend` no sustituye la auth del API.

Pasos detallados: **[docs/SEGURIDAD.md](./docs/SEGURIDAD.md)**.
