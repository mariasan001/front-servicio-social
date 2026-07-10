# Seguridad del frontend

Guía objetiva de controles de seguridad en `front-servicio-social`.  
La **autorización definitiva** siempre vive en el backend Java. El front añade defensa en profundidad.

Complementa [ARQUITECTURA.md](./ARQUITECTURA.md) §9–10 y [DEPLOY.md](./DEPLOY.md).

---

## 1. Principios (qué se espera)

| # | Principio | Qué implica en este repo |
|---|-----------|--------------------------|
| 1 | **Backend manda** | Cada endpoint valida sesión y rol. El front no es la única barrera. |
| 2 | **Sesión en cookie** | No hay tokens de auth en `localStorage`. Cookie `HttpOnly` (la define el backend). |
| 3 | **Mutaciones por server action** | El panel no llama `serverApiRequest` / `apiRequest` desde componentes cliente. |
| 4 | **Tokens sensibles fuera del query** | Registro y reset usan path (`/registro/{token}`, `/restablecer-contrasena/{token}`). |
| 5 | **HTTPS en producción** | Obligatorio para cookies `Secure` y HSTS. |

---

## 2. Controles implementados (mapa)

| Control | Dónde | Qué hace |
|---------|-------|----------|
| Middleware de roles | `src/middleware.ts` | Protege `/panel/*`; guest-only en login/registro/reset |
| Guards en actions | `runAuthorizedAction` | Exige sesión + rol antes de mutar |
| Paths internos seguros | `isSafeInternalPath` | Evita open-redirect en `?next=` |
| Headers HTTP | `next.config.ts` | CSP, HSTS (prod), `X-Frame-Options`, `nosniff`, `Permissions-Policy` |
| Tokens en path | `registro/[token]`, `restablecer-contrasena/[token]` | Menos fuga por Referer/historial |
| `Referrer-Policy: no-referrer` | rutas de registro/reset con token | Evita filtrar token en Referer |
| Payloads limpios | `compactPayload()` | No envía `undefined` → `"$undefined"` a server actions |
| Límite de body | `serverActions.bodySizeLimit: "2mb"` | Acota uploads vía actions |
| `robots` / `noindex` | `robots.ts` + metadata auth/panel | No indexar panel ni auth |
| Health | `GET /api/health` | Liveness + estado del backend (`up`/`down`) |
| Errores | `instrumentation.ts` + `reportClientError` | Sentry opcional si hay DSN |

---

## 3. Pasos objetivos — checklist de seguridad

### A. Antes de cada release (obligatorio)

1. [ ] Backend en prod con cookies `HttpOnly` + `Secure` + `SameSite`.
2. [ ] HTTPS activo en el dominio público.
3. [ ] `API_PROXY_TARGET` apunta al API interno (no expuesto al internet público si no corresponde).
4. [ ] `NEXT_PUBLIC_SITE_URL` es el dominio real (no `localhost`).
5. [ ] `npm run check` + `npm run test:coverage` + `npm run build` en verde.
6. [ ] Smoke: login por rol + 1 mutación crítica (ver [PANEL_PHASE0_BASELINE.md](./PANEL_PHASE0_BASELINE.md)).

### B. Al desarrollar una mutación del panel

1. [ ] Crear/usar `actions/*.actions.ts` con `"use server"`.
2. [ ] Envolver con `runAuthorizedAction([USER_ROLES.…], …)`.
3. [ ] Llamar servicio con `serverApiRequest` (nunca desde el cliente).
4. [ ] Armar payload con `compactPayload()` / `normalizeOptional*` (sin `undefined`).
5. [ ] Tras éxito: `revalidate{Rol}Section(…)` y, si aplica, `router.refresh()`.
6. [ ] En UI: ocultar botones con gates de `lib/domain/` (el backend sigue validando).

### C. Al tocar auth / tokens

1. [ ] Enlaces de invitación escuela → `/registro/{token}` (`invitation-link.ts`).
2. [ ] Enlaces de reset → `/restablecer-contrasena/{token}`.
3. [ ] Si llega `?token=` legacy → redirect al path (ya implementado).
4. [ ] No loguear tokens en consola ni analytics.
5. [ ] Mantener `Referrer-Policy: no-referrer` en esas rutas.

### D. Al desplegar (ops seguridad)

1. [ ] Revisar CSP en `next.config.ts` (prod sin `unsafe-eval`).
2. [ ] Opcional: `NEXT_PUBLIC_SENTRY_DSN` para errores.
3. [ ] Rate limit / WAF en `/auth/*` (responsabilidad backend o edge).
4. [ ] Docker: imagen standalone, usuario no-root, `HEALTHCHECK` (ver [DEPLOY.md](./DEPLOY.md)).

---

## 4. Flujos sensibles (paso a paso)

### 4.1 Login

1. Usuario envía credenciales en `/login`.
2. Backend setea cookie de sesión.
3. Front resuelve home por rol (`resolveHomePath`) o `?next=` si es path interno seguro.
4. Middleware valida `/auth/me` en cada visita a `/panel/*`.

### 4.2 Registro con token de escuela

1. Admin genera invitación → URL `/registro/{token}`.
2. Front valida token (`GET /api/public/registro/tokens/{token}`).
3. Si `?token=` llega en query → redirect a `/registro/{token}`.
4. Alta con `POST /api/public/alumnos/registro-con-token`.

### 4.3 Recuperación de contraseña

1. `/recuperar-contrasena` → `POST /auth/password/forgot` (respuesta genérica anti-enumeración).
2. Correo con `/restablecer-contrasena/{token}`.
3. Nueva contraseña con política de complejidad (`password-strength.ts`).
4. `POST /auth/password/reset` → login.

### 4.4 Mutación en panel (ejemplo)

1. Usuario con rol correcto abre modal.
2. Cliente llama server action.
3. `runAuthorizedAction` verifica sesión + rol → si no, falla.
4. Service llama backend con cookies.
5. Backend autoriza de nuevo y persiste.
6. Front revalida sección.

---

## 5. Limitaciones conocidas (honestas)

| Tema | Estado | Mitigación |
|------|--------|------------|
| Proxy `/api/backend/*` expuesto al browser | Por diseño (auth cliente) | Backend debe autorizar **todo** endpoint |
| CSP con `script-src 'unsafe-inline'` | Next App Router lo requiere sin nonces | `script-src-attr 'none'`; HSTS; sin `unsafe-eval` en prod |
| CSRF explícito en front | No hay token CSRF propio | Depende de `SameSite` + cookies del backend |
| Middleware Next 16 | Convención `middleware.ts` deprecada → `proxy` | Migración pendiente; comportamiento actual válido |
| Sentry | Opcional; sin DSN solo consola | Configurar DSN en prod si se requiere APM |

---

## 6. Qué NO hacer

- No guardar JWT/sesión en `localStorage` o `sessionStorage`.
- No llamar `apiRequest` / `serverApiRequest` desde un `*View` / `*Modal` del panel.
- No poner tokens de registro/reset en query string en enlaces nuevos.
- No confiar solo en ocultar botones: el backend debe rechazar la operación.
- No desactivar HTTPS, HSTS o CSP en producción “para probar”.
- No commitear `.env.local` ni DSN/credenciales reales.

---

## 7. Archivos de referencia rápida

| Tema | Archivo |
|------|---------|
| Headers / CSP / proxy | `next.config.ts` |
| Middleware | `src/middleware.ts` |
| Roles y paths | `src/lib/auth/constants.ts`, `roles.ts` |
| Actions autorizadas | `src/lib/actions/run-authorized-action.ts` |
| Payloads | `src/lib/actions/normalize-server-args.ts` |
| Invitación registro | `src/features/admin/components/escuelas/invitation-link.ts` |
| Reset password | `src/features/auth/reset-password/` |
| Política contraseña | `src/features/auth/validation/password-strength.ts` |
| Health | `src/app/api/health/route.ts` |
| Sentry | `src/instrumentation.ts`, `src/lib/monitoring/report-error.ts` |

---

*Línea base: commit `c44d148` — coverage, token registro en path, encuesta vía action, Docker standalone, health con backend.*
