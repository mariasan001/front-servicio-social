# Flujos del sistema — Servicio Social Edomex

Documentación gráfica de sesiones, roles, flujos de negocio y relaciones entre módulos del frontend.

Complementa [ARQUITECTURA.md](./ARQUITECTURA.md).

---

## 1. Roles y permisos

```mermaid
flowchart TB
  subgraph publico [Público]
    Landing[Landing /]
    Vacantes[Directorio vacantes]
    Registro[Registro alumno]
  end

  subgraph panel [Panel autenticado]
    Alumno[Alumno]
    Titular[Titular de área]
    Delegacion[Delegación]
    Admin[Administrador]
    Enlace[Enlace escolar]
  end

  Login[Login /login] --> Alumno
  Login --> Titular
  Login --> Delegacion
  Login --> Admin
  Login --> Enlace

  Landing --> Vacantes
  Landing --> Registro
  Registro --> Login
```

| Rol | Ruta base | Responsabilidad principal |
|-----|-----------|---------------------------|
| `ALUMNO` | `/panel/alumno` | CV, postulación, proceso activo |
| `TITULAR` | `/panel/titular` | Vacantes, postulaciones, seguimiento |
| `DELEGACION` | `/panel/delegacion` | Publicación, validación, liberación |
| `ADMIN` | `/panel/admin` | Catálogos globales |
| `ENLACE` | `/panel/enlace` | Consulta escolar read-only |

---

## 2. Sesión, autenticación y seguridad

> Detalle ampliado (capas, headers, checklists): **[SEGURIDAD.md](./SEGURIDAD.md)**.

### 2.1 Capas de defensa

```mermaid
flowchart TB
  U[Usuario] --> PX[proxy.ts rutas]
  PX -->|panel OK| RSC[RSC / panel]
  PX -->|sin sesión| L[/login]
  RSC -->|mutación| SA[runAuthorizedAction]
  SA --> API[Backend Java authz]
  U --> HDR[Headers CSP HSTS]
```

### 2.2 Secuencia de sesión

```mermaid
sequenceDiagram
  participant U as Usuario
  participant App as App / login
  participant API as Backend Java
  participant P as proxy.ts

  U->>App: POST credenciales
  App->>API: /auth/login vía /api/backend
  API-->>App: Cookie HttpOnly + perfil
  App-->>U: Redirect home del rol o ?next seguro

  U->>P: GET /panel/alumno/...
  P->>API: GET /auth/me cookie
  alt rol permitido
    P-->>App: Continúa
    App->>API: serverApiRequest
    API-->>App: Datos
    App-->>U: HTML / RSC
  else sin sesión o rol incorrecto
    P-->>U: Redirect /login?next=... o home del rol
  end
```

### 2.3 Mutación autorizada

```mermaid
sequenceDiagram
  participant M as Modal cliente
  participant A as Server Action
  participant R as runAuthorizedAction
  participant S as Service
  participant J as Java

  M->>A: acción
  A->>R: roles + fn
  R->>R: sesión + rol
  R->>S: serverApiRequest
  S->>J: /api/{rol}/...
  J-->>S: resultado
  A->>A: revalidate sección
  A-->>M: ActionResult
```

### Reglas de sesión (frontend)

1. **Cookie httpOnly** — el token no se expone al JavaScript del navegador.
2. **`proxy.ts`** — primera línea: `/panel/*` exige sesión y rol; guest-only si ya hay sesión.
3. **Server Actions** — segunda línea: `runAuthorizedAction` valida rol antes del API.
4. **Redirects seguros** — `isSafeInternalPath` evita open redirects en `?next=`.
5. **El backend es la autoridad** — el front oculta UI; toda mutación debe rechazarse en API si no aplica.
6. **Dos “proxies”** — `proxy.ts` = guard de rutas; rewrite `/api/backend` = reenvío HTTP al Java (`API_PROXY_TARGET`).

### Recuperación de contraseña

```mermaid
sequenceDiagram
  participant U as Usuario
  participant F as Frontend
  participant API as Backend

  U->>F: /recuperar-contrasena (usuario o correo)
  F->>API: POST /auth/password/forgot
  API-->>U: Correo con enlace + token
  U->>F: /restablecer-contrasena/{token}
  Note over F: ?token= redirige al path
  F->>API: POST /auth/password/reset
  API-->>F: OK
  F-->>U: Redirect a login
```

Archivos: `src/features/auth/reset-password/`, `password-reset.service.ts`.

Archivos clave de seguridad:

- `src/proxy.ts`
- `src/lib/auth/` — roles, redirects, sesión
- `src/lib/actions/run-authorized-action.ts`
- `next.config.ts` — CSP / HSTS / rewrite
- [SEGURIDAD.md](./SEGURIDAD.md) — flujos Mermaid completos

---

## 3. Flujo de registro de alumno

```mermaid
flowchart TD
  A[Usuario abre /registro o /registro/token] --> B{¿Token de escuela?}
  B -->|Path /registro/token| C[Validar token]
  B -->|Query ?token=| R[Redirect a /registro/token]
  R --> C
  C -->|Válido| D[Formulario con escuela vinculada]
  C -->|Inválido| E[Banner de error]
  B -->|No| F[Captura manual de escuela]
  D --> G[POST registro]
  F --> G
  G --> H{¿Escuela normalizada?}
  H -->|Sí| I[Cuenta activa → login]
  H -->|No| J[Cuenta pendiente validación delegación]
```

**Reglas de negocio:**

- Con token: la escuela queda vinculada automáticamente. URL canónica: `/registro/{token}`.
- Sin token: `escuelaTextoCapturada` requiere normalización por delegación antes de postularse.
- Aviso de privacidad obligatorio.
- Invitaciones: `invitation-link.ts` → siempre path (no query).

---

## 4. Flujo de postulación (alumno)

```mermaid
flowchart LR
  CV[CV completo] --> Vacante[Seleccionar vacante]
  Vacante --> Post[Enviar postulación]
  Post --> Examen{¿Examen requerido?}
  Examen -->|Sí| Exam[Examen diagnóstico]
  Examen -->|No| Rev[Titular revisa]
  Exam --> Rev
  Rev --> Acept{¿Aceptada?}
  Acept -->|Sí| Proceso[Proceso de servicio social]
  Acept -->|No| Fin[Postulación cerrada]
```

**Guards en front:**

- `hasAlumnoCvPostulacionMotivo` — redirige a CV si intenta postular sin completarlo.
- `postulacion-entry` — rutas de entrada unificadas.
- Dominio en `src/lib/domain/cv.ts` — campos obligatorios del CV.

---

## 5. Ciclo de vida del proceso

```mermaid
stateDiagram-v2
  [*] --> Postulado
  Postulado --> EnRevision: Titular revisa
  EnRevision --> Aceptado: Aceptación
  EnRevision --> Rechazado
  Aceptado --> Activo: Carta aceptación delegación
  Activo --> EnLiberacion: Horas completas
  EnLiberacion --> Liberado: Delegación libera
  Activo --> Incidencia: Reporte titular
  Incidencia --> Activo: Resuelta
  Liberado --> [*]
  Rechazado --> [*]
```

### Horas de servicio

```mermaid
sequenceDiagram
  participant A as Alumno
  participant F as Front
  participant D as Delegación/Titular
  participant API as Backend

  A->>F: Registrar jornada (mismo día)
  F->>API: POST hora
  API-->>F: PENDIENTE_VALIDACION
  D->>F: Validar / rechazar
  F->>API: PATCH estatus
  Note over A,F: Alumno solo edita descripción de actividades en corrección
```

Componentes compartidos: `src/shared/proceso/horas/` (calendario, utilidades, modal alumno/titular).

---

## 6. Exámenes diagnóstico

```mermaid
flowchart TB
  Titular[Titular crea examen] --> Borrador[Borrador]
  Borrador --> Activo[Activo con preguntas válidas]
  Activo --> Vacante[Vacante asocia examen]
  Vacante --> Alumno[Alumno contesta]
  Alumno --> Resultado[Calificación automática]
  Resultado --> Titular2[Titular ve resultado en postulación]
  Activo --> Monitor[Delegación / Admin monitorean]
```

Servicios compartidos:

- `src/lib/services/examenes-monitor.service.ts`
- `src/lib/actions/examenes-monitor.actions.ts` (roles `DELEGACION` + `ADMIN`)
- `src/shared/components/examen/ExamenesMonitorView.tsx`

---

## 7. Capas de datos

```mermaid
flowchart TB
  subgraph ui [UI]
    Page[app/page.tsx - Server Component]
    Client[features/* - Client Components]
  end

  subgraph actions [Server Actions]
    SA["*.actions.ts"]
    Auth[runAuthorizedAction]
  end

  subgraph services [Servicios]
    ServerSvc[serverApiRequest]
    ClientSvc[apiRequest]
    LibSvc[lib/services/*]
  end

  subgraph external [Externo]
    Proxy["/api/backend/*"]
    Backend[Java API :8080]
  end

  Page --> ServerSvc
  Client --> SA
  SA --> Auth
  Auth --> LibSvc
  LibSvc --> ServerSvc
  ServerSvc --> Proxy --> Backend
  Client --> ClientSvc --> Proxy
```

---

## 8. Seguridad en el front

Documento completo con capas y flujos Mermaid: **[SEGURIDAD.md](./SEGURIDAD.md)**.

| Control | Ubicación |
|---------|-----------|
| Headers (CSP, HSTS prod, X-Frame-Options, script-src-attr) | `next.config.ts` |
| Guard de rutas (Next 16) | `src/proxy.ts` |
| Rewrite HTTP al Java | `/api/backend` → `API_PROXY_TARGET` |
| Guards en actions | `runAuthorizedAction` |
| Payloads sin `undefined` | `compactPayload` |
| Tokens en path (registro / reset) | `registro/[token]`, `restablecer-contrasena/[token]` |
| Paths internos seguros | `isSafeInternalPath` |
| Fronteras de features | `eslint.config.mjs` |
| Health + backend probe | `/api/health` |
| Sin `poweredBy` | `next.config.ts` |

**Limitación conocida:** el rewrite `/api/backend` expone el API al navegador; el backend debe autorizar cada endpoint. No confundir con `proxy.ts` (guard de rutas).

---

## 9. Comandos de calidad

```bash
npm run typecheck
npm run lint
npm run check
npm run test
npm run test:coverage
npm run test:e2e          # públicas, auth, a11y, health, registro token path
npm run test:e2e:panel    # smoke + axe por rol (requiere E2E_*)
npm run analyze
npm run build
```

CI (`.github/workflows/ci.yml`):

1. **quality:** typecheck → lint → coverage → audit high → build
2. **e2e:** build → Playwright (públicas / auth / a11y / health)

Despliegue: [DEPLOY.md](./DEPLOY.md). Seguridad: [SEGURIDAD.md](./SEGURIDAD.md).

---

## 10. Índice de reglas de negocio por módulo

| Módulo | Archivo dominio |
|--------|-----------------|
| CV alumno | `src/lib/domain/cv.ts` |
| Horas | `src/lib/domain/horas.ts` |
| Proceso / estatus | `src/lib/domain/proceso.ts` |
| Postulación | `src/lib/domain/postulacion.ts` |
| Examen | `src/lib/domain/examen.ts` |
| Etiquetas / fechas | `src/lib/domain/labels.ts` |

*Última actualización: `c44d148`.*
Export central: `src/lib/domain/index.ts`.
