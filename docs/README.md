# Documentación técnica

Guías del repositorio `front-servicio-social`. Empieza por [ARQUITECTURA.md](./ARQUITECTURA.md) si es tu primera vez en el proyecto.

---

## Índice

| Documento | Audiencia | Contenido |
|-----------|-----------|-----------|
| **[ARQUITECTURA.md](./ARQUITECTURA.md)** | Todos | Capas, rutas, roles, APIs, módulos compartidos |
| **[FLUJOS.md](./FLUJOS.md)** | Producto / QA / dev | Diagramas Mermaid: sesión, registro, postulación, proceso, exámenes |
| **[PANEL_CONVENTIONS.md](./PANEL_CONVENTIONS.md)** | Desarrollo panel | Modales, actions, servicios, dominio, exámenes |
| **[PANEL_PHASE0_BASELINE.md](./PANEL_PHASE0_BASELINE.md)** | QA / release | Inventario E2E por rol, 15 smoke tests, criterio de salida |

---

## Arranque local

```bash
cp .env.example .env.local
npm install
npm run dev          # http://localhost:3000
```

Backend Java en `http://localhost:8080` (`API_PROXY_TARGET`).

Verificación antes de PR:

```bash
npm run check        # typecheck + lint
npm run build
```

---

## Mapa mental

```
┌─────────────────────────────────────────────────────────┐
│  Público (sin sesión)                                   │
│  landing · vacantes · login · registro · recuperar pwd  │
└──────────────────────────┬──────────────────────────────┘
                           │ login + cookie
┌──────────────────────────▼──────────────────────────────┐
│  Panel /panel/{rol}/{seccion}                           │
│  alumno · titular · delegacion · admin · enlace         │
└──────────────────────────┬──────────────────────────────┘
                           │ server actions + services
┌──────────────────────────▼──────────────────────────────┐
│  Backend Java :8080  (proxy /api/backend)               │
└─────────────────────────────────────────────────────────┘
```

---

## Módulos transversales

| Módulo | Ubicación | Quién lo usa |
|--------|-----------|--------------|
| Auth y sesión | `src/lib/auth/` | Middleware, redirects, postulación, CV |
| Dominio / reglas | `src/lib/domain/` | Gates UI, validaciones, tipos base |
| Exámenes | `shared/components/examen/`, `lib/domain/examen.ts` | Titular (CRUD), alumno (contestar), delegación/admin (monitor) |
| Horas y calendario | `shared/proceso/horas/` | Alumno y titular |
| Proceso (docs/cartas) | `shared/proceso/` | Alumno, titular, delegación |
| Encuestas públicas | `lib/services/public-encuestas.service.ts` | Landing, alumno (satisfacción), delegación (moderación) |
| Recuperación contraseña | `features/auth/reset-password/` | Público — `POST /auth/password/forgot` + `reset` |

---

## Rutas auth (referencia rápida)

| Ruta | Componente |
|------|------------|
| `/login` | `LoginForm` |
| `/registro` | `RegisterForm` (+ token escuela opcional) |
| `/recuperar-contrasena` | `ResetPasswordFlow` — envía enlace al correo |
| `/restablecer-contrasena?token=` | `ResetPasswordTokenForm` — nueva contraseña |

Enlace desde login: “¿Olvidaste tu contraseña?” → `/recuperar-contrasena`.

---

## Dónde poner código nuevo

| Tipo de cambio | Ubicación |
|----------------|-----------|
| Nueva pantalla del panel | `features/{rol}/sections/` + `components/` |
| Regla de negocio compartida | `lib/domain/` |
| Servicio HTTP usado por varios roles | `lib/services/` |
| UI reutilizable | `shared/components/` |
| Server action con guard de rol | `features/{rol}/actions/` + `runAuthorizedAction` |

**Evitar** imports entre features (`features/admin` → `features/delegacion`). Extraer a `lib/` o `shared/`.

---

## Más información

- Convenciones Next.js del repo: `AGENTS.md`
- Backend: `../Back_end/dgp-servicio-social-service`
