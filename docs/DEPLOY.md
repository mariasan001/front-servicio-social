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
| **e2e** | `build` → Playwright Chromium → `test:e2e` (rutas públicas y auth) |

Los smoke tests del panel por rol (Fase 0) siguen siendo **manuales** o con credenciales de prueba; el E2E de CI no sustituye los 15 flujos críticos del baseline.

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

## Rollback

1. Conservar el artefacto de build anterior (commit + `node_modules` lockfile).
2. Redesplegar la versión anterior con `npm run start` o el mecanismo del hosting.
3. Verificar login y una ruta pública (`/`, `/vacantes`).
4. Si hubo migración de API incompatible, coordinar rollback con el backend.

---

## Monitoreo (recomendado)

| Área | Sugerencia |
|------|------------|
| Errores de cliente | Sentry u otro APM en `error.tsx` / `global-error.tsx` |
| Disponibilidad | Health check del backend + uptime en `/` |
| Logs | Agregar request-id en proxy si el hosting lo permite |
| Seguridad | Rate limit en `/auth/*` en backend o WAF |

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

*Última actualización: línea base `57523d8` — tests, E2E en CI, hardening de release.*
