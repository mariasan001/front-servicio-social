# Servicio Social Edomex — Frontend

Aplicación Next.js para el programa de servicio social y residencia del Estado de México.

## Requisitos

- Node.js 20+
- Backend en `http://localhost:8080` (o la URL configurada en `.env`)

## Configuración

```bash
cp .env.example .env.local
npm install
npm run dev
```

Variables:

| Variable | Descripción |
|----------|-------------|
| `API_PROXY_TARGET` | Origen del backend para rewrites de servidor |
| `NEXT_PUBLIC_API_URL` | Base URL para `apiRequest` en el cliente (`/api/backend`) |

## Documentación

Índice completo en **[docs/README.md](./docs/README.md)**.

| Documento | Contenido |
|-----------|-----------|
| [ARQUITECTURA.md](./docs/ARQUITECTURA.md) | Capas, rutas, roles, APIs, flujos de negocio |
| [PANEL_CONVENTIONS.md](./docs/PANEL_CONVENTIONS.md) | Patrones del panel (modales, actions, colores) |
| [PANEL_PHASE0_BASELINE.md](./docs/PANEL_PHASE0_BASELINE.md) | Smoke tests E2E |

## Arquitectura

```
src/app/              Rutas delgadas (App Router)
src/features/{rol}/   Lógica por rol: servicios, secciones, acciones
src/shared/           UI reutilizable (Form, DataTable, Modal, examen, proceso…)
src/lib/              API, auth, domain, server actions helpers
```

Cada rol del panel (`admin`, `delegacion`, `titular`, `enlace`, `alumno`) consume su prefijo de API (`/api/delegacion/*`, `/api/alumno/*`, etc.).

## Panel

- Rutas: `/panel/{rol}/[[...section]]`
- Navegación: `src/features/panel/constants/navigation.ts`
- Patrón por sección: `Section` (server) → `*View` (client) → modales → `actions/*.ts` → `services` → `revalidate-{rol}.ts`

Secciones recientes alineadas con el código:

| Rol | Secciones adicionales |
|-----|------------------------|
| Titular | `examenes` — CRUD y activación de exámenes diagnóstico |
| Delegación / Admin | `examenes` — consulta (delegación reutilizada en admin) |
| Delegación | `encuestas` — moderación de comentarios públicos |
| Alumno | `/panel/alumno/postulaciones/[id]/examen` — examen en línea |

## Mutaciones (Server Actions)

```ts
"use server";

import { runServerAction } from "@/lib/actions";
import { miServicio } from "../services/mi-servicio.service";

export async function miAccionAction(input: MiInput) {
  return runServerAction(() => miServicio(input), "Mensaje de error por defecto.");
}
```

Ejemplo de referencia: `src/features/alumno/actions/cv.actions.ts`.

## Scripts

```bash
npm run dev      # desarrollo
npm run build    # producción
npm run lint     # ESLint
```
