# Despliegue a producción

Guía operativa para publicar `front-servicio-social` en staging o producción.

Complementa [ARQUITECTURA.md](./ARQUITECTURA.md) §16 y el checklist de [PANEL_PHASE0_BASELINE.md](./PANEL_PHASE0_BASELINE.md).

---

## Requisitos

| Requisito | Detalle |
|-----------|---------|
| **Node.js** | `>= 22` (`package.json` → `engines`) |
| **npm** | `npm ci` en CI; localmente `npm install` |
| **Backend Java** | Accesible desde el servidor Next (misma red/VPN) |
| **HTTPS** | Obligatorio en producción (cookies de sesión + HSTS) |

---

## Variables de entorno

Copiar `.env.example` y ajustar por entorno:

| Variable | Obligatoria prod | Descripción |
|----------|------------------|-------------|
| `API_PROXY_TARGET` | **Sí** | URL interna del backend Java (ej. `https://api-interna.edomex.gob.mx`). El build **falla** si falta con `NODE_ENV=production`. |
| `NEXT_PUBLIC_API_URL` | Recomendada | Base del navegador hacia el proxy (default `/api/backend`). |
| `NEXT_PUBLIC_SITE_URL` | Recomendada | URL pública del sitio (SEO, `sitemap.xml`, enlaces de invitación escuela). Default en código: `https://serviciosocial.edomex.gob.mx`. |
| `NEXT_PUBLIC_SENTRY_DSN` | Opcional | Si está definida, `error.tsx` / `global-error.tsx` y `instrumentation.ts` reportan a Sentry. Sin DSN solo hay `console.error`. |
| `SENTRY_TRACES_SAMPLE_RATE` | Opcional | Sampling server (default `0.1`). |

**Ejemplo producción:**

```env
API_PROXY_TARGET=https://api-servicio-social.interno
NEXT_PUBLIC_API_URL=/api/backend
NEXT_PUBLIC_SITE_URL=https://serviciosocial.edomex.gob.mx
```

**Ejemplo staging:**

```env
API_PROXY_TARGET=https://api-staging.interno
NEXT_PUBLIC_API_URL=/api/backend
NEXT_PUBLIC_SITE_URL=https://staging-serviciosocial.edomex.gob.mx
```

---

## Build y arranque

```bash
npm ci
npm run check          # typecheck + lint
npm run test:coverage  # unit tests + umbrales
npm run build          # requiere API_PROXY_TARGET en prod
npm run start          # escucha en :3000
```

El proxy de Next reescribe:

```
/api/backend/:path*  →  ${API_PROXY_TARGET}/:path*
```

---

## CI (GitHub Actions)

Workflow: `.github/workflows/ci.yml`

| Job | Pasos |
|-----|-------|
| **quality** | `typecheck` → `lint` → `test:coverage` → `npm audit --audit-level=high` → `build` |
| **e2e** | `build` → Playwright Chromium → `test:e2e` (públicas, auth, a11y) |

Los smoke tests del panel por rol se automatizan con `npm run test:e2e:panel` cuando existen variables `E2E_<ROL>_USER` / `E2E_<ROL>_PASSWORD`. Los 15 flujos críticos del baseline siguen siendo checklist manual.

---

## Checklist pre-deploy

- [ ] Variables de entorno configuradas en el hosting
- [ ] `npm run build` exitoso con las mismas variables que producción
- [ ] Backend responde en rutas públicas (`/api/public/vacantes`, health)
- [ ] HTTPS activo; cookies de sesión con `Secure` y `HttpOnly` (backend)
- [ ] `NEXT_PUBLIC_SITE_URL` apunta al dominio real (no al default de prod si es staging)
- [ ] Smoke manual: login por cada rol + 2–3 flujos críticos ([PANEL_PHASE0_BASELINE.md](./PANEL_PHASE0_BASELINE.md))
- [ ] Revisar `robots.txt` y metadata `noindex` en panel/auth

---

## Health check

`GET /api/health` siempre responde **200** (liveness) con:

```json
{ "status": "ok|degraded", "service": "front-servicio-social", "backend": "up|down", "timestamp": "..." }
```

- `status: ok` + `backend: up` → frontend y backend alcanzables
- `status: degraded` + `backend: down` → el proceso Next vive, pero el API no respondió a tiempo

## Docker

```bash
docker build \
  --build-arg API_PROXY_TARGET=https://api-interno \
  --build-arg NEXT_PUBLIC_SITE_URL=https://serviciosocial.edomex.gob.mx \
  --build-arg NEXT_PUBLIC_SENTRY_DSN= \
  -t front-servicio-social .

docker run -p 3000:3000 \
  -e API_PROXY_TARGET=https://api-interno \
  -e NEXT_PUBLIC_SITE_URL=https://serviciosocial.edomex.gob.mx \
  front-servicio-social
```

La imagen usa `output: "standalone"`, usuario no-root y `HEALTHCHECK` contra `/api/health`.
## Rollback

1. Conservar el artefacto de build anterior (commit + `node_modules` lockfile).
2. Redesplegar la versión anterior con `npm run start` o el mecanismo del hosting.
3. Verificar login y una ruta pública (`/`, `/vacantes`).
4. Si hubo migración de API incompatible, coordinar rollback con el backend.

---

## Monitoreo (recomendado)

| Área | Sugerencia |
|------|------------|
| Errores de cliente | `NEXT_PUBLIC_SENTRY_DSN` → `instrumentation.ts` (server) + `reportClientError` en boundaries |
| Disponibilidad | `GET /api/health` con `backend: up|down` |
| Bundles | `npm run analyze` (abre el reporte de `@next/bundle-analyzer`) |
| Logs | Agregar request-id en proxy si el hosting lo permite |
| Seguridad | Rate limit en `/auth/*` en backend o WAF |

### Smoke E2E por rol (opcional)

En `.env.local` o secrets de CI:

```env
E2E_ADMIN_USER=...
E2E_ADMIN_PASSWORD=...
E2E_ALUMNO_USER=...
E2E_ALUMNO_PASSWORD=...
# igual para DELEGACION, TITULAR, ENLACE
```

```bash
npm run test:e2e:panel
```

Sin credenciales, Playwright **omite** esos tests (no fallan el CI público).

---

## Límites conocidos

| Tema | Valor / nota |
|------|----------------|
| Upload server actions | `bodySizeLimit: "2mb"` en `next.config.ts` |
| ISR landing/vacantes | `revalidate: 120` s en `publicApiGet` |
| APIs públicas vacías | Estadísticas escuelas y testimonios pueden devolver empty state si el backend aún no expone datos |

---

## Referencias

- Arquitectura: [ARQUITECTURA.md](./ARQUITECTURA.md)
- Smoke tests: [PANEL_PHASE0_BASELINE.md](./PANEL_PHASE0_BASELINE.md)
- Convenciones panel: [PANEL_CONVENTIONS.md](./PANEL_CONVENTIONS.md)

*Última actualización: P3 — Sentry opcional, E2E panel por rol, bundle analyzer.*
