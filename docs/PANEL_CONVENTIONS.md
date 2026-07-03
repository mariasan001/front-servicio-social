# Convenciones del panel

Guía de referencia para desarrollar y migrar pantallas del panel (`/panel/*`).  
Complementa [PANEL_PHASE0_BASELINE.md](./PANEL_PHASE0_BASELINE.md) (línea base y smoke tests).

---

## Arquitectura por capas

```
app/panel/{rol}/[[...section]]/page.tsx   →  SectionPage (server)
                                              ↓
                                         *View.tsx (client, listado)
                                              ↓
                                         *DetailModal.tsx (client, detalle + mutaciones)

*DetailModal  →  *Action (server)  →  *.service.ts  →  serverApiRequest → backend Java
```

| Capa | Ubicación | Responsabilidad |
|------|-----------|-----------------|
| **Page** | `src/app/panel/{rol}/` | Metadata, params, delega al feature |
| **Section page** | `src/features/{rol}/` | Carga datos en server, renderiza la vista |
| **View** | `components/{seccion}/*View.tsx` | Listado, filtros, abre modales |
| **Modal** | `components/{seccion}/*DetailModal.tsx` | Detalle, formularios, mutaciones |
| **Actions** | `actions/*.actions.ts` | `"use server"`, `runServerAction`, revalidate |
| **Services** | `services/*.service.ts` | HTTP al proxy `/api/{rol}/...` |
| **Types** | `types/{rol}.types.ts` | Request/response alineados con DTOs Java |
| **Utils** | `lib/*.utils.ts` | Reglas de negocio reutilizables (gates UI) |

**Regla:** los componentes cliente **nunca** llaman `serverApiRequest` directamente. Siempre pasan por una server action.

---

## Estructura de un feature por rol

```
src/features/delegacion/
├── actions/
├── components/
│   ├── vacantes/
│   │   ├── DelegacionVacantesView.tsx
│   │   └── DelegacionVacanteDetailModal.tsx
│   └── ...
├── constants/
│   └── sections.ts          # slugs tipados del rol
├── lib/
│   ├── revalidate-delegacion.ts
│   └── proceso.utils.ts     # gates de negocio
├── services/
└── types/
    └── delegacion.types.ts
```

Cada rol expone `revalidate{Role}Section(section?)` que delega en `revalidatePanelSection` (`src/lib/cache/revalidate-panel.ts`).

---

## Vistas de listado

### Componentes obligatorios

- `PageHeader` — título, descripción, `titleId` para `aria-labelledby`
- `DataTable` + `DataTableToolbar` — columnas, búsqueda, filtros
- `PanelSectionView.module.css` — layout de página (`styles.page`, `nameCell`, etc.)

### Patrón de referencia

Ver `DelegacionVacantesView.tsx`:

- Estado local: `search`, filtros, entidad `selected` para el modal
- `useDeferredValue` en búsqueda
- `normalizeText` para comparar sin acentos
- Columna de estatus: `StatusBadge` + `formatEtiqueta` + `estatusTone`
- Acción principal: `DataTableIconAction` con icono `Eye` → abre modal

### Texto UI

- Español (México), tono institucional y directo
- Fallbacks legibles: `"Sin nombre"`, `"Sin folio"`, `"No registrada"` — no dejar celdas vacías

---

## Modales de detalle (patrón canónico)

### Usar (nuevo)

| Recurso | Ruta |
|---------|------|
| Estilos | `@/shared/styles/EntityDetailModal.module.css` |
| Skeleton | `EntityDetailModalSkeleton` |
| Hook carga | `useDetailModalLoader` |
| Formularios en modal | `PanelFormModal.module.css` (`formLayout`, `formActions`) |
| Texto largo / narrativa | `VacanteDetailNarrative.module.css` |

### Evitar (legacy — migrar cuando se toque el archivo)

| Recurso | Ruta |
|---------|------|
| Estilos legacy | `PanelDetailView.module.css` |
| Loading genérico | `LoadingState` dentro de modales con acciones |

### Anatomía del modal

```tsx
export function EjemploDetailModal({ entityId, open, onClose }: Props) {
  const router = usePanelRouter();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const { detail, error, isLoading, isReloading } = useDetailModalLoader(
    open,
    entityId,
    getEntityDetailAction,
    {
      reloadKey,
      onBeforeLoad: () => {
        setActionError(null);
        // resetear campos de formulario
      },
    },
  );

  const refresh = () => {
    router.refresh();           // invalida RSC del listado
    setReloadKey((k) => k + 1); // recarga detalle en el modal
  };

  return (
    <Modal open={open} title={...} onClose={onClose} size="lg">
      {isLoading && !detail ? <EntityDetailModalSkeleton sections={2} /> : null}
      {error && !detail ? <Alert tone="error">{error}</Alert> : null}
      {detail ? (
        <div className={[styles.layout, isReloading && styles.layoutBusy].filter(Boolean).join(" ")}>
          {actionError ? <Alert tone="error">{actionError}</Alert> : null}
          <div className={styles.summaryBar}>...</div>
          <div className={styles.infoPanel}>...</div>
          <section className={styles.section}>...</section>
        </div>
      ) : null}
    </Modal>
  );
}
```

### Props del modal

- `entityId: number | null` — ID de la fila seleccionada
- `open: boolean` — controlado por la vista padre
- `onClose: () => void` — cierra y limpia `selected`

Opcional: `entityName?: string` para título provisional mientras carga.

### Estados de mutación

1. Validar en cliente antes de llamar la action (campos requeridos, reglas de negocio)
2. `setIsMutating(true)` → action → `setIsMutating(false)`
3. Si `!result.success` → `setActionError(result.error)` y **no** cerrar el modal
4. Si éxito → `refresh()` (no cerrar salvo que el flujo lo requiera)

---

## Server actions

### Plantilla

```ts
"use server";

import { runServerAction, type ActionResult } from "@/lib/actions";
import { revalidateDelegacionSection } from "../lib/revalidate-delegacion";
import { doSomething } from "../services/ejemplo.service";
import type { EjemploRequest, EjemploResponse } from "../types/delegacion.types";

export async function doSomethingAction(
  id: number,
  request: EjemploRequest,
): Promise<ActionResult<EjemploResponse>> {
  const result = await runServerAction(
    () => doSomething(id, request),
    "No pudimos completar la acción.",
  );

  if (result.success) {
    revalidateDelegacionSection("procesos");
    // revalidar secciones relacionadas si el listado cambia en otro lado
  }

  return result;
}
```

### Revalidación

- Llamar `revalidate{Role}Section` **solo** cuando `result.success`
- Revalidar todas las secciones afectadas (ej. aprobar documento → `procesos` + `documentos`)
- En el modal, además usar `router.refresh()` + `reloadKey` para actualizar el detalle sin cerrar

### Mensajes de error

- `runServerAction` captura `ApiError` y expone `result.error` legible
- Mensaje fallback en español, orientado al usuario: *"No pudimos cargar…"*, *"No pudimos rechazar…"*
- Errores de validación del backend: revisar `result.fieldErrors` si aplica

---

## Payloads y tipos (API)

### Alineación con backend

Los `*Request` en `types/{rol}.types.ts` deben coincidir con `dto/*Request.java` del backend.  
Ante duda, consultar el DTO Java antes de nombrar un campo.

### Campos frecuentes (post Fase 1)

| Concepto | Campo en request |
|----------|------------------|
| Rechazar vacante/postulación | `motivo` |
| Cancelar proceso/hora/incidencia | `motivo` |
| Observar/rechazar documento u hora | `comentario` |
| Aceptar postulación | `comentario` (opcional) |
| Examen finalizado | `resultadoExamen: number`, `comentario?` |
| Evaluación final | `estatus`, `calificacion`, `comentario?` |
| Resolver incidencia | `tipoResolucion`, `comentario` |
| Liberación técnica | `comentario?` |

### Nunca enviar `undefined`

Next serializa `undefined` como `"$undefined"` en server actions.

```ts
// ❌ Mal
await action(id, { comentario: texto.trim() || undefined });

// ✅ Bien — omitir el campo
const payload: AceptarPostulacionRequest = {};
if (texto.trim()) payload.comentario = texto.trim();
await action(id, payload);

// ✅ Bien — campo obligatorio con fallback validado en cliente
await observeAction(id, { comentario: texto.trim() || "Observación registrada." });
```

Para argumentos opcionales en la firma de la action, usar `normalizeOptionalString` / `normalizeOptionalNumber` (`src/lib/actions/normalize-server-args.ts`).

### Response vs request

Los campos de **respuesta** pueden conservar nombres del backend aunque el request use otro (`motivoRechazo`, `comentarioTitular` en detalle de postulación). Solo alinear los **bodies de mutación**.

---

## Estatus y etiquetas

Centralizar en `src/lib/domain/labels.ts`:

```tsx
import { estatusTone, formatEtiqueta, formatFecha } from "@/lib/domain/labels";

<StatusBadge tone={estatusTone(entity.estatus)}>
  {formatEtiqueta(entity.estatus, "Sin estatus")}
</StatusBadge>
```

- Nuevo estatus del backend → añadir entrada en `STATUS_LABELS` y, si aplica, en `estatusTone`
- Comparar estatus en lógica: `estatus?.trim().toUpperCase() === "ACTIVO"`
- No hardcodear etiquetas en español dispersas en componentes

---

## Botones destructivos

Acciones irreversibles o de rechazo/cancelación:

```tsx
<Button
  type="button"
  variant="outline"
  className={styles.dangerButton}  // desde EntityDetailModal.module.css
  disabled={isMutating}
  onClick={...}
>
  Rechazar
</Button>
```

- `variant="outline"` + `dangerButton` — no usar `variant="primary"` para destructivos
- Confirmar con validación de campo requerido (`motivo`, `comentario`) antes de enviar

---

## Gates de negocio en UI

Reglas que deciden **si se muestra** una sección o botón viven en `lib/*.utils.ts`, no inline en JSX.

Ejemplo (`proceso.utils.ts`):

```ts
export function puedeActivarProceso(estatus?, horasRequeridas?, tieneCartaAceptacion?) {
  return isListoParaActivacion(estatus) && tieneHorasRequeridas(horasRequeridas) && !tieneCartaAceptacion;
}
```

En el modal:

```tsx
{puedeActivarProceso(proceso.estatus, proceso.horasRequeridas, tieneCarta) ? (
  <section>...</section>
) : null}
```

**Principio:** si el backend rechazaría la acción por estatus, no mostrar el botón (Fase 4 del plan).

---

## Servicios HTTP

```ts
export async function getVacante(idVacante: number) {
  const response = await serverApiRequest<VacanteDetalleResponse>(
    `/api/delegacion/vacantes/${idVacante}`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el detalle de la vacante.");
  }

  return response.data;
}
```

- Rutas: `/api/{rol}/...` (proxy en Next hacia `API_PROXY_TARGET`)
- Listados con filtros: `buildQuery(filters)`
- Mutaciones: `method: "PATCH"` o `"POST"` según el backend
- Subida de archivos: respetar `experimental.serverActions.bodySizeLimit` en `next.config.ts`

---

## Checklist al migrar un modal legacy

- [ ] Cambiar `PanelDetailView.module.css` → `EntityDetailModal.module.css`
- [ ] Cambiar `LoadingState` inicial → `EntityDetailModalSkeleton`
- [ ] Usar `useDetailModalLoader` con `reloadKey` + `onBeforeLoad`
- [ ] Añadir `summaryBar` + `infoPanel` + `section` con jerarquía consistente
- [ ] `usePanelRouter().refresh()` tras mutación exitosa
- [ ] `isReloading` + `layoutBusy` durante recarga
- [ ] Payloads alineados con tipos `*Request`
- [ ] Sin `undefined` en bodies
- [ ] Botones destructivos con `dangerButton`
- [ ] Gates de negocio extraídos a `lib/*.utils.ts` si aplica

### Estado de migración por rol (referencia)

| Rol | Migrado | Pendiente legacy |
|-----|---------|------------------|
| Admin | Completo | — |
| Titular | Vacantes, postulaciones, procesos, incidencias | — |
| Alumno | Vacantes, postulaciones, proceso, notificaciones (lista) | — |
| Enlace | Alumnos, procesos | — |
| Delegación | Vacantes, documentos, procesos, horas, incidencias, postulaciones | `AlumnoNormalizarModal` (formulario) |

`DelegacionProcesoDetailModal` aún usa `PanelDetailView.module.css` solo para listas internas de documentos/horas; el resto ya está en `EntityDetailModal`.

---

## Orden de trabajo recomendado

1. **Baseline + smoke tests** — [PANEL_PHASE0_BASELINE.md](./PANEL_PHASE0_BASELINE.md)
2. **Alinear payloads** — tipos + componentes (Fase 1, completada)
3. **Convenciones** — este documento (Fase 2)
4. **Consolidar duplicados** — `lib/domain/horas.ts`, `proceso.ts`, `requests.ts` (Fase 3, completada)
5. **Gates de negocio** — `lib/domain/*.ts` (Fase 4, completada)
6. **Migración UI** — `EntityDetailModal` + `EntityDetailRecordList` (Fase 5, completada en modales)

---

## Referencias rápidas

| Tema | Archivo ejemplo |
|------|-----------------|
| Dominio compartido | `lib/domain/` — `horas.ts`, `proceso.ts`, `documento.ts`, `vacante.ts`, `incidencia.ts`, `requests.ts`, `labels.ts` |
| Listado + modal | `DelegacionVacantesView.tsx`, `DelegacionVacanteDetailModal.tsx` |
| Modal con mutaciones complejas | `DelegacionProcesoDetailModal.tsx` |
| Documento pendiente | `DocumentoPendienteModal.tsx` |
| Postulación titular | `TitularPostulacionDetailModal.tsx` |
| Server action | `delegacion/actions/vacantes.actions.ts` |
| Service | `delegacion/services/vacantes.service.ts` |
| Labels | `lib/domain/labels.ts` |
| Horas alumno | `lib/domain/horas.ts` |
| Backend DTOs | `../Back_end/dgp-servicio-social-service/src/main/java/.../dto/` |
