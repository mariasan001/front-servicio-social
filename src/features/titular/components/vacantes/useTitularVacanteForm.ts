import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useEffect, useMemo, useState } from "react";
import type { TitularAreaContext } from "../../lib/area-context";
import {
  asociarExamenVacanteAction,
  listExamenesAction,
  quitarExamenVacanteAction,
} from "../../actions/examenes.actions";
import { createVacanteAction, updateVacanteAction } from "../../actions/vacantes.actions";
import { saveVacanteExamenCache } from "../../lib/vacante-examen-cache";
import { mapActionFieldErrors } from "@/lib/actions/form-errors";
import type {
  ExamenDiagnosticoResumenResponse,
  VacanteDetalleResponse,
  VacanteResponse,
} from "../../types/titular.types";
import { notify } from "@/shared/notifications";
import {
  buildVacanteFormInitialValues,
  filterExamenesActivos,
  filterExamenesActivosPorArea,
  type VacanteFormValues,
} from "./vacante-form.utils";

type UseTitularVacanteFormOptions = {
  mode: "create" | "edit";
  vacante?: VacanteResponse | VacanteDetalleResponse | null;
  areaContext: TitularAreaContext | null;
  onClose: () => void;
};

export function useTitularVacanteForm({
  mode,
  vacante,
  areaContext,
  onClose,
}: UseTitularVacanteFormOptions) {
  const router = usePanelRouter();
  const [values, setValues] = useState(() => buildVacanteFormInitialValues(mode, vacante));
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof VacanteFormValues, string>>>(
    {},
  );
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
    () => filterExamenesActivosPorArea(examenes, areaId),
    [areaId, examenes],
  );

  const examenesActivosTotales = useMemo(() => filterExamenesActivos(examenes), [examenes]);

  const areaLabel =
    mode === "edit"
      ? vacante?.areaNombre?.trim() || (vacante?.areaId ? `Área #${vacante.areaId}` : "Sin área")
      : areaContext
        ? areaContext.areaNombre ?? `Área #${areaContext.areaId}`
        : null;

  const updateField = <K extends keyof VacanteFormValues>(field: K, value: VacanteFormValues[K]) => {
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

  const handleSubmit = async () => {
    const nombre = values.nombre.trim();
    const descripcion = values.descripcion.trim();
    const modalidadId = values.modalidadId.trim();
    const modalidadTrabajo = values.modalidadTrabajo.trim();
    const cupoTotal = Number(values.cupoTotal);
    const errors: Partial<Record<keyof VacanteFormValues, string>> = {};

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
            areaContext ? { ...payload, areaId: areaContext.areaId } : payload,
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

        const assocResult = await asociarExamenVacanteAction(vacanteId, Number(selectedExamenId));

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

  return {
    values,
    fieldErrors,
    selectedExamenId,
    examenError,
    examenesActivos,
    examenesActivosTotales,
    isLoadingExamenes,
    isSubmitting,
    areaLabel,
    updateField,
    setSelectedExamenId,
    setExamenError,
    handleSubmit,
  };
}
