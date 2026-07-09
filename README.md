# Servicio Social Edomex — Frontend

Plataforma web del **Gobierno del Estado de México** para que estudiantes realicen servicio social, prácticas profesionales o residencias en dependencias estatales.

Stack: **Next.js 16** (App Router) · **React 19** · **TypeScript** · CSS Modules.

---

## Inicio rápido

```bash
git clone <repo>
cd front-servicio-social
cp .env.example .env.local
npm install
npm run dev
```

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend (Java) | http://localhost:8080 |

El frontend proxifica el API con `API_PROXY_TARGET`. El navegador llama a `/api/backend/*`.

---

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `API_PROXY_TARGET` | Origen del backend para rewrites de servidor (obligatorio en producción) |
| `NEXT_PUBLIC_API_URL` | Base para `apiRequest` en cliente (default `/api/backend`) |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (SEO, sitemap, enlaces de invitación) |

---

## ¿Qué hace cada rol?

| Rol | Ruta | Función principal |
|-----|------|-------------------|
| Público | `/`, `/vacantes` | Landing y directorio de vacantes |
| Alumno | `/panel/alumno` | CV, postulación, proceso, horas, documentos |
| Titular | `/panel/titular` | Vacantes, postulaciones, exámenes, seguimiento |
| Delegación | `/panel/delegacion` | Publicación, validaciones, procesos, reportes |
| Admin | `/panel/admin` | Catálogos: dependencias, escuelas, áreas, usuarios |
| Enlace escolar | `/panel/enlace` | Consulta read-only de alumnos de su escuela |

---

## Rutas públicas de acceso

| Ruta | Descripción |
|------|-------------|
| `/login` | Inicio de sesión (`?next=` para volver al panel) |
| `/registro` | Registro de alumno (con o sin token de escuela) |
| `/recuperar-contrasena` | Solicitar enlace de recuperación por correo |
| `/restablecer-contrasena?token=…` | Definir nueva contraseña con token del correo |
| `/vacantes` | Directorio público de vacantes |

Flujo de recuperación: usuario o correo → correo con enlace → token en URL → nueva contraseña → login.

Implementación: `src/features/auth/reset-password/` · API `POST /auth/password/forgot` y `POST /auth/password/reset`.

---

## Estructura del código

```
src/
├── app/                 # Rutas Next.js (delgadas)
├── features/            # Lógica por dominio (auth, alumno, titular, delegacion…)
├── shared/              # UI reutilizable (Form, DataTable, Modal, examen, horas…)
└── lib/                 # Infraestructura: api, auth, domain, actions, services
```

Patrón del panel:

```
Section (server) → *View (client) → *DetailModal → actions/*.ts → services → backend
```

Las mutaciones del panel usan **server actions** con `runAuthorizedAction` (validación de rol en servidor).

---

## Scripts

```bash
npm run dev         # Desarrollo (:3000)
npm run build       # Build producción
npm run start       # Servir build
npm run typecheck   # TypeScript
npm run lint        # ESLint
npm run check       # typecheck + lint
npm run test        # Unit tests (Vitest, 100+ casos)
npm run test:coverage
npm run test:e2e    # E2E Playwright
```

CI (`.github/workflows/ci.yml`): `typecheck` → `lint` → `test:coverage` → `audit` → `build` → job E2E Playwright.

---

## Documentación

Índice completo en **[docs/README.md](./docs/README.md)**.

| Documento | Para qué sirve |
|-----------|----------------|
| [ARQUITECTURA.md](./docs/ARQUITECTURA.md) | Capas, rutas, APIs, módulos transversales |
| [FLUJOS.md](./docs/FLUJOS.md) | Diagramas: sesión, postulación, proceso, exámenes |
| [PANEL_CONVENTIONS.md](./docs/PANEL_CONVENTIONS.md) | Cómo desarrollar pantallas del panel |
| [PANEL_PHASE0_BASELINE.md](./docs/PANEL_PHASE0_BASELINE.md) | Smoke tests E2E por rol |

---

## Backend relacionado

Repositorio Java: `../Back_end/dgp-servicio-social-service` (puerto `8080`).

El frontend es la capa de presentación; **toda autorización definitiva vive en el backend**. Los guards del front (`middleware`, `runAuthorizedAction`) son defensa en profundidad.

---

## Seguridad (resumen)

- Cookie de sesión httpOnly
- Middleware de roles en `/panel/*`
- Headers: CSP, X-Frame-Options, HSTS (producción)
- Redirects seguros con `isSafeInternalPath`

Detalle en [FLUJOS.md §8](./docs/FLUJOS.md#8-seguridad-en-el-front).
