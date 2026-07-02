"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { TitularAreaContext } from "../../lib/area-context";
import { createVacanteAction, updateVacanteAction } from "../../actions/vacantes.actions";
import { mapActionFieldErrors } from "@/lib/actions/form-errors";
import type { VacanteDetalleResponse, VacanteResponse } from "../../types/titular.types";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { CheckboxField, TextInput } from "@/shared/components/Form";
import inputStyles from "@/shared/components/Form/Form.module.css";
import { Modal } from "@/shared/components/Modal";
import formStyles from "@/shared/styles/PanelFormModal.module.css";
import detailStyles from "@/shared/styles/PanelDetailView.module.css";

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

  return {
    nombre: "",
    descripcion: "",
    perfilRequerido: "",
    modalidadTrabajo: "PRESENCIAL",
    cupoTotal: "1",
    requiereExamen: false,
  };
}

function VacanteFormModalContent({
  mode,
  vacante,
  areaContext,
  onClose,
}: Omit<VacanteFormModalProps, "open">) {
  const router = useRouter();
  const [values, setValues] = useState(() => buildInitialValues(mode, vacante));
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!areaContext && mode === "create") {
      setFormError("No se pudo determinar el área para la vacante.");
      return;
    }

    const nombre = values.nombre.trim();
    const descripcion = values.descripcion.trim();
    const modalidadTrabajo = values.modalidadTrabajo.trim();
    const cupoTotal = Number(values.cupoTotal);
    const errors: Partial<Record<keyof FormValues, string>> = {};

    if (!nombre) errors.nombre = "Escribe el nombre de la vacante.";
    if (!descripcion) errors.descripcion = "Escribe la descripción de la vacante.";
    if (!modalidadTrabajo) errors.modalidadTrabajo = "Indica la modalidad de trabajo.";
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
      mode === "create" && areaContext
        ? await createVacanteAction({
            ...payload,
            areaId: areaContext.areaId,
            modalidadId: areaContext.modalidadId,
          })
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
    <form className={formStyles.formLayout} onSubmit={(event) => void handleSubmit(event)}>
      {formError ? <Alert tone="error">{formError}</Alert> : null}
      {mode === "create" && !areaContext ? (
        <Alert tone="info">
          No se detectó el área asignada a tu cuenta. Si el alta falla, contacta a
          administración para verificar tu perfil de titular.
        </Alert>
      ) : null}
      {areaContext ? (
        <p className={detailStyles.detailLead}>
          Área: <strong>{areaContext.areaNombre ?? `#${areaContext.areaId}`}</strong>
        </p>
      ) : null}

      <section className={formStyles.formSection} aria-label="Datos de la vacante">
        <p className={formStyles.formSectionTitle}>Información de la vacante</p>
        <div className={formStyles.formGrid}>
        <TextInput
          id="vacante-nombre"
          label="Nombre de la vacante"
          value={values.nombre}
          error={fieldErrors.nombre}
          className={formStyles.formGridFull}
          onChange={(event) => updateField("nombre", event.target.value)}
        />
        <div className={formStyles.formGridFull}>
          <label className={inputStyles.label} htmlFor="vacante-descripcion">
            Descripción
          </label>
          <textarea
            id="vacante-descripcion"
            className={inputStyles.textarea}
            rows={3}
            value={values.descripcion}
            onChange={(event) => updateField("descripcion", event.target.value)}
            aria-invalid={Boolean(fieldErrors.descripcion)}
          />
          {fieldErrors.descripcion ? (
            <p className={inputStyles.error}>{fieldErrors.descripcion}</p>
          ) : null}
        </div>
        <TextInput
          id="vacante-perfil"
          label="Perfil requerido"
          value={values.perfilRequerido}
          onChange={(event) => updateField("perfilRequerido", event.target.value)}
        />
        <TextInput
          id="vacante-modalidad-trabajo"
          label="Modalidad de trabajo"
          value={values.modalidadTrabajo}
          error={fieldErrors.modalidadTrabajo}
          onChange={(event) => updateField("modalidadTrabajo", event.target.value)}
        />
        <TextInput
          id="vacante-cupo"
          label="Cupo total"
          type="number"
          min={1}
          value={values.cupoTotal}
          error={fieldErrors.cupoTotal}
          onChange={(event) => updateField("cupoTotal", event.target.value)}
        />
        <CheckboxField
          id="vacante-examen"
          label="Requiere examen de ingreso"
          checked={values.requiereExamen}
          onChange={(checked) => updateField("requiereExamen", checked)}
        />
        </div>
      </section>

      <div className={formStyles.formActions}>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {mode === "create" ? "Registrar vacante" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}

export function TitularVacanteFormModal({
  open,
  mode,
  vacante,
  areaContext,
  onClose,
}: VacanteFormModalProps) {
  return (
    <Modal
      open={open}
      title={mode === "create" ? "Nueva vacante" : "Editar vacante"}
      onClose={onClose}
      size="lg"
    >
      <VacanteFormModalContent
        key={`${mode}-${vacante?.idVacante ?? "new"}-${open ? "open" : "closed"}`}
        mode={mode}
        vacante={vacante}
        areaContext={areaContext}
        onClose={onClose}
      />
    </Modal>
  );
}
