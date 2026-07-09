import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  finalizarExamenPostulacionAction,
  getExamenPostulacionAction,
  iniciarExamenPostulacionAction,
} from "../../actions/examen.actions";
import type {
  AlumnoExamenDisponibleResponse,
  FinalizarExamenResponse,
} from "@/lib/domain";
import { notify } from "@/shared/notifications";
import { MAX_EXAMEN_SALIDAS, type ExamPhase } from "./alumno-examen.utils";

export function useAlumnoExamenPostulacion(idPostulacion: number) {
  const [phase, setPhase] = useState<ExamPhase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [examen, setExamen] = useState<AlumnoExamenDisponibleResponse | null>(null);
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [resultado, setResultado] = useState<FinalizarExamenResponse | null>(null);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [salidas, setSalidas] = useState(0);
  const [showAbandonoWarning, setShowAbandonoWarning] = useState(false);

  const respuestasRef = useRef(respuestas);
  const submitLockRef = useRef(false);
  const phaseRef = useRef(phase);
  const salidasRef = useRef(0);

  useEffect(() => {
    respuestasRef.current = respuestas;
    phaseRef.current = phase;
  });

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setPhase("loading");
      setError(null);

      const examenResult = await getExamenPostulacionAction(idPostulacion);
      if (cancelled) return;

      if (!examenResult.success) {
        setError(examenResult.error);
        setPhase("error");
        return;
      }

      setExamen(examenResult.data);
      setPhase("intro");
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [idPostulacion]);

  const preguntas = examen?.preguntas ?? [];

  const selectRespuesta = (idPregunta: number, idOpcion: number) => {
    setRespuestas((current) => ({ ...current, [idPregunta]: idOpcion }));
  };

  const submitExam = useCallback(
    async (options?: { auto?: boolean; motivo?: string }) => {
      const auto = options?.auto ?? false;
      if (submitLockRef.current) return;

      const preguntasActuales = examen?.preguntas ?? [];
      const respuestasActuales = respuestasRef.current;

      if (!auto) {
        const faltantes = preguntasActuales.filter(
          (pregunta) => respuestasActuales[pregunta.idPregunta] === undefined,
        );
        if (faltantes.length > 0) {
          notify.error("Responde todas las preguntas antes de finalizar.");
          return;
        }
      }

      submitLockRef.current = true;
      setIsSubmitting(true);

      const respuestasPayload = preguntasActuales
        .filter((pregunta) => respuestasActuales[pregunta.idPregunta] !== undefined)
        .map((pregunta) => ({
          idPregunta: pregunta.idPregunta,
          idOpcion: respuestasActuales[pregunta.idPregunta],
        }));

      const result = await finalizarExamenPostulacionAction(idPostulacion, {
        respuestas: respuestasPayload,
      });

      setIsSubmitting(false);

      if (!result.success) {
        submitLockRef.current = false;
        notify.error(result.error);
        return;
      }

      setResultado(result.data);
      setShowAbandonoWarning(false);
      setPhase("result");
      notify.success(
        options?.motivo
          ? options.motivo
          : auto
            ? "Se acabó el tiempo. Guardamos tus respuestas hasta donde llegaste."
            : "Examen enviado correctamente.",
      );
    },
    [examen, idPostulacion],
  );

  const handleStart = async () => {
    setIsStarting(true);
    const inicioResult = await iniciarExamenPostulacionAction(idPostulacion);
    setIsStarting(false);

    if (!inicioResult.success) {
      setError(inicioResult.error);
      setPhase("error");
      return;
    }

    const minutos = examen?.tiempoLimiteMinutos;
    if (minutos && minutos > 0) {
      const iniciadoAtRaw = inicioResult.data.iniciadoAt;
      const iniciadoMs = iniciadoAtRaw ? Date.parse(iniciadoAtRaw) : NaN;
      const startMs = Number.isNaN(iniciadoMs) ? Date.now() : iniciadoMs;
      setDeadline(startMs + minutos * 60_000);
    }

    setPhase("in-progress");
  };

  useEffect(() => {
    if (phase !== "in-progress" || deadline === null) {
      return;
    }

    const tick = () => {
      const restante = deadline - Date.now();
      setRemainingMs(restante > 0 ? restante : 0);
      if (restante <= 0) {
        void submitExam({ auto: true });
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [phase, deadline, submitExam]);

  useEffect(() => {
    if (phase !== "in-progress") return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "in-progress") return;

    const handleHidden = () => {
      if (phaseRef.current !== "in-progress") return;
      if (submitLockRef.current) return;

      salidasRef.current += 1;
      const total = salidasRef.current;
      setSalidas(total);

      if (total >= MAX_EXAMEN_SALIDAS) {
        void submitExam({
          auto: true,
          motivo:
            "Detectamos varias salidas de la evaluación. Se envió automáticamente con tus respuestas actuales.",
        });
      } else {
        setShowAbandonoWarning(true);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        handleHidden();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleHidden);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleHidden);
    };
  }, [phase, submitExam]);

  const respondidas = preguntas.filter(
    (pregunta) => respuestas[pregunta.idPregunta] !== undefined,
  ).length;

  return {
    phase,
    error,
    examen,
    preguntas,
    respuestas,
    isSubmitting,
    isStarting,
    resultado,
    remainingMs,
    salidas,
    showAbandonoWarning,
    respondidas,
    selectRespuesta,
    submitExam,
    handleStart,
    dismissAbandonoWarning: () => setShowAbandonoWarning(false),
  };
}
