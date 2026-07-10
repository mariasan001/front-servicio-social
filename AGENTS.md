<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Documentación del proyecto

| Documento | Cuándo leerlo |
|-----------|----------------|
| [`docs/README.md`](./docs/README.md) | Índice |
| [`docs/SEGURIDAD.md`](./docs/SEGURIDAD.md) | Controles y checklists de seguridad (prioridad) |
| [`docs/ARQUITECTURA.md`](./docs/ARQUITECTURA.md) | Mapa del sistema, roles, rutas, APIs |
| [`docs/FLUJOS.md`](./docs/FLUJOS.md) | Diagramas de sesión, registro y proceso |
| [`docs/PANEL_CONVENTIONS.md`](./docs/PANEL_CONVENTIONS.md) | Convenciones del panel |
| [`docs/PANEL_PHASE0_BASELINE.md`](./docs/PANEL_PHASE0_BASELINE.md) | Smoke E2E por rol |
| [`docs/DEPLOY.md`](./docs/DEPLOY.md) | Deploy, Docker, health, CI |

## Convenciones rápidas

- **Panel:** `Section` → `*View` → `*DetailModal` → `actions/*.actions.ts` → `services/*.service.ts` → `serverApiRequest`
- **Mutaciones:** `runAuthorizedAction` + `revalidate{Rol}Section` + `compactPayload()` — nunca `undefined` en payloads; nunca `apiRequest` desde el modal
- **Dominio:** gates en `src/lib/domain/` antes de mostrar botones (el backend autoriza de verdad)
- **Auth tokens:** `/registro/{token}` y `/restablecer-contrasena/{token}` (query legacy redirige al path)
- **UI compartida:** `src/shared/` — no importar features entre roles
- **Estilos:** CSS Modules + `src/styles/variables.css` — sin Tailwind
- **Seguridad:** seguir checklists en [`docs/SEGURIDAD.md`](./docs/SEGURIDAD.md)
