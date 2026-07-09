"use client";

import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { Building2 } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { TitularAreaContext } from "../../lib/area-context";
import { MODALIDAD_TRABAJO_OPTIONS } from "../../constants/vacante-form";
import { asociarExamenVacanteAction, listExamenesAction, quitarExamenVacanteAction } from "../../actions/examenes.actions";
import { saveVacanteExamenCache } from "../../lib/vacante-examen-cache";
import { createVacanteAction, updateVacanteAction } from "../../actions/vacantes.actions";
import { mapActionFieldErrors } from "@/lib/actions/form-errors";
import { isExamenActivo } from "@/lib/domain";
import { MODALIDAD_CATALOGO_OPTIONS } from "@/lib/domain/modalidad";
import type {
  ExamenDiagnosticoResumenResponse,
  VacanteDetalleResponse,
  VacanteResponse,
} from "../../types/titular.types";
import { notify } from "@/shared/notifications";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { CheckboxField, FormField, SelectInput, TextInput } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { Modal } from "@/shared/components/Modal";
import styles from "./TitularVacanteFormModal.module.css";

type FormValues = {
  nombre: string;
  descripcion: string;
  perfilRequerido: string;
  modalidadId: string;
  modalidadTrabajo: string;
  cupoTotal: string;
  requiereExamen: boolean;
};

type VacanteFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  vacante?: VacanteResponse | VacanteDetalleResponse | null;
  areaContext: TitularAreaContext | null;
  onClose: () => void;
};

const EMPTY_VALUES: FormValues = {
  nombre: "",
  descripcion: "",
  perfilRequerido: "",
  modalidadId: "",
  modalidadTrabajo: "PRESENCIAL",
  cupoTotal: "1",
  requiereExamen: false,
};

function buildInitialValues(
  mode: VacanteFormModalProps["mode"],
  vacante?: VacanteResponse | VacanteDetalleResponse | null,
): FormValues {
  if (mode === "edit" && vacante) {
    const detalle = vacante as VacanteDetalleResponse;
    return {
      nombre: vacante.nombre ?? "",
      descripcion: detalle.descripcion ?? "",
      perfilRequerido: detalle.perfilRequerido ?? "",
      modalidadId: vacante.modalidadId ?? "",
      modalidadTrabajo: detalle.modalidadTrabajo ?? "PRESENCIAL",
      cupoTotal: String(vacante.cupoTotal ?? ""),
      requiereExamen: detalle.requiereExamen ?? false,
    };
  }

  return EMPTY_VALUES;
}

function matchesVacanteArea(examenAreaId: number | undefined, vacanteAreaId?: number) {
  if (!vacanteAreaId) return true;
  return Number(examenAreaId) === Number(vacanteAreaId);
}

function filterExamenesActivos(
  examenes: ExamenDiagnosticoResumenResponse[],
  areaId?: number,
) {
  return examenes.filter(
    (examen) => isExamenActivo(examen.estatus) && matchesVacanteArea(examen.areaId, areaId),
  );
}
function VacanteContextBanner({
  areaLabel,
  hint,
}: {
  areaLabel: string;
  hint?: string;
}) {
  return (
    <div className={styles.contextBanner} role="status">
      <span className={styles.contextIconWrap} aria-hidden="true">
        <Building2 size={18} strokeWidth={1.75} />
      </span>
      <div className={styles.contextCopy}>
        <p className={styles.contextEyebrow}>Área asignada</p>
        <p className={styles.contextTitle}>{areaLabel}</p>
        {hint ? <p className={styles.contextHint}>{hint}</p> : null}
      </div>
    </div>
  );
}

function VacanteFormModalContent({
  mode,
  vacante,
  areaContext,
  onClose,
}: Omit<VacanteFormModalProps, "open">) {
  const router = usePanelRouter();
  const [values, setValues] = useState(() => buildInitialValues(mode, vacante));
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [selectedExamenId, setSelectedExamenId] = useState("");
  const [examenError, setExamenError] = useState<string | undefined>();
  const [examenes, setExamenes] = useState<ExamenDiagnosticoResumenResponse[]>([]);
  const [isLoadingExamenes, setIsLoadingExamenes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const areaId = areaContext?.areaId ?? vacante?.areaId;

  useEffect(() => {
    if (!values.requiereExamen) {
      return;
    }

    let cancelled = false;

    async function loadExamenes() {
      setIsLoadingExamenes(true);
      const result = await listExamenesAction();
      if (cancelled) return;

      if (result.success) {
        setExamenes(result.data);
      } else {
        setExamenes([]);
      }

      setIsLoadingExamenes(false);
    }

    void loadExamenes();

    return () => {
      cancelled = true;
    };
  }, [values.requiereExamen]);

  const examenesActivos = useMemo(
    () => filterExamenesActivos(examenes, areaId),
    [areaId, examenes],
  );

  const examenesActivosTotales = useMemo(
    () => examenes.filter((examen) => isExamenActivo(examen.estatus)),
    [examenes],
  );

  const selectedModalidad = MODALIDAD_TRABAJO_OPTIONS.find(
    (option) => option.value === values.modalidadTrabajo,
  );
  const hasCustomModalidad =
    Boolean(values.modalidadTrabajo) &&
    !MODALIDAD_TRABAJO_OPTIONS.some((option) => option.value === values.modalidadTrabajo);

  const areaLabel =
    mode === "edit"
      ? vacante?.areaNombre?.trim() || (vacante?.areaId ? `Área #${vacante.areaId}` : "Sin área")
      : areaContext
        ? areaContext.areaNombre ?? `Área #${areaContext.areaId}`
        : null;

  const updateField = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValues((current) => {
      const next = { ...current, [field]: value };
      if (field === "requiereExamen" && !value) {
        setSelectedExamenId("");
        setExamenError(undefined);
      }
      return next;
    });
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nombre = values.nombre.trim();
    const descripcion = values.descripcion.trim();
    const modalidadId = values.modalidadId.trim();
    const modalidadTrabajo = values.modalidadTrabajo.trim();
    const cupoTotal = Number(values.cupoTotal);
    const errors: Partial<Record<keyof FormValues, string>> = {};

    if (!nombre) errors.nombre = "Escribe el nombre de la vacante.";
    if (!descripcion) errors.descripcion = "Escribe la descripción de la vacante.";
    if (!modalidadId) {
      errors.modalidadId = "Selecciona el tipo de vacante.";
    }
    if (!modalidadTrabajo) errors.modalidadTrabajo = "Selecciona la modalidad de trabajo.";
    const requiereSeleccionExamen =
      values.requiereExamen &&
      !(mode === "edit" && vacante?.requiereExamen && !selectedExamenId);

    if (!cupoTotal || cupoTotal < 1) errors.cupoTotal = "Indica un cupo válido (mínimo 1).";
    if (requiereSeleccionExamen && !selectedExamenId) {
      setExamenError("Selecciona el examen de ingreso.");
    } else {
      setExamenError(undefined);
    }

    if (Object.keys(errors).length > 0 || (requiereSeleccionExamen && !selectedExamenId)) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      nombre,
      descripcion,
      perfilRequerido: values.perfilRequerido.trim() || undefined,
      modalidadId,
      modalidadTrabajo,
      cupoTotal,
      requiereExamen: values.requiereExamen,
    };

    const result =
      mode === "create"
        ? await createVacanteAction(
            areaContext
              ? {
                  ...payload,
                  areaId: areaContext.areaId,
                }
              : payload,
          )
        : mode === "edit" && vacante
          ? await updateVacanteAction(vacante.idVacante, payload)
          : { success: false as const, error: "No se pudo completar la operación." };

    if (!result.success) {
      setIsSubmitting(false);
      notify.error(result.error);
      if ("fieldErrors" in result && result.fieldErrors) {
        setFieldErrors(mapActionFieldErrors(result.fieldErrors));
      }
      return;
    }

    if (values.requiereExamen && selectedExamenId) {
      const vacanteId =
        mode === "create"
          ? result.data.idVacante
          : mode === "edit" && vacante
            ? vacante.idVacante
            : null;

      if (vacanteId) {
        if (mode === "edit" && vacante?.requiereExamen) {
          const quitarResult = await quitarExamenVacanteAction(vacanteId);
          if (!quitarResult.success) {
            setIsSubmitting(false);
            notify.warning(
              "Los datos se guardaron, pero no se pudo actualizar el examen vinculado.",
              { description: quitarResult.error },
            );
            router.refresh();
            onClose();
            return;
          }
        }

        const assocResult = await asociarExamenVacanteAction(
          vacanteId,
          Number(selectedExamenId),
        );

        if (!assocResult.success) {
          setIsSubmitting(false);
          notify.warning(
            mode === "create"
              ? "La vacante se registró, pero no se pudo vincular el examen. Ábrela en detalle para asociarlo."
              : "Los datos se guardaron, pero no se pudo vincular el examen. Inténtalo desde el detalle.",
            { description: assocResult.error },
          );
          router.refresh();
          onClose();
          return;
        }

        const examenSeleccionado = examenesActivos.find(
          (examen) => examen.idExamen === Number(selectedExamenId),
        );
        if (examenSeleccionado) {
          saveVacanteExamenCache(vacanteId, {
            idExamen: examenSeleccionado.idExamen,
            titulo: examenSeleccionado.titulo,
          });
        }
      }
    }

    setIsSubmitting(false);
    router.refresh();
    onClose();
  };

  return (
    <Modal
      open
      title={mode === "create" ? "Nueva vacante" : "Editar vacante"}
      onClose={onClose}
      size="lg"
      footer={
        <div className={styles.modalFooter}>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="titular-vacante-form"
            variant={mode === "create" ? "primary" : "success"}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Guardando…"
              : mode === "create"
                ? "Registrar vacante"
                : "Guardar cambios"}
          </Button>
        </div>
      }
    >
      <form id="titular-vacante-form" className={styles.formBody} onSubmit={handleSubmit}>

        {areaLabel ? (
          <VacanteContextBanner
            areaLabel={areaLabel}
            hint={
              mode === "create" && !areaContext
                ? "Tu área se vinculará al registrar la vacante."
                : undefined
            }
          />
        ) : null}

        <section className={styles.formPanel} aria-label="Información de la vacante">
          <h3 className={styles.formPanelTitle}>Información general</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGridFull}>
              <TextInput
                id="vacante-nombre"
                label="Nombre de la vacante"
                value={values.nombre}
                required
                error={fieldErrors.nombre}
                onChange={(event) => updateField("nombre", event.target.value)}
              />
            </div>

            <div className={styles.formGridFull}>
              <FormField
                id="vacante-descripcion"
                label="Descripción"
                required
                error={fieldErrors.descripcion}
              >
                <textarea
                  id="vacante-descripcion"
                  className={formStyles.textarea}
                  rows={3}
                  value={values.descripcion}
                  onChange={(event) => updateField("descripcion", event.target.value)}
                  aria-invalid={Boolean(fieldErrors.descripcion)}
                />
              </FormField>
            </div>

            <div className={styles.formGridFull}>
              <TextInput
                id="vacante-perfil"
                label="Perfil requerido"
                hint="Carreras, habilidades o experiencia esperada."
                value={values.perfilRequerido}
                error={fieldErrors.perfilRequerido}
                onChange={(event) => updateField("perfilRequerido", event.target.value)}
              />
            </div>
          </div>
        </section>

        <section className={styles.formPanel} aria-label="Condiciones de la vacante">
          <h3 className={styles.formPanelTitle}>Condiciones</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGridFull}>
              <SelectInput
                id="vacante-tipo"
                label="Tipo de vacante"
                required
                placeholder="Selecciona el tipo"
                hint="Servicio social, prácticas profesionales o residencias profesionales."
                value={values.modalidadId}
                error={fieldErrors.modalidadId}
                onChange={(event) => updateField("modalidadId", event.target.value)}
              >
                {MODALIDAD_CATALOGO_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </div>

            <div className={styles.formGridFull}>
              <SelectInput
                id="vacante-modalidad-trabajo"
                label="Modalidad de trabajo"
                required
                placeholder="Selecciona una modalidad"
                value={values.modalidadTrabajo}
                error={fieldErrors.modalidadTrabajo}
                hint={selectedModalidad?.hint}
                onChange={(event) => updateField("modalidadTrabajo", event.target.value)}
              >
                {hasCustomModalidad ? (
                  <option value={values.modalidadTrabajo}>{values.modalidadTrabajo}</option>
                ) : null}
                {MODALIDAD_TRABAJO_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </div>
          </div>

          <div className={styles.conditionsGrid}>
            <TextInput
              id="vacante-cupo"
              label="Cupo total"
              type="number"
              min={1}
              required
              value={values.cupoTotal}
              error={fieldErrors.cupoTotal}
              onChange={(event) => updateField("cupoTotal", event.target.value)}
            />

            <div className={styles.examenField}>
              <p className={styles.examenLabel}>Proceso de ingreso</p>
              <CheckboxField
                id="vacante-requiere-examen"
                label="Requiere examen de ingreso"
                checked={values.requiereExamen}
                onChange={(checked) => updateField("requiereExamen", checked)}
              />
            </div>
          </div>

          {values.requiereExamen ? (
            <div className={styles.examenPanel}>
              <p className={styles.examenPanelTitle}>Examen de ingreso</p>
              <p className={styles.examenPanelHint}>
                Selecciona el examen diagnóstico que deberán contestar los postulantes.
              </p>

              {isLoadingExamenes ? (
                <p className={styles.examenLoading} role="status">
                  Cargando exámenes activos de tu área…
                </p>
              ) : examenesActivos.length > 0 ? (
                <SelectInput
                  id="vacante-examen-id"
                  label="Examen relacionado"
                  required
                  placeholder="Selecciona un examen"
                  hint="Solo se listan exámenes activos de tu área."
                  value={selectedExamenId}
                  error={examenError}
                  disabled={isSubmitting}
                  onChange={(event) => {
                    setSelectedExamenId(event.target.value);
                    setExamenError(undefined);
                  }}
                >
                  {examenesActivos.map((examen) => (
                    <option key={examen.idExamen} value={examen.idExamen}>
                      {examen.titulo}
                    </option>
                  ))}
                </SelectInput>
              ) : examenesActivosTotales.length > 0 ? (
                <Alert tone="warning" title="Sin exámenes en tu área">
                  Tienes exámenes activos, pero ninguno corresponde al área asignada de esta
                  vacante. Verifica el área del examen o créalo en la sección <strong>Exámenes</strong>.
                </Alert>
              ) : (
                <Alert tone="info" title="Sin exámenes disponibles">
                  No tienes exámenes activos. Créalos y actívalos en la sección{" "}
                  <strong>Exámenes</strong> antes de vincularlos aquí.
                </Alert>
              )}
            </div>
          ) : null}
        </section>
      </form>
    </Modal>
  );
}

export function TitularVacanteFormModal({
  open,
  mode,
  vacante,
  areaContext,
  onClose,
}: VacanteFormModalProps) {
  if (!open) {
    return null;
  }

  return (
    <VacanteFormModalContent
      key={mode === "edit" ? `edit-${vacante?.idVacante}` : "create"}
      mode={mode}
      vacante={vacante}
      areaContext={areaContext}
      onClose={onClose}
    />
  );
}
