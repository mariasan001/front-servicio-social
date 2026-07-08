<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Documentación del proyecto

| Documento | Cuándo leerlo |
|-----------|----------------|
| [`docs/README.md`](./docs/README.md) | Índice general |
| [`docs/ARQUITECTURA.md`](./docs/ARQUITECTURA.md) | Mapa del sistema, roles, rutas, APIs, flujos |
| [`docs/PANEL_CONVENTIONS.md`](./docs/PANEL_CONVENTIONS.md) | Convenciones obligatorias del panel (modales, actions, UI) |
| [`docs/PANEL_PHASE0_BASELINE.md`](./docs/PANEL_PHASE0_BASELINE.md) | Smoke tests E2E por rol |

## Convenciones rápidas

- **Panel:** `Section` (server) → `*View` (client) → `*DetailModal` → `actions/*.actions.ts` → `services/*.service.ts` → `serverApiRequest`
- **Dominio:** reglas de negocio y tipos base en `src/lib/domain/` — usar gates antes de mostrar botones
- **UI compartida:** `src/shared/` — no importar features entre roles (`titular` no importa `delegacion`, etc.)
- **Mutaciones panel:** `runServerAction` + `revalidate{Rol}Section` — nunca `undefined` en payloads de server actions
- **Estilos:** CSS Modules + tokens en `src/styles/variables.css` — sin Tailwind
