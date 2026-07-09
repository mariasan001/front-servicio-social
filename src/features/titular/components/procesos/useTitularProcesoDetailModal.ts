import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useState } from "react";
import {
  emitProcesoLiberacionTecnicaAction,
  getProcesoDetailAction,
  registerProcesoEvaluacionFinalAction,
  registerProcesoIncidenciaAction,
  type TitularProcesoDetailPayload,
} from "../../actions/procesos.actions";
import { notify } from "@/shared/notifications";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";

type NuevaIncidenciaState = {
  tipo: string;
  severidad: string;
  descripcion: string;
  fechaIncidencia: string;
};

type EvaluacionState = {
  estatus: string;
  calificacion: string;
  comentario: string;
};

const EMPTY_INCIDENCIA: NuevaIncidenciaState = {
  tipo: "",
  severidad: "",
  descripcion: "",
  fechaIncidencia: "",
};

const DEFAULT_EVALUACION: EvaluacionState = {
  estatus: "APROBADA",
  calificacion: "",
  comentario: "",
};

type UseTitularProcesoDetailModalOptions = {
  open: boolean;
  procesoId: number | null;
};

export function useTitularProcesoDetailModal({
  open,
  procesoId,
}: UseTitularProcesoDetailModalOptions) {
  const router = usePanelRouter();
  const [isMutating, setIsMutating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [liberacionComentario, setLiberacionComentario] = useState("");
  const [nuevaIncidencia, setNuevaIncidencia] = useState<NuevaIncidenciaState>(EMPTY_INCIDENCIA);
  const [evaluacion, setEvaluacion] = useState<EvaluacionState>(DEFAULT_EVALUACION);

  const { detail, error, isLoading, isReloading } = useDetailModalLoader(
    open,
    procesoId,
    getProcesoDetailAction,
    {
      reloadKey,
      onBeforeLoad: () => {
        setLiberacionComentario("");
        setNuevaIncidencia(EMPTY_INCIDENCIA);
        setEvaluacion(DEFAULT_EVALUACION);
      },
    },
  );

  const refresh = () => {
    router.refresh();
    setReloadKey((key) => key + 1);
  };

  const registrarIncidencia = async () => {
    const proceso = detail?.proceso;
    if (!proceso) return;

    if (
      !nuevaIncidencia.tipo.trim() ||
      !nuevaIncidencia.severidad.trim() ||
      !nuevaIncidencia.descripcion.trim() ||
      !nuevaIncidencia.fechaIncidencia
    ) {
      notify.error("Completa todos los campos de la incidencia.");
      return;
    }

    setIsMutating(true);
    const result = await registerProcesoIncidenciaAction(proceso.idProceso, {
      tipo: nuevaIncidencia.tipo.trim(),
      severidad: nuevaIncidencia.severidad.trim(),
      descripcion: nuevaIncidencia.descripcion.trim(),
      fechaIncidencia: nuevaIncidencia.fechaIncidencia,
    });
    setIsMutating(false);

    if (!result.success) {
      notify.error(result.error);
      return;
    }

    setNuevaIncidencia(EMPTY_INCIDENCIA);
    refresh();
  };

  const emitirLiberacion = async () => {
    const proceso = detail?.proceso;
    if (!proceso) return;

    setIsMutating(true);
    const liberacionPayload = liberacionComentario.trim()
      ? { comentario: liberacionComentario.trim() }
      : {};
    const result = await emitProcesoLiberacionTecnicaAction(proceso.idProceso, liberacionPayload);
    setIsMutating(false);

    if (!result.success) {
      notify.error(result.error);
      return;
    }

    refresh();
  };

  const registrarEvaluacion = async () => {
    const proceso = detail?.proceso;
    if (!proceso) return;

    const calificacion = Number(evaluacion.calificacion);
    if (!evaluacion.calificacion.trim() || Number.isNaN(calificacion)) {
      notify.error("Indica la calificación.");
      return;
    }

    setIsMutating(true);
    const evalPayload: {
      estatus: string;
      calificacion: number;
      comentario?: string;
    } = {
      estatus: evaluacion.estatus,
      calificacion,
    };
    if (evaluacion.comentario.trim()) {
      evalPayload.comentario = evaluacion.comentario.trim();
    }
    const result = await registerProcesoEvaluacionFinalAction(proceso.idProceso, evalPayload);
    setIsMutating(false);

    if (!result.success) {
      notify.error(result.error);
      return;
    }

    refresh();
  };

  return {
    detail: detail as TitularProcesoDetailPayload | null,
    error,
    isLoading,
    isReloading,
    isMutating,
    proceso: detail?.proceso,
    horasRegistradas: detail?.horas ?? [],
    incidenciasRegistradas: detail?.incidencias ?? [],
    liberacionComentario,
    setLiberacionComentario,
    nuevaIncidencia,
    setNuevaIncidencia,
    evaluacion,
    setEvaluacion,
    refresh,
    registrarIncidencia,
    emitirLiberacion,
    registrarEvaluacion,
  };
}
