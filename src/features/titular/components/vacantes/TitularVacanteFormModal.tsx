"use client";

import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { Building2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { TitularAreaContext } from "../../lib/area-context";
import { MODALIDAD_TRABAJO_OPTIONS } from "../../constants/vacante-form";
import { createVacanteAction, updateVacanteAction } from "../../actions/vacantes.actions";
import { mapActionFieldErrors } from "@/lib/actions/form-errors";
import type { VacanteDetalleResponse, VacanteResponse } from "../../types/titular.types";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { CheckboxField, FormField, SelectInput, TextInput } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { Modal } from "@/shared/components/Modal";
import panelFormStyles from "@/shared/styles/PanelFormModal.module.css";
import styles from "./TitularVacanteFormModal.module.css";

type FormValues = {
  nombre: string;
  descripcion: string;
  perfilRequerido: string;
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
      modalidadTrabajo: detalle.modalidadTrabajo ?? "PRESENCIAL",
      cupoTotal: String(vacante.cupoTotal ?? ""),
      requiereExamen: detalle.requiereExamen ?? false,
    };
  }

  return EMPTY_VALUES;
}

function VacanteContextBanner({
  areaContext,
}: {
  areaContext: TitularAreaContext | null;
}) {
  if (areaContext) {
    return (
      <div className={styles.contextBanner} role="status">
        <Building2 className={styles.contextIcon} size={16} strokeWidth={1.75} aria-hidden="true" />
        <div className={styles.contextCopy}>
          <p className={styles.contextEyebrow}>Área asignada</p>
          <p className={styles.contextTitle}>
            {areaContext.areaNombre ?? `Área #${areaContext.areaId}`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.contextBanner} role="status">
      <Building2 className={styles.contextIcon} size={16} strokeWidth={1.75} aria-hidden="true" />
      <div className={styles.contextCopy}>
        <p className={styles.contextEyebrow}>Primera vacante</p>
        <p className={styles.contextTitle}>Tu área se vinculará al registrar la vacante</p>
        <p className={styles.contextHint}>
          Si ya fuiste asignado como titular, completa el formulario y envía el registro.
        </p>
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
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedModalidad = MODALIDAD_TRABAJO_OPTIONS.find(
    (option) => option.value === values.modalidadTrabajo,
  );
  const hasCustomModalidad =
    Boolean(values.modalidadTrabajo) &&
    !MODALIDAD_TRABAJO_OPTIONS.some((option) => option.value === values.modalidadTrabajo);

  const updateField = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nombre = values.nombre.trim();
    const descripcion = values.descripcion.trim();
    const modalidadTrabajo = values.modalidadTrabajo.trim();
    const cupoTotal = Number(values.cupoTotal);
    const errors: Partial<Record<keyof FormValues, string>> = {};

    if (!nombre) errors.nombre = "Escribe el nombre de la vacante.";
    if (!descripcion) errors.descripcion = "Escribe la descripción de la vacante.";
    if (!modalidadTrabajo) errors.modalidadTrabajo = "Selecciona la modalidad de trabajo.";
    if (!cupoTotal || cupoTotal < 1) errors.cupoTotal = "Indica un cupo válido (mínimo 1).";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const payload = {
      nombre,
      descripcion,
      perfilRequerido: values.perfilRequerido.trim() || undefined,
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
                  modalidadId: areaContext.modalidadId,
                }
              : payload,
          )
        : mode === "edit" && vacante
          ? await updateVacanteAction(vacante.idVacante, payload)
          : { success: false as const, error: "No se pudo completar la operación." };

    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.error);
      if ("fieldErrors" in result && result.fieldErrors) {
        setFieldErrors(mapActionFieldErrors(result.fieldErrors));
      }
      return;
    }

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
        <div className={panelFormStyles.modalFooter}>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form="titular-vacante-form" variant="action" disabled={isSubmitting}>
            {isSubmitting
              ? "Guardando…"
              : mode === "create"
                ? "Registrar vacante"
                : "Guardar cambios"}
          </Button>
        </div>
      }
    >
      <form id="titular-vacante-form" className={panelFormStyles.formLayout} onSubmit={handleSubmit}>
        {formError ? <Alert tone="error">{formError}</Alert> : null}

        {mode === "create" ? <VacanteContextBanner areaContext={areaContext} /> : null}

        <section className={panelFormStyles.formSection} aria-label="Información de la vacante">
          <p className={panelFormStyles.formSectionTitle}>Información general</p>
          <div className={panelFormStyles.formGrid}>
            <div className={panelFormStyles.formGridFull}>
              <TextInput
                id="vacante-nombre"
                label="Nombre de la vacante"
                value={values.nombre}
                required
                error={fieldErrors.nombre}
                onChange={(event) => updateField("nombre", event.target.value)}
              />
            </div>

            <div className={panelFormStyles.formGridFull}>
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

            <div className={panelFormStyles.formGridFull}>
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

        <section className={panelFormStyles.formSection} aria-label="Condiciones de la vacante">
          <p className={panelFormStyles.formSectionTitle}>Condiciones</p>
          <div className={panelFormStyles.formGrid}>
            <div className={panelFormStyles.formGridFull}>
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

            <FormField id="vacante-examen-group" label="Proceso de ingreso">
              <div className={formStyles.optionPanel}>
                <div className={formStyles.optionFull}>
                  <CheckboxField
                    id="vacante-requiere-examen"
                    variant="tile"
                    label="Requiere examen de ingreso"
                    checked={values.requiereExamen}
                    onChange={(checked) => updateField("requiereExamen", checked)}
                  />
                </div>
              </div>
            </FormField>
          </div>
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
