"use client";

import { useState, type FormEvent } from "react";
import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { mapActionFieldErrors } from "@/lib/actions/form-errors";
import {
  createExamenAction,
  updateExamenAction,
} from "../../actions/examenes.actions";
import type {
  ExamenDiagnosticoDetalleResponse,
  ExamenDiagnosticoResumenResponse,
  TitularAreaAsignacionResponse,
} from "../../types/titular.types";
import { notify } from "@/shared/notifications";
import { Button } from "@/shared/components/Button";
import { FormField, SelectInput, TextInput } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { Modal } from "@/shared/components/Modal";
import styles from "./TitularExamen.module.css";

type FormValues = {
  areaId: string;
  titulo: string;
  descripcion: string;
  instrucciones: string;
  puntajeMinimoAprobatorio: string;
  tiempoLimiteMinutos: string;
};

type ExamenFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  examen?: ExamenDiagnosticoDetalleResponse | ExamenDiagnosticoResumenResponse | null;
  areas: TitularAreaAsignacionResponse[];
  onClose: () => void;
  onCreated?: (examen: ExamenDiagnosticoDetalleResponse) => void;
  onUpdated?: (examen: ExamenDiagnosticoDetalleResponse) => void;
};

function buildInitialValues(
  mode: ExamenFormModalProps["mode"],
  areas: TitularAreaAsignacionResponse[],
  examen?: ExamenDiagnosticoDetalleResponse | ExamenDiagnosticoResumenResponse | null,
): FormValues {
  if (mode === "edit" && examen) {
    const detalle = examen as ExamenDiagnosticoDetalleResponse;
    return {
      areaId: String(examen.areaId ?? ""),
      titulo: examen.titulo ?? "",
      descripcion: detalle.descripcion ?? "",
      instrucciones: detalle.instrucciones ?? "",
      puntajeMinimoAprobatorio:
        examen.puntajeMinimoAprobatorio !== undefined &&
        examen.puntajeMinimoAprobatorio !== null
          ? String(examen.puntajeMinimoAprobatorio)
          : "",
      tiempoLimiteMinutos: examen.tiempoLimiteMinutos
        ? String(examen.tiempoLimiteMinutos)
        : "",
    };
  }

  return {
    areaId: areas.length === 1 ? String(areas[0]?.idArea ?? "") : "",
    titulo: "",
    descripcion: "",
    instrucciones: "",
    puntajeMinimoAprobatorio: "70",
    tiempoLimiteMinutos: "30",
  };
}

function ExamenFormModalContent({
  mode,
  examen,
  areas,
  onClose,
  onCreated,
  onUpdated,
}: Omit<ExamenFormModalProps, "open">) {
  const router = usePanelRouter();
  const [values, setValues] = useState(() =>
    buildInitialValues(mode, areas, examen),
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof FormValues, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showAreaSelector = mode === "create" && areas.length > 1;
  const singleArea = mode === "create" && areas.length === 1 ? areas[0] : null;

  const updateField = <K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const titulo = values.titulo.trim();
    const errors: Partial<Record<keyof FormValues, string>> = {};

    if (!titulo) errors.titulo = "Escribe el título del examen.";
    if (showAreaSelector && !values.areaId) {
      errors.areaId = "Selecciona el área del examen.";
    }

    const puntaje = values.puntajeMinimoAprobatorio.trim()
      ? Number(values.puntajeMinimoAprobatorio)
      : undefined;
    if (
      puntaje !== undefined &&
      (Number.isNaN(puntaje) || puntaje < 0 || puntaje > 100)
    ) {
      errors.puntajeMinimoAprobatorio = "Indica un porcentaje entre 0 y 100.";
    }

    const tiempo = values.tiempoLimiteMinutos.trim()
      ? Number(values.tiempoLimiteMinutos)
      : undefined;
    if (tiempo !== undefined && (Number.isNaN(tiempo) || tiempo < 1)) {
      errors.tiempoLimiteMinutos = "Indica minutos válidos (mínimo 1).";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      titulo,
      descripcion: values.descripcion.trim() || undefined,
      instrucciones: values.instrucciones.trim() || undefined,
      puntajeMinimoAprobatorio: puntaje,
      tiempoLimiteMinutos: tiempo,
    };

    const result =
      mode === "create"
        ? await createExamenAction({
            ...payload,
            areaId: values.areaId ? Number(values.areaId) : undefined,
          })
        : mode === "edit" && examen
          ? await updateExamenAction(examen.idExamen, payload)
          : { success: false as const, error: "No se pudo completar la operación." };

    setIsSubmitting(false);

    if (!result.success) {
      notify.error(result.error);
      if ("fieldErrors" in result && result.fieldErrors) {
        setFieldErrors(mapActionFieldErrors(result.fieldErrors));
      }
      return;
    }

    router.refresh();

    if (mode === "create") {
      notify.success("Examen creado. Agrega preguntas para poder activarlo.");
      onCreated?.(result.data);
    } else {
      notify.success("Examen actualizado.");
      onUpdated?.(result.data);
    }

    onClose();
  };

  return (
    <Modal
      open
      title={mode === "create" ? "Nuevo examen" : "Editar examen"}
      onClose={onClose}
      size="lg"
      footer={
        <div className={styles.modalFooter}>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="titular-examen-form"
            variant={mode === "create" ? "primary" : "success"}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Guardando…"
              : mode === "create"
                ? "Crear examen"
                : "Guardar cambios"}
          </Button>
        </div>
      }
    >
      <form
        id="titular-examen-form"
        className={styles.formBody}
        onSubmit={handleSubmit}
      >
        {singleArea ? (
          <p className={styles.areaHint}>
            Área: <strong>{singleArea.areaNombre ?? singleArea.nombre ?? `#${singleArea.idArea}`}</strong>
          </p>
        ) : null}

        {showAreaSelector ? (
          <SelectInput
            id="examen-area"
            label="Área"
            required
            placeholder="Selecciona un área"
            value={values.areaId}
            error={fieldErrors.areaId}
            onChange={(event) => updateField("areaId", event.target.value)}
          >
            {areas.map((area) => (
              <option key={area.idArea} value={area.idArea}>
                {area.areaNombre ?? area.nombre ?? `Área #${area.idArea}`}
              </option>
            ))}
          </SelectInput>
        ) : null}

        <TextInput
          id="examen-titulo"
          label="Título"
          required
          value={values.titulo}
          error={fieldErrors.titulo}
          onChange={(event) => updateField("titulo", event.target.value)}
        />

        <FormField
          id="examen-descripcion"
          label="Descripción"
          error={fieldErrors.descripcion}
        >
          <textarea
            id="examen-descripcion"
            className={formStyles.textarea}
            rows={2}
            value={values.descripcion}
            onChange={(event) => updateField("descripcion", event.target.value)}
          />
        </FormField>

        <FormField
          id="examen-instrucciones"
          label="Instrucciones"
          error={fieldErrors.instrucciones}
        >
          <textarea
            id="examen-instrucciones"
            className={formStyles.textarea}
            rows={2}
            value={values.instrucciones}
            onChange={(event) => updateField("instrucciones", event.target.value)}
          />
        </FormField>

        <div className={styles.formGridTwo}>
          <TextInput
            id="examen-puntaje"
            label="Puntaje mínimo aprobatorio (%)"
            type="number"
            min={0}
            max={100}
            value={values.puntajeMinimoAprobatorio}
            error={fieldErrors.puntajeMinimoAprobatorio}
            onChange={(event) =>
              updateField("puntajeMinimoAprobatorio", event.target.value)
            }
          />
          <TextInput
            id="examen-tiempo"
            label="Tiempo límite (minutos)"
            type="number"
            min={1}
            value={values.tiempoLimiteMinutos}
            error={fieldErrors.tiempoLimiteMinutos}
            onChange={(event) =>
              updateField("tiempoLimiteMinutos", event.target.value)
            }
          />
        </div>
      </form>
    </Modal>
  );
}

export function TitularExamenFormModal({
  open,
  mode,
  examen,
  areas,
  onClose,
  onCreated,
  onUpdated,
}: ExamenFormModalProps) {
  if (!open) {
    return null;
  }

  return (
    <ExamenFormModalContent
      key={mode === "edit" ? `edit-${examen?.idExamen}` : "create"}
      mode={mode}
      examen={examen}
      areas={areas}
      onClose={onClose}
      onCreated={onCreated}
      onUpdated={onUpdated}
    />
  );
}
