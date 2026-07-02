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

## Arquitectura

```
src/app/              Rutas delgadas (App Router)
src/features/{rol}/   Lógica por rol: servicios, secciones, acciones
src/shared/           UI reutilizable (Form, DataTable, Modal, …)
src/lib/              API, auth, domain, server actions helpers
```

Cada rol del panel (`admin`, `delegacion`, `titular`, `enlace`, `alumno`) consume su propio prefijo de API (`/api/delegacion/*`, `/api/alumno/*`, etc.).

## Panel

- Rutas: `/panel/{rol}/[[...section]]`
- Cada rol expone secciones desde `constants/sections.ts` y las renderiza con vistas cliente (`*View`) sobre componentes compartidos (`DataTable`, `Modal`, `PageHeader`, etc.)
- Patrón por sección: `Section` (server) → `*View` (client) → modales con prefijo de rol → `actions/*.ts` → `services` → `revalidate-{rol}.ts`

## Mutaciones (Server Actions)

Patrón recomendado para formularios del panel:

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
