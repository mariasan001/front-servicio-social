# Arquitectura del frontend — Servicio Social Edomex

Documentación actualizada del repositorio `front-servicio-social`. Describe **cómo está organizado el código**, **cómo fluyen los datos** y **cómo se relacionan** la web pública, la autenticación y el panel por roles.

**Backend relacionado:** `../Back_end/dgp-servicio-social-service` (Java, puerto `8080`).

---

## 1. Propósito del sistema

Plataforma web para que estudiantes del Estado de México realicen **servicio social, prácticas profesionales o residencias** en dependencias del gobierno estatal.

| Actor | Qué hace en la plataforma |
|-------|---------------------------|
| **Público** | Consulta landing, directorio de vacantes, registro |
| **Alumno** | CV, postulación, proceso (horas, documentos, cartas) |
| **Titular de área** | Vacantes, postulaciones, seguimiento de alumnos asignados |
| **Delegación** | Publicar vacantes, validar documentos/horas, liberaciones |
| **Admin** | Catálogos: dependencias, escuelas, áreas, usuarios |
| **Enlace escolar** | Consulta read-only de alumnos/procesos de su escuela |

---

## 2. Stack técnico

| Tecnología | Versión / nota |
|------------|----------------|
| Next.js (App Router) | 16.x |
| React | 19.x |
| TypeScript | 5.x |
| Estilos | CSS Modules + variables en `src/styles/variables.css` (sin Tailwind) |
| Iconos | `lucide-react` |
| Toasts | `sonner` |
| Skeletons | `react-loading-skeleton` |

**Scripts** (`package.json`):

| Comando | Acción |
|---------|--------|
| `npm run dev` | Servidor desarrollo `:3000` |
| `npm run build` | Build producción |
| `npm run start` | Servir build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sin emit |
| `npm run check` | typecheck + lint |

---

## 3. Mapa del repositorio

```
front-servicio-social/
├── src/
│   ├── app/                    # Rutas Next.js (delgadas)
│   │   ├── page.tsx            # Landing /
│   │   ├── login/                # Auth
│   │   ├── registro/
│   │   ├── recuperar-contrasena/
│   │   ├── vacantes/           # Directorio público
│   │   └── panel/              # Panel por rol
│   ├── features/               # Lógica por dominio
│   │   ├── landing/            # Web pública
│   │   ├── auth/               # Login, registro, reset
│   │   ├── panel/              # Shell compartido del panel
│   │   ├── admin/
│   │   ├── delegacion/
│   │   ├── titular/
│   │   ├── alumno/
│   │   └── enlace/
│   ├── lib/                    # Infraestructura compartida
│   │   ├── api/                # HTTP cliente/servidor/público
│   │   ├── auth/               # Roles, sesión, rutas
│   │   ├── domain/             # Reglas de negocio y tipos base
│   │   ├── actions/            # runServerAction, ActionResult
│   │   └── cache/              # revalidate-panel
│   ├── shared/                 # UI reutilizable (DataTable, Modal, Form…)
│   ├── middleware.ts           # Guard de auth/roles
│   └── styles/                 # reset, variables, accessibility
├── docs/                       # Esta documentación
├── public/                     # Assets estáticos
├── .env.example
└── next.config.ts              # Proxy /api/backend → backend Java
```

---

## 4. Dos mundos: público vs panel

El frontend tiene **dos formas distintas** de hablar con el backend. No mezclar patrones.

```mermaid
flowchart TB
  subgraph PUBLICO["Web pública (sin cookie de sesión)"]
    L[Landing /]
    V["/vacantes"]
    A[Auth forms]
    L --> PR[publicApiGet]
    V --> PR
    PR --> BE1["Backend GET /api/public/*"]
    A --> PX[apiRequest → /api/backend]
    PX --> BE2["Backend POST /auth, /api/public/alumnos/*"]
  end

  subgraph PANEL["Panel (con cookie de sesión)"]
    PG["/panel/{rol}"]
    PG --> SEC[Section server]
    SEC --> SVC[services/*.service.ts]
    SVC --> SAR[serverApiRequest]
    SAR --> BE3["Backend /api/{rol}/*"]
    MOD[DetailModal client] --> ACT[actions/*.actions.ts]
    ACT --> SVC
  end
```

| Aspecto | Web pública | Panel interno |
|---------|-------------|---------------|
| Autenticación | No (excepto forms auth) | Cookie de sesión |
| Fetch servidor | `publicApiGet` (`lib/api/public-request.ts`) | `serverApiRequest` (`lib/api/server-request.ts`) |
| Fetch cliente | `apiRequest` → proxy `/api/backend` | No llamar API directo desde cliente |
| Mutaciones | Formularios auth en cliente | Server Actions + `runServerAction` |
| Caché | ISR `revalidate: 120s` | `revalidatePanelSection` tras mutación |
| Errores | `loadError` + `LandingPublicLoadAlert` | `Alert` en Section / modal |

---

## 5. Rutas de la aplicación

### 5.1 Rutas públicas

| URL | Archivo app | Feature |
|-----|-------------|---------|
| `/` | `src/app/page.tsx` | `LandingPage` |
| `/vacantes` | `src/app/vacantes/page.tsx` | `PublicVacantesDirectoryPage` |
| `/vacantes/[id]` | `src/app/vacantes/[id]/page.tsx` | `PublicVacanteDetailPage` |

**Secciones del landing** (anclas):

| ID | Componente |
|----|------------|
| `#inicio` | `LandingHero` |
| `#como-registro` | `LandingAbout` |
| `#proceso` | `LandingTimeline` |
| `#vacantes` | `LandingVacancies` |
| `#testimoniales` | `LandingTestimonials` |
| `#instituciones` | `LandingInstitutions` |
| `#preguntas-frecuentes` | `LandingFaq` |

### 5.2 Rutas de autenticación

| URL | Archivo | Guest-only |
|-----|---------|------------|
| `/login` | `src/app/login/page.tsx` | Sí — soporta `?next=` |
| `/registro` | `src/app/registro/page.tsx` | Sí — soporta `?token=` |
| `/registro/alumno` | redirect → `/registro` | Sí |
| `/recuperar-contrasena` | `src/app/recuperar-contrasena/page.tsx` | Sí |

**Post-registro:** tras crear cuenta, `RegisterForm` guarda credenciales en `sessionStorage` (`POST_REGISTER_CREDENTIALS_KEY`) y redirige a `/login?registered=1`. `LoginForm` las consume una sola vez para prellenar usuario/contraseña.

**Fuente única de rutas auth:** `src/lib/auth/constants.ts` → `AUTH_PATHS`  
**Reexport en features:** `src/features/auth/constants/routes.ts` → `AUTH_ROUTES`  
**Storage post-registro:** `src/features/auth/constants/storage.ts`

### 5.3 Rutas del panel

Patrón: `/panel/{rol}/[[...section]]`

| Rol | URL base | Archivo page | Layout especial |
|-----|----------|--------------|-----------------|
| Alumno | `/panel/alumno` | `panel/alumno/[[...section]]/page.tsx` | `AlumnoPanelLayout` + guard CV |
| Delegación | `/panel/delegacion` | `panel/delegacion/...` | `RolePanelLayout` |
| Titular | `/panel/titular` | `panel/titular/...` | `RolePanelLayout` |
| Admin | `/panel/admin` | `panel/admin/...` | `RolePanelLayout` |
| Enlace | `/panel/enlace` | `panel/enlace/...` | `RolePanelLayout` |

`/panel` → redirect al home del rol (`src/app/panel/page.tsx`).

**Navegación lateral:** definida en `src/features/panel/constants/navigation.ts` (`PANEL_NAVIGATION`).

---

## 6. Navegación del panel por rol

```mermaid
flowchart LR
  subgraph ALUMNO["ROLE_ALUMNO"]
    A1[inicio] --> A2[vacantes]
    A2 --> A3[postulaciones]
    A3 --> A4[proceso]
    A4 --> A5[cv]
  end

  subgraph DELEGACION["ROLE_DELEGACION"]
    D1[inicio] --> D2[vacantes]
    D2 --> D3[postulaciones]
    D3 --> D4[procesos]
    D4 --> D5[validacion]
    D5 --> D6[alumnos]
    D6 --> D7[encuestas]
    D7 --> D8[examenes]
    D8 --> D9[reportes]
  end

  subgraph TITULAR["ROLE_TITULAR_AREA"]
    T1[inicio] --> T2[vacantes]
    T2 --> T3[postulaciones]
    T3 --> T4[examenes]
    T4 --> T5[procesos]
  end

  subgraph ADMIN["ROLE_ADMINISTRADOR"]
    AD1[inicio] --> AD2[dependencias]
    AD2 --> AD3[escuelas]
    AD3 --> AD4[areas]
    AD4 --> AD5[examenes]
    AD5 --> AD6[usuarios]
  end

  subgraph ENLACE["ROLE_ENLACE_ESCOLAR"]
    E1[inicio] --> E2[alumnos]
    E2 --> E3[procesos]
    E3 --> E4[reportes]
  end
```

### Sub-rutas anidadas

| Rol | Patrón URL | Secciones |
|-----|------------|-----------|
| Alumno | `/panel/alumno/proceso/{slug}` | `resumen`, `horas`, `documentos`, `cartas`, `incidencias` |
| Alumno | `/panel/alumno/postulaciones/{idPostulacion}/examen` | Examen diagnóstico en línea (página dedicada) |
| Delegación | `/panel/delegacion/validacion/{slug}` | `documentos`, `horas`, `incidencias` |
| Titular | `/panel/titular/procesos` (+ incidencias en modal) | Seguimiento por alumno |

Constantes de slugs: `src/features/{rol}/constants/sections.ts` (y archivos `*-sections.ts` para sub-rutas).

---

## 7. Arquitectura del panel (capas)

Patrón estándar **obligatorio** para pantallas internas:

```mermaid
flowchart TD
  APP["app/panel/{rol}/[[...section]]/page.tsx<br/><i>metadata + delegación</i>"]
  SP["{Rol}SectionPage.tsx<br/><i>router de sección</i>"]
  SEC["{Rol}*Section.tsx<br/><i>server: fetch + errores</i>"]
  VIEW["{Rol}*View.tsx<br/><i>client: tabla + filtros</i>"]
  MOD["{Rol}*DetailModal.tsx<br/><i>client: detalle + mutaciones</i>"]
  ACT["actions/*.actions.ts<br/><i>use server</i>"]
  SVC["services/*.service.ts"]
  API["serverApiRequest → backend"]

  APP --> SP --> SEC --> VIEW --> MOD
  MOD --> ACT --> SVC --> API
```

| Capa | Ubicación típica | Responsabilidad |
|------|------------------|-----------------|
| **Page** | `src/app/panel/{rol}/` | Solo metadata y `<RolSectionPage />` |
| **SectionPage** | `src/features/{rol}/{Rol}SectionPage.tsx` | Valida slug, renderiza Section correcta |
| **Section** | `src/features/{rol}/sections/` | `serverApiRequest`, manejo error con `Alert`, pasa props a View |
| **View** | `src/features/{rol}/components/{seccion}/` | `"use client"`, `DataTable`, abre modales |
| **Modal** | `*DetailModal.tsx` | Detalle, formularios, llama actions |
| **Actions** | `src/features/{rol}/actions/` | `runServerAction`, `revalidate{Rol}Section` |
| **Services** | `src/features/{rol}/services/` | HTTP tipado al backend |
| **Types** | `src/features/{rol}/types/` | DTOs alineados con Java |
| **Lib (gates)** | `src/features/{rol}/lib/` o `lib/domain/` | Reglas UI (mostrar/ocultar botones) |

**Regla crítica:** los componentes cliente del panel **nunca** llaman `serverApiRequest` directamente.

Convenciones detalladas: [PANEL_CONVENTIONS.md](./PANEL_CONVENTIONS.md).

---

## 8. Arquitectura web pública (landing + vacantes)

```mermaid
flowchart TD
  LP["LandingPage.tsx<br/><i>server component</i>"]
  LP --> V[getLandingVacancyPreview]
  LP --> E[getLandingInstitutionStats]
  LP --> T[getLandingTestimonials]

  V --> S1[public-vacantes.service.ts]
  E --> S2[public-escuelas.service.ts]
  T --> S3[public-testimonios.service.ts]

  S1 & S2 & S3 --> PR[publicApiGet]
  PR --> BE["Backend /api/public/*"]

  V --> LV[LandingVacancies]
  E --> LI[LandingInstitutions]
  T --> LT[LandingTestimonials]

  PV["PublicVacantesDirectoryPage"] --> DIR[PublicVacantesDirectory]
  PD["PublicVacanteDetailPage"] --> DET[PublicVacanteDetailView]
```

### Servicios públicos

| Archivo | Endpoint | Uso |
|---------|----------|-----|
| `services/public-vacantes.service.ts` | `GET /api/public/vacantes`, `GET /api/public/vacantes/{id}` | Landing + directorio |
| `services/public-escuelas.service.ts` | `GET /api/public/escuelas/estadisticas` | Tarjetas instituciones |
| `services/public-testimonios.service.ts` | `GET /api/public/testimonios` | Testimonios |

### Cliente HTTP público

`src/lib/api/public-request.ts`:

```typescript
publicApiGet<T>(path) →
  | { ok: true, data: T }
  | { ok: false, reason: "not_found" | "unavailable" }
```

- Sin cookies
- ISR: `revalidate: 120` segundos
- Resultado mapeado en `lib/public-data.ts` → `{ data, loadError? }`

### Estados de UI pública

| Situación | Comportamiento |
|-----------|----------------|
| API OK + datos | Tarjetas / listado |
| API OK + vacío | Empty state (“No hay vacantes…”) |
| API falla | `LandingPublicLoadAlert` (error visible, no fingir vacío) |
| Detalle 404 | `notFound()` de Next.js |
| Detalle error servidor | Alert en página de detalle |

### Auth (formularios)

| Archivo | Endpoints |
|---------|-----------|
| `auth/services/auth.service.ts` | `POST /auth/login`, `GET /auth/me`, `POST /auth/logout` |
| `auth/services/register.service.ts` | `GET /api/public/registro/tokens/{token}`, `POST /api/public/alumnos/registro-*` |
| `auth/services/password-reset.service.ts` | `POST /api/public/auth/recuperacion-contrasena/*` |

Auth usa `apiRequest` (cliente) → `/api/backend` (proxy). **No** usa server actions (patrón distinto al panel, válido para forms de login).

---

## 9. Autenticación y middleware

```mermaid
sequenceDiagram
  participant B as Browser
  participant M as middleware.ts
  participant N as Next.js
  participant J as Backend Java

  B->>N: GET /panel/alumno
  N->>M: intercepta (matcher)
  M->>J: GET /auth/me (cookie)
  alt sin sesión
    M-->>B: redirect /login?next=/panel/alumno
  else sesión + rol incorrecto
    M-->>B: redirect home del rol
  else OK
    M-->>N: continúa
    N-->>B: página panel
  end
```

**Archivos clave:**

| Archivo | Función |
|---------|---------|
| `src/middleware.ts` | Guard guest-only y panel |
| `src/lib/auth/session.middleware.ts` | `getSessionFromRequest` |
| `src/lib/auth/session.server.ts` | `getServerSession` en RSC |
| `src/lib/auth/roles.ts` | `canAccessPath`, `resolveHomePath` |
| `src/lib/auth/constants.ts` | Roles, paths, prioridad |

**Roles** (`USER_ROLES`):

| Constante | Home path |
|-----------|-----------|
| `ROLE_ADMINISTRADOR` | `/panel/admin` |
| `ROLE_DELEGACION` | `/panel/delegacion` |
| `ROLE_TITULAR_AREA` | `/panel/titular` |
| `ROLE_ENLACE_ESCOLAR` | `/panel/enlace` |
| `ROLE_ALUMNO` | `/panel/alumno` |

**Matcher del middleware:** `/panel/:path*`, `/login`, `/registro`, `/recuperar-contrasena`

---

## 10. Capa HTTP (`lib/api`)

```mermaid
flowchart LR
  subgraph Browser
    AR[apiRequest]
    AR --> RW["/api/backend/*"]
  end

  subgraph NextServer["Next.js Server"]
    RW --> BE["API_PROXY_TARGET"]
    SAR[serverApiRequest] --> BE
    PAG[publicApiGet] --> BE
  end

  RW -.->|rewrite next.config.ts| BE
```

| Función | Archivo | Cuándo usar |
|---------|---------|-------------|
| `apiRequest` | `client.ts` | Formularios auth en browser |
| `serverApiRequest` | `server-request.ts` | Sections, services, actions del panel |
| `publicApiGet` | `public-request.ts` | Landing, vacantes públicas (ISR) |
| `serverDownloadRequest` | `download.ts` | Excel/PDF con cookies |
| `buildQuery` | `query.ts` | Query strings en services |

**Variables de entorno** (`.env.example`):

| Variable | Uso |
|----------|-----|
| `API_PROXY_TARGET` | URL backend Java (default `http://localhost:8080`) |
| `NEXT_PUBLIC_API_URL` | Base browser (default `/api/backend`) |

**Proxy** (`next.config.ts`):

```
/api/backend/:path*  →  ${API_PROXY_TARGET}/:path*
```

**Límite uploads:** `serverActions.bodySizeLimit: "10mb"`.

---

## 11. Dominio compartido (`lib/domain`)

Reglas de negocio y tipos **independientes del rol**. Todo el panel y la web pública extienden estas bases.

### Tipos base (`types.ts`)

`VacanteBase`, `PostulacionBase`, `ProcesoBase`, `IncidenciaBase`, `AlumnoBase`, `NotificacionBase`

### Módulos de reglas

| Archivo | Contenido |
|---------|-----------|
| `proceso.ts` | Gates: activación, horas completas, liberación, evaluación |
| `postulacion.ts` | Aceptar, rechazar, cancelar; gates de examen (`canContestarExamen`, `isExamenFinalizado`) |
| `vacante.ts` | Publicar, cerrar, pausar, editar |
| `documento.ts` | Subir, aprobar, observar, rechazar |
| `horas.ts` | Validar/observar/rechazar horas; máx. 12 h/día alumno |
| `incidencia.ts` | Resolver, cancelar |
| `cartas.ts` | Tipos de carta y descarga |
| `examen.ts` | Tipos de examen/pregunta; `puedeActivarExamen`, `getPreguntasActivas`, formatters |
| `modalidad.ts` | `SERVICIO_SOCIAL`, `PRACTICAS_PROFESIONALES`, `RESIDENCIAS` |
| `labels.ts` | `formatEtiqueta`, `estatusTone`, `formatFecha` (es-MX) |
| `requests.ts` | DTOs de mutación compartidos (`motivo`, `comentario`, etc.) |

**Principio:** si el backend rechazaría una acción por estatus, la UI no muestra el botón (gate en `lib/domain` o `features/{rol}/lib`).

---

## 12. Features por rol (inventario)

### Admin — `src/features/admin`

| Sección | URL | Service principal |
|---------|-----|-------------------|
| inicio | `/panel/admin` | dashboard |
| dependencias | `/panel/admin/dependencias` | `dependencias.service.ts` |
| escuelas | `/panel/admin/escuelas` | `escuelas.service.ts` |
| areas | `/panel/admin/areas` | `areas.service.ts` |
| examenes | `/panel/admin/examenes` | Reutiliza `DelegacionExamenesView` (solo lectura) |
| usuarios | `/panel/admin/usuarios` | `usuarios.service.ts` |

API: `/api/dependencias`, `/api/escuelas`, `/api/areas`, `/api/admin/usuarios-internos`

### Delegación — `src/features/delegacion`

| Sección | URL | Notas |
|---------|-----|-------|
| inicio | `/panel/delegacion` | Dashboard |
| vacantes | `.../vacantes` | Publicar / rechazar / cerrar |
| postulaciones | `.../postulaciones` | Supervisión |
| procesos | `.../procesos` | Alumnos en servicio social |
| validacion | `.../validacion/{documentos\|horas\|incidencias}` | Composite |
| alumnos | `.../alumnos` | Normalización de escuela (Vinculaciones) |
| encuestas | `.../encuestas` | Moderación de testimonios/comentarios públicos |
| examenes | `.../examenes` | Consulta de exámenes diagnóstico por área |
| reportes | `.../reportes` | Export Excel |

API: `/api/delegacion/*`

### Titular — `src/features/titular`

| Sección | URL |
|---------|-----|
| inicio | `/panel/titular` |
| vacantes | `/panel/titular/vacantes` | CRUD, `requiereExamen`, asociación examen al crear/editar |
| postulaciones | `/panel/titular/postulaciones` | Aceptar/rechazar; resultado automático del examen en detalle |
| examenes | `/panel/titular/examenes` | CRUD preguntas, activar/desactivar examen |
| procesos | `/panel/titular/procesos` | Horas, incidencias, liberación, evaluación |

API: `/api/titular/*`

### Alumno — `src/features/alumno`

| Sección | URL | Notas |
|---------|-----|-------|
| inicio | `/panel/alumno` | Notificaciones |
| vacantes | `.../vacantes` | Postulación |
| postulaciones | `.../postulaciones` | Estado; enlace a examen si aplica |
| examen en línea | `.../postulaciones/{id}/examen` | Página `AlumnoExamenPostulacionView` |
| proceso | `.../proceso/{sub}` | Horas, docs, cartas |
| cv | `.../cv` | **Gate:** nav bloqueada hasta CV completo |

API: `/api/alumno/*`, `/api/notificaciones/*`

### Enlace — `src/features/enlace`

| Sección | URL | Mutaciones |
|---------|-----|------------|
| inicio | `/panel/enlace` | — |
| alumnos | `.../alumnos` | Solo lectura |
| procesos | `.../procesos` | Solo lectura |
| reportes | `.../reportes` | Export |

API: `/api/enlace/*`

### Panel shell — `src/features/panel`

Sin services propios. Provee:

- `PanelLayout`, `PanelSidebar`, `RolePanelLayout`
- `PanelSectionSkeleton` (loading.tsx)
- `usePanelRouter` (refresh tras mutación)
- `constants/navigation.ts`

---

## 12.1 Módulo de exámenes diagnóstico

Flujo transversal entre titular, alumno y supervisión.

```mermaid
flowchart LR
  T[Titular: examenes] -->|activa| E[Examen ACTIVO]
  T -->|asocia a vacante| V[Vacante requiereExamen]
  V --> A[Alumno postula]
  A --> X["/postulaciones/{id}/examen"]
  X -->|finaliza| R[Resultado calificado]
  R --> P[Titular: detalle postulación]
  D[Delegación/Admin] -->|consulta| T
```

| Capa | Ubicación | Uso |
|------|-----------|-----|
| Dominio | `lib/domain/examen.ts`, `postulacion.ts` | Tipos, gates, formatters |
| UI compartida | `shared/components/examen/` | `ExamenBuilder`, `ExamenOverview`, `ExamenPreguntaPreview`, columnas de listado |
| Titular | `features/titular/components/examenes/` | `TitularExamenesView`, `TitularExamenManageModal`, `TitularExamenPreguntaEditor` |
| Titular vacantes | `TitularVacanteFormModal`, `TitularVacanteExamenPanel` | Selector al marcar `requiereExamen`; cache local `lib/vacante-examen-cache.ts` |
| Titular postulación | `TitularPostulacionExamenResultado` | Resumen + tabla de respuestas en modal `size="wide"` |
| Delegación/Admin | `DelegacionExamenesView`, `DelegacionExamenDetailModal` | Solo lectura (admin reutiliza vista delegación) |
| Alumno | `features/alumno/components/examen/` | Contestar examen con timer e intro modal |

**API titular:** `/api/titular/examenes/*`, `/api/titular/vacantes/{id}/examen` (POST/DELETE asociar).  
**API alumno:** `/api/alumno/postulaciones/{id}/examen/*`.  
**API delegación:** `/api/delegacion/examenes/*` (monitor).

**Nota frontend:** el detalle de vacante no expone `idExamen` en GET; la UI titular persiste la asociación reciente en `localStorage` (`vacante-examen-cache.ts`) y aplica heurística si solo hay un examen activo en el área.

---

## 13. Flujo de negocio principal

```mermaid
stateDiagram-v2
  [*] --> Registro: Alumno se registra
  Registro --> CV: Completa perfil
  CV --> Postulacion: Explora vacantes
  Postulacion --> Revision: Titular revisa
  Revision --> Proceso: Aceptada
  Revision --> [*]: Rechazada
  Proceso --> Documentacion: Alumno sube docs
  Documentacion --> Validacion: Delegación revisa
  Validacion --> Activo: Aprueba + carta + horas req.
  Activo --> HorasCompletas: Alumno registra horas
  HorasCompletas --> Liberacion: Titular + delegación
  Liberacion --> [*]: Carta liberación
```

### Paso a paso (referencia)

1. **Admin** configura dependencias, escuelas, áreas, usuarios, tokens de invitación.
2. **Alumno** se registra (`/registro`) con o sin token de escuela.
3. Si escuela capturada a mano → **Delegación → Vinculaciones** normaliza.
4. **Alumno** completa CV → puede postular.
5. **Titular** crea vacante → envía a revisión.
6. **Delegación** publica vacante → visible en landing y `/vacantes`.
7. **Alumno** postula → si la vacante requiere examen, contesta en `/panel/alumno/postulaciones/{id}/examen` → **Titular** revisa resultado automático y acepta/rechaza.
8. Se crea **proceso** → alumno sube documentos.
9. **Delegación** valida documentos, define horas, emite carta de aceptación → proceso **ACTIVO**.
10. **Alumno** registra horas → titular/delegación validan.
11. **Titular** liberación técnica + evaluación final → **Delegación** carta de liberación.

Estatus de proceso (backend): `PENDIENTE_DOCUMENTACION` → … → `ACTIVO` → `HORAS_COMPLETAS` → `LIBERADO`.

---

## 14. Componentes compartidos (`shared/`)

| Carpeta | Uso |
|---------|-----|
| `components/DataTable/` | Tablas del panel |
| `components/DetailModal/` | `DetailModalHero`, shell de modales |
| `components/Form/` | Inputs, `SearchableSelect`, `PasswordInput` |
| `components/Button/` | Variantes: `primary`, `action`, `outline`, `success` |
| `components/StatusBadge/` | `EstatusBadge` + tonos |
| `components/Modal/` | Tamaños `md`, `lg`, `wide`, `xl`; prop opcional `className` |
| `components/examen/` | `ExamenBuilder`, `ExamenOverview`, `ExamenPreguntaPreview`, columnas |
| `proceso/` | `CartaGestionModal`, `DocumentoGestionModal`, `presentacion.utils` |
| `notifications/` | Toasts globales (`notify`) |
| `icons/` | Reexport lucide |

**Colores institucionales** (`src/styles/variables.css`):

- **Vino** (`--color-vino`) — marca, landing
- **Dorado** (`--color-dorado`) — acentos
- **Azul acción** (`--color-action`) — botones de operación en panel (`variant="action"`)

---

## 15. Caché y revalidación

| Contexto | Mecanismo |
|----------|-----------|
| Landing público | `next: { revalidate: 120 }` en `publicApiGet` |
| Panel tras mutación | `revalidate{Rol}Section()` → `src/lib/cache/revalidate-panel.ts` |
| Modal tras mutación | `router.refresh()` + `reloadKey` en `useDetailModalLoader` |

---

## 16. Despliegue a producción

### Checklist mínimo

- [ ] `.env.local` / variables en hosting: `API_PROXY_TARGET`, `NEXT_PUBLIC_API_URL`
- [ ] `npm run build` sin errores
- [ ] Backend accesible desde el servidor Next (misma red/VPN)
- [ ] Rutas públicas del backend abiertas (`/api/public/vacantes`, health)
- [ ] HTTPS para cookies de sesión
- [ ] Smoke test por rol (ver [PANEL_PHASE0_BASELINE.md](./PANEL_PHASE0_BASELINE.md))

### APIs públicas pendientes en backend (no bloquean prod)

| Endpoint | Sección afectada |
|----------|------------------|
| `GET /api/public/escuelas/estadisticas` | Instituciones → empty state |
| `GET /api/public/testimonios` | Testimonios → empty state |

---

## 17. Referencias cruzadas

| Necesitas… | Lee… |
|------------|------|
| Crear pantalla panel | [PANEL_CONVENTIONS.md](./PANEL_CONVENTIONS.md) |
| Probar antes de prod | [PANEL_PHASE0_BASELINE.md](./PANEL_PHASE0_BASELINE.md) |
| DTOs del backend | `../Back_end/.../dto/` |
| Navegación panel | `src/features/panel/constants/navigation.ts` |
| Reglas Next.js 16 | `node_modules/next/dist/docs/` + `AGENTS.md` |
| Módulo exámenes | § 12.1 + `shared/components/examen/` |

---

*Última actualización: alineación post-módulo de exámenes (builder compartido, resultado en postulación, encuestas delegación, auth post-registro, modal `wide`).*
