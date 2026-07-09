# Documentación — Plataforma de Servicio Social (Frontend)

Índice de documentación técnica del repositorio `front-servicio-social`.

| Documento | Contenido |
|-----------|-----------|
| **[ARQUITECTURA.md](./ARQUITECTURA.md)** | Mapa completo: capas, rutas, roles, APIs |
| **[FLUJOS.md](./FLUJOS.md)** | Diagramas Mermaid: sesión, postulación, proceso, exámenes |
| **[PANEL_CONVENTIONS.md](./PANEL_CONVENTIONS.md)** | Convenciones del panel: modales, actions, dominio, módulo de exámenes |
| **[PANEL_PHASE0_BASELINE.md](./PANEL_PHASE0_BASELINE.md)** | Smoke tests E2E por rol y flujo |

## Inicio rápido

```bash
cp .env.example .env.local
npm install
npm run dev    # http://localhost:3000
```

Backend Java en `http://localhost:8080` (variable `API_PROXY_TARGET`).

## Estructura mental del proyecto

```
Público (sin sesión)     →  landing, /vacantes, auth
Panel (con sesión)       →  /panel/{rol}/{seccion}
Compartido               →  lib/domain, lib/api, shared/
```

## Módulos transversales destacados

| Módulo | Ubicación | Roles |
|--------|-----------|-------|
| Exámenes diagnóstico | `shared/components/examen/`, `lib/domain/examen.ts` | Titular (gestión), Delegación/Admin (consulta), Alumno (contestar), Titular (resultado en postulación) |
| Proceso (docs/cartas) | `shared/proceso/` | Alumno, Titular, Delegación |
| Auth post-registro | `features/auth/constants/storage.ts` | Público → login con credenciales prellenadas |

Ver detalle completo en [ARQUITECTURA.md](./ARQUITECTURA.md).
