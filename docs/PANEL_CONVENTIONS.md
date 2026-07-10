# Convenciones del panel

Guía de referencia para desarrollar y migrar pantallas del panel (`/panel/*`).  
Complementa [ARQUITECTURA.md](./ARQUITECTURA.md) (mapa general) y [PANEL_PHASE0_BASELINE.md](./PANEL_PHASE0_BASELINE.md) (línea base y smoke tests).

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
| **Actions** | `actions/*.actions.ts` | `"use server"`, `runAuthorizedAction`, revalidate |
| **Services** | `services/*.service.ts` | HTTP al proxy `/api/{rol}/...` |
| **Types** | `types/{rol}.types.ts` | Request/response alineados con DTOs Java |
| **Utils** | `lib/*.utils.ts` | Reglas de negocio reutilizables (gates UI) |

**Regla:** los componentes cliente **nunca** llaman `serverApiRequest` ni `apiRequest` directamente para mutaciones del panel. Siempre pasan por una server action con `runAuthorizedAction`.

Excepción pública legítima: formularios de auth (`login`/`registro`/`reset`) usan `apiRequest` en cliente porque aún no hay sesión de panel.

Checklist de seguridad al mutar: [SEGURIDAD.md](./SEGURIDAD.md) §3.B.

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

## Sistema de color

Tokens en `src/styles/variables.css`. Regla general: **~80 % gris/blanco**, marca y acentos con moderación.

| Rol visual | Token / variante | Uso |
|------------|------------------|-----|
| **Vino** | `--color-vino`, `Button variant="primary"` | Marca, navegación lateral, día activo en calendario, CTAs de landing, filtros activos |
| **Azul acción** | `--color-action`, `Button variant="action"` | Crear, registrar, guardar, subir, validar, aprobar, publicar, emitir |
| **Dorado** | `--color-dorado`, `variant="secondary"` / `accent` | Acento en cards, nav activo (icono), highlights secundarios |
| **Verde** | `--color-success`, `variant="success"` | Guardar cambios confirmados; estatus validado (badges, contadores) |
| **Gris** | `--color-gris-*`, `--color-border` | Estructura, texto secundario, fondos |

### Botones

```tsx
<Button variant="outline">Cancelar</Button>
<Button variant="action">Registrar horas</Button>   {/* operación principal */}
<Button variant="primary">Registrarme</Button>      {/* marca en landing */}
```

- `DataTableToolbarAction` usa `action` por defecto (ej. “Nueva vacante”).
- Formularios en modal: submit con `variant="action"`.
- Destructivos: `variant="outline"` + clase `dangerButton` del modal.
- No usar vino para “Registrar horas”, “Guardar cambios”, etc.

---

## Modales de detalle (patrón canónico)

### Recursos globales

| Recurso | Ruta |
|---------|------|
| Estilos shell | `@/shared/styles/DetailModal.module.css` |
| Secciones proceso | `@/shared/styles/DetailModalSections.module.css` |
| Hero reutilizable | `DetailModalHero` desde `@/shared/components/DetailModal` |
| Skeleton | `EntityDetailModalSkeleton` (usa `DetailModal.module.css`) |
| Hook carga | `useDetailModalLoader` |
| Modales proceso compartidos | `@/shared/proceso/` (`CartaGestionModal`, `DocumentoGestionModal`, `presentacion.utils`) |
| Tarjetas documento/carta | `ProcesoFileCard.module.css` en `@/shared/proceso/` |
| Formularios en modal | `PanelFormModal.module.css` (`formLayout`, `formActions`) |
| Texto largo / narrativa | `DetailModal.module.css` (`narrativeSection`, `narrativeLabel`) |

### Anatomía del modal

```tsx
import { DetailModalHero } from "@/shared/components/DetailModal";
import detailStyles from "@/shared/styles/DetailModal.module.css";

export function EjemploDetailModal({ entityId, open, onClose }: Props) {
  const { detail, error, isLoading, isReloading } = useDetailModalLoader(/* ... */);

  return (
    <Modal open={open} title={...} onClose={onClose} size="lg">
      {isLoading && !detail ? <EntityDetailModalSkeleton sections={2} /> : null}
      {error && !detail ? <Alert tone="error">{error}</Alert> : null}
      {detail ? (
        <div
          className={[detailStyles.layout, detailStyles.modalBody, isReloading && detailStyles.layoutBusy]
            .filter(Boolean)
            .join(" ")}
        >
          {actionError ? <Alert tone="error">{actionError}</Alert> : null}

          <DetailModalHero icon={UserRound} title={nombre} subtitle={folio} badges={<EstatusBadge estatus={estatus} />} />

          <dl className={detailStyles.metaList}>...</dl>

          <section className={detailStyles.contentPanel}>
            <div className={detailStyles.panelHeader}>
              <h3 className={detailStyles.panelTitle}>Acción</h3>
              <p className={detailStyles.panelDescription}>Descripción breve.</p>
            </div>
            {/* formulario o narrativa */}
          </section>
        </div>
      ) : null}
    </Modal>
  );
}
```

**Hero con badge** (documentos/cartas): `DetailModalHero badge="PDF" title={...} badges={<EstatusBadge ... />} />`

**Modales de proceso por sección** (titular/delegación): cabecera con `DetailModalSections.sectionContext`, listas con `recordList` / `horaCard`, formularios con `registerPanel`.

### Props del modal

- `entityId: number | null` — ID de la fila seleccionada
- `open: boolean` — controlado por la vista padre
- `onClose: () => void` — cierra y limpia `selected`
- `size?: "md" | "lg" | "wide" | "xl"` — ancho del diálogo (ver tabla abajo)
- `className?: string` — clase extra en el contenedor del diálogo (override puntual)

| Tamaño | Ancho aprox. | Uso típico |
|--------|--------------|------------|
| `md` | 32rem | Confirmaciones, formularios cortos |
| `lg` | 40rem | Detalle estándar (postulación, vacante) |
| `wide` | 52rem | Detalle con tablas densas (resultado de examen en postulación) |
| `xl` | 68rem | Builder de exámenes (sidebar + panel principal) |

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

import { runAuthorizedAction, type ActionResult } from "@/lib/actions";
import { USER_ROLES } from "@/lib/auth/constants";
import { revalidateDelegacionSection } from "../lib/revalidate-delegacion";
import { doSomething } from "../services/ejemplo.service";
import type { EjemploRequest, EjemploResponse } from "../types/delegacion.types";

export async function doSomethingAction(
  id: number,
  request: EjemploRequest,
): Promise<ActionResult<EjemploResponse>> {
  const result = await runAuthorizedAction(
    [USER_ROLES.ROLE_DELEGACION],
    () => doSomething(id, request),
    "No pudimos completar la acción.",
  );

  if (result.success) {
    revalidateDelegacionSection("procesos");
  }

  return result;
}
```

### Revalidación

- Llamar `revalidate{Role}Section` **solo** cuando `result.success`
- Revalidar todas las secciones afectadas (ej. aprobar documento → `procesos` + `documentos`)
- En el modal, además usar `router.refresh()` + `reloadKey` para actualizar el detalle sin cerrar

### Mensajes de error

- `runAuthorizedAction` valida rol con `requireActionSession` y delega en `runServerAction` para capturar `ApiError` y exponer `result.error` legible
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

// ✅ Bien — compactPayload omite undefined
await action(id, compactPayload({ comentario: texto.trim() || undefined }));

// ✅ Bien — omitir el campo a mano
const payload: AceptarPostulacionRequest = {};
if (texto.trim()) payload.comentario = texto.trim();
await action(id, payload);
```

Helpers: `compactPayload`, `normalizeOptionalString`, `normalizeOptionalNumber` en `@/lib/actions`.

**Ejemplo alumno:** encuesta de satisfacción → `registerEncuestaSatisfaccionAction` (no `apiRequest` desde el modal).
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
  className={detailStyles.dangerButton}
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

## Módulo de exámenes (`shared/components/examen/`)

UI compartida entre titular (edición), delegación/admin (consulta) y detalle de postulación.

### Componentes

| Export | Uso |
|--------|-----|
| `ExamenBuilderShell` | Contenedor con `ExamenOverview` arriba del builder |
| `ExamenBuilder`, `ExamenBuilderSidebar`, `ExamenBuilderMain` | Layout dos columnas |
| `ExamenBuilderItem` | Ítem compacto en sidebar |
| `ExamenOverview` | Resumen: estatus, métricas, puntaje total |
| `ExamenPreguntaPreview` | Enunciado + opciones (solo lectura) |
| `buildExamenResumenColumns` | Columnas para `DataTable` |
| `examenBuilderStyles` | CSS module exportado |

Estilos en `Examen.module.css`. No importar CSS de titular desde delegación.

### Titular — gestión

`TitularExamenesView` → `TitularExamenManageModal` (`size="xl"`) con activar/desactivar en footer.  
Dominio: `lib/domain/examen.ts` (`puedeActivarExamen`, `getPreguntasActivas`).  
Con examen **ACTIVO** solo vista previa; editar tras desactivar.

### Delegación / Admin — consulta

`DelegacionExamenesView` → `DelegacionExamenDetailModal`. Admin reutiliza la misma vista.

### Postulación — resultado automático

`TitularPostulacionExamenResultado` dentro de `TitularPostulacionDetailModal` (`size="wide"`).  
Habilitado cuando `requiereExamen && isExamenFinalizado(examenEstado)`.

### Vacante + examen

`TitularVacanteFormModal` (selector al crear/editar) + cache `lib/vacante-examen-cache.ts`.

### Alumno

`/panel/alumno/postulaciones/{id}/examen` → `AlumnoExamenPostulacionView`. Gate: `canContestarExamen`.

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
- Subida de archivos: respetar `experimental.serverActions.bodySizeLimit: "2mb"` en `next.config.ts`
- Payloads opcionales: usar `compactPayload()` de `@/lib/actions` antes de invocar server actions

---

## Checklist al migrar un modal legacy

- [ ] `DetailModal.module.css` + `DetailModalHero` (no `summaryBar` / `infoPanel`)
- [ ] `EntityDetailModalSkeleton` + `useDetailModalLoader` con `reloadKey`
- [ ] `metaList` para datos, `contentPanel` para acciones/formularios
- [ ] `usePanelRouter().refresh()` tras mutación exitosa
- [ ] `isReloading` + `layoutBusy` durante recarga
- [ ] Payloads alineados con tipos `*Request` en `lib/domain/requests.ts`
- [ ] Sin `undefined` en bodies (`compactPayload`)
- [ ] Mutación vía `runAuthorizedAction` (no `apiRequest` en el modal)
- [ ] Botones destructivos con `detailStyles.dangerButton`
- [ ] Gates en `lib/domain/*.ts`; labels de proceso en `@/shared/proceso/presentacion.utils`
- [ ] Revisar [SEGURIDAD.md](./SEGURIDAD.md) §3.B si tocas auth o tokens

### Estado de migración por rol (referencia)

| Rol | Estado |
|-----|--------|
| Admin | Completo (`DetailModal` + hero) |
| Titular | Completo |
| Alumno | Completo (vacantes, postulaciones, proceso) |
| Enlace | Completo |
| Delegación | Completo (incl. `AlumnoNormalizarModal`) |

Modales de documento/carta/horas compartidos viven en `@/shared/proceso/` — no importar features entre roles.

---

## Orden de trabajo recomendado

1. **Baseline + smoke tests** — [PANEL_PHASE0_BASELINE.md](./PANEL_PHASE0_BASELINE.md)
2. **Alinear payloads** — tipos + componentes
3. **Dominio** — `lib/domain/` (gates, requests, vacante, proceso)
4. **Fundamentos UI** — `ChartEmptyState`, `DashboardDonut`, `DashboardRankedBarChart`, `DataTableRowMenu`
5. **Shell de detalle** — `DetailModal.module.css`, `DetailModalHero`, `DetailModalSections`
6. **Proceso compartido** — `@/shared/proceso/` (modales documento/carta, `presentacion.utils`, `ProcesoFileCard`)
7. **Convenciones** — este documento

---

## Referencias rápidas

| Tema | Archivo ejemplo |
|------|-----------------|
| Dominio compartido | `lib/domain/` — `horas.ts`, `proceso.ts`, `documento.ts`, `vacante.ts`, `examen.ts`, `incidencia.ts`, `requests.ts`, `labels.ts` |
| Modal detalle | `DependenciaDetailModal.tsx`, `DetailModalHero` |
| Proceso compartido | `@/shared/proceso/CartaGestionModal.tsx`, `presentacion.utils.ts` |
| Modal con mutaciones complejas | `DelegacionProcesoDetailModal.tsx` |
| Documento pendiente | `DocumentoPendienteModal.tsx` |
| Postulación titular | `TitularPostulacionDetailModal.tsx`, `TitularPostulacionExamenResultado.tsx` |
| Examen titular | `TitularExamenManageModal.tsx`, `shared/components/examen/` |
| Examen delegación | `DelegacionExamenDetailModal.tsx` |
| Server action | `delegacion/actions/vacantes.actions.ts`, `titular/actions/examenes.actions.ts` |
| Service | `delegacion/services/vacantes.service.ts` |
| Labels | `lib/domain/labels.ts` |
| Horas alumno | `lib/domain/horas.ts` |
| Backend DTOs | `../Back_end/dgp-servicio-social-service/src/main/java/.../dto/` |
