# Despliegue a producción

Pasos objetivos para publicar `front-servicio-social`.

Complementa [SEGURIDAD.md](./SEGURIDAD.md) y [PANEL_PHASE0_BASELINE.md](./PANEL_PHASE0_BASELINE.md).

---

## 1. Requisitos

| Requisito | Valor |
|-----------|--------|
| Node.js | `>= 22` |
| Backend Java | Alcanzable desde el servidor Next |
| HTTPS | Obligatorio en producción |
| Build | `output: "standalone"` (Docker) |

---

## 2. Variables de entorno

| Variable | Prod | Descripción |
|----------|------|-------------|
| `API_PROXY_TARGET` | **Obligatoria** | URL interna del backend. Sin ella el build de prod falla. |
| `NEXT_PUBLIC_API_URL` | Recomendada | Default `/api/backend` |
| `NEXT_PUBLIC_SITE_URL` | Recomendada | Dominio público real |
| `NEXT_PUBLIC_SENTRY_DSN` | Opcional | Activa Sentry |
| `SENTRY_TRACES_SAMPLE_RATE` | Opcional | Default `0.1` |
| `E2E_*` | Opcional | Solo para smokes de panel |

**Producción:**

```env
API_PROXY_TARGET=https://api-servicio-social.interno
NEXT_PUBLIC_API_URL=/api/backend
NEXT_PUBLIC_SITE_URL=https://serviciosocial.edomex.gob.mx
```

---

## 3. Pasos de build y arranque

```bash
npm ci
npm run check
npm run test:coverage
npm run build          # requiere API_PROXY_TARGET en prod
npm run start          # :3000
```

Proxy:

```
/api/backend/:path*  →  ${API_PROXY_TARGET}/:path*
```

---

## 4. Docker (recomendado)

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

La imagen usa **standalone**, usuario **no-root** y `HEALTHCHECK` → `/api/health`.

---

## 5. Health check

`GET /api/health` → siempre **200** (liveness):

```json
{
  "status": "ok|degraded",
  "service": "front-servicio-social",
  "backend": "up|down",
  "timestamp": "..."
}
```

| Combinación | Significado |
|-------------|-------------|
| `ok` + `up` | Front y backend OK |
| `degraded` + `down` | Front vivo; API no respondió a tiempo |

---

## 6. CI

`.github/workflows/ci.yml`

| Job | Pasos |
|-----|-------|
| **quality** | typecheck → lint → coverage → audit high → build |
| **e2e** | build → Playwright (públicas, auth, a11y, health, registro token path) |

Panel smoke: `npm run test:e2e:panel` con secrets `E2E_<ROL>_USER` / `PASSWORD` (si faltan, se omiten).

---

## 7. Checklist pre-deploy (objetivo)

1. [ ] Env de hosting = las mismas que usaste en `build`
2. [ ] `API_PROXY_TARGET` y `NEXT_PUBLIC_SITE_URL` correctos
3. [ ] HTTPS + cookies backend `HttpOnly`/`Secure`/`SameSite`
4. [ ] `GET /api/health` → `backend: "up"`
5. [ ] Login por cada rol
6. [ ] 2–3 flujos críticos del [baseline](./PANEL_PHASE0_BASELINE.md)
7. [ ] Revisar [SEGURIDAD.md](./SEGURIDAD.md) §3.A
8. [ ] (Opcional) Sentry DSN configurado

---

## 8. Rollback

1. Conservar artefacto/commit anterior.
2. Redesplegar versión previa.
3. Verificar `/`, `/login`, `/api/health`.
4. Si el API cambió de contrato, coordinar rollback con backend.

---

## 9. Monitoreo

| Área | Cómo |
|------|------|
| Errores | `NEXT_PUBLIC_SENTRY_DSN` → `instrumentation.ts` + boundaries |
| Disponibilidad | `/api/health` (`backend` up/down) |
| Bundles | `npm run analyze` |
| Auth abuse | Rate limit/WAF en backend sobre `/auth/*` |

---

## 10. Límites

| Tema | Valor |
|------|--------|
| Upload actions | `bodySizeLimit: "2mb"` — UI alineada (`MAX_UPLOAD_SIZE_MB = 2`) |
| ISR público | `revalidate: 120` s |
| CSP scripts | `'unsafe-inline'` requerido por Next sin nonces (ver SEGURIDAD) |

---

*Línea base: `c44d148`.*
