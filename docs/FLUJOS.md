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

## 2. Sesión y autenticación

```mermaid
sequenceDiagram
  participant U as Usuario
  participant MW as middleware.ts
  participant App as App / Server Actions
  participant API as Backend Java

  U->>App: POST /login (credenciales)
  App->>API: /api/auth/login
  API-->>App: JWT + perfil
  App-->>U: Cookie de sesión (httpOnly)

  U->>MW: GET /panel/alumno/...
  MW->>MW: Lee cookie, valida rol
  alt rol permitido
    MW-->>App: Continúa
    App->>API: serverApiRequest (Bearer)
    API-->>App: Datos
    App-->>U: HTML / RSC
  else sin sesión o rol incorrecto
    MW-->>U: Redirect /login?next=...
  end
```

### Reglas de sesión (frontend)

1. **Cookie httpOnly** — el token no se expone al JavaScript del navegador.
2. **`middleware.ts`** — primera línea de defensa: rutas `/panel/*` exigen sesión y rol.
3. **Server Actions** — segunda línea: `runAuthorizedAction` valida rol antes de llamar al API.
4. **Redirects seguros** — `isSafeInternalPath` evita open redirects en `?next=`.
5. **El backend es la autoridad** — el front solo oculta UI; toda mutación debe rechazarse en API si el rol no aplica.

### Recuperación de contraseña

```mermaid
sequenceDiagram
  participant U as Usuario
  participant F as Frontend
  participant API as Backend

  U->>F: /recuperar-contrasena (usuario o correo)
  F->>API: POST /auth/password/forgot
  API-->>U: Correo con enlace + token
  U->>F: /restablecer-contrasena?token=…
  F->>API: POST /auth/password/reset
  API-->>F: OK
  F-->>U: Redirect a login
```

Archivos: `src/features/auth/reset-password/`, `password-reset.service.ts`.

Archivos clave:

- `src/middleware.ts`
- `src/lib/auth/` — roles, redirects, postulación, CV
- `src/lib/actions/run-authorized-action.ts`

---

## 3. Flujo de registro de alumno

```mermaid
flowchart TD
  A[Usuario abre /registro] --> B{¿Token de escuela?}
  B -->|Sí| C[Validar token]
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

- Con token: la escuela queda vinculada automáticamente.
- Sin token: `escuelaTextoCapturada` requiere normalización por delegación antes de postularse.
- Aviso de privacidad obligatorio.

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

| Control | Ubicación |
|---------|-----------|
| Headers (CSP, HSTS prod, X-Frame-Options) | `next.config.ts` |
| Middleware de roles | `src/middleware.ts` |
| Guards en actions | `runAuthorizedAction` |
| Paths internos seguros | `isSafeInternalPath` |
| Sin `poweredBy` | `next.config.ts` |

**Limitación conocida:** el proxy `/api/backend` expone el API al navegador para llamadas cliente; el backend debe autorizar cada endpoint.

---

## 9. Comandos de calidad

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint
npm run check       # typecheck + lint
npm run build       # Build producción
```

CI: `.github/workflows/ci.yml` ejecuta los tres en cada PR.

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

Export central: `src/lib/domain/index.ts`.
