# Documentación — Plataforma de Servicio Social (Frontend)

Índice de documentación técnica del repositorio `front-servicio-social`.

| Documento | Contenido |
|-----------|-----------|
| **[ARQUITECTURA.md](./ARQUITECTURA.md)** | Mapa completo del sistema: capas, rutas, roles, APIs, flujos de negocio |
| **[PANEL_CONVENTIONS.md](./PANEL_CONVENTIONS.md)** | Convenciones de desarrollo del panel (modales, actions, colores, checklist) |
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

Ver detalle completo en [ARQUITECTURA.md](./ARQUITECTURA.md).
