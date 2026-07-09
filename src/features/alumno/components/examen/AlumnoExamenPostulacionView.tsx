"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileQuestion,
  Lock,
  ShieldCheck,
  TimerReset,
  XCircle,
} from "lucide-react";
import {
  finalizarExamenPostulacionAction,
  getExamenPostulacionAction,
  iniciarExamenPostulacionAction,
} from "../../actions/examen.actions";
import {
  formatPreguntaTipo,
  formatTiempoLimite,
  type AlumnoExamenDisponibleResponse,
  type AlumnoExamenPreguntaResponse,
  type FinalizarExamenResponse,
} from "@/lib/domain";
import { PANEL_PATHS } from "@/lib/auth/constants";
import { notify } from "@/shared/notifications";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import { PageHeader } from "@/shared/components/PageHeader";
import { LoadingState } from "@/shared/components/LoadingState";
import styles from "./AlumnoExamenPostulacionView.module.css";
import pageStyles from "@/shared/styles/PanelSectionView.module.css";

type AlumnoExamenPostulacionViewProps = {
  idPostulacion: number;
  postulacionLabel?: string;
};

type ExamPhase = "loading" | "intro" | "in-progress" | "result" | "error";

const MAX_SALIDAS = 3;

export function AlumnoExamenPostulacionView({
  idPostulacion,
  postulacionLabel,
}: AlumnoExamenPostulacionViewProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<ExamPhase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [examen, setExamen] = useState<AlumnoExamenDisponibleResponse | null>(
    null,
  );
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [resultado, setResultado] = useState<FinalizarExamenResponse | null>(
    null,
  );
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [salidas, setSalidas] = useState(0);
  const [showAbandonoWarning, setShowAbandonoWarning] = useState(false);

  const respuestasRef = useRef(respuestas);
  respuestasRef.current = respuestas;
  const submitLockRef = useRef(false);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const salidasRef = useRef(0);

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
        .filter(
          (pregunta) => respuestasActuales[pregunta.idPregunta] !== undefined,
        )
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

  const handleSubmit = () => {
    void submitExam();
  };

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

  // Contador regresivo + autoguardado al agotar el tiempo.
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

  // Aviso nativo al intentar cerrar o recargar durante la evaluacion.
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

  // Deteccion de salidas: cambiar de pestana/ventana durante la evaluacion.
  useEffect(() => {
    if (phase !== "in-progress") return;

    const handleHidden = () => {
      if (phaseRef.current !== "in-progress") return;
      if (submitLockRef.current) return;

      salidasRef.current += 1;
      const total = salidasRef.current;
      setSalidas(total);

      if (total >= MAX_SALIDAS) {
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

  const blockClipboard = (event: ClipboardEvent<HTMLElement>) => {
    event.preventDefault();
    notify.error("Durante la evaluación no está permitido copiar ni pegar.");
  };

  const formatRemaining = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const respondidas = preguntas.filter(
    (pregunta) => respuestas[pregunta.idPregunta] !== undefined,
  ).length;
  const isTimeWarning = remainingMs !== null && remainingMs <= 60_000;

  const renderPregunta = (
    pregunta: AlumnoExamenPreguntaResponse,
    index: number,
  ) => (
    <fieldset key={pregunta.idPregunta} className={styles.preguntaCard}>
      <legend className={styles.preguntaLegend}>
        {index + 1}. {pregunta.texto}
      </legend>
      {pregunta.tipo ? (
        <p className={styles.preguntaTipo}>{formatPreguntaTipo(pregunta.tipo)}</p>
      ) : null}
      <div className={styles.opcionesGroup}>
        {(pregunta.opciones ?? []).map((opcion) => (
          <label key={opcion.idOpcion} className={styles.opcionLabel}>
            <input
              type="radio"
              name={`pregunta-${pregunta.idPregunta}`}
              value={opcion.idOpcion}
              checked={respuestas[pregunta.idPregunta] === opcion.idOpcion}
              onChange={() => selectRespuesta(pregunta.idPregunta, opcion.idOpcion)}
            />
            <span>{opcion.texto}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );

  return (
    <section className={pageStyles.page} aria-labelledby="alumno-examen-title">
      <PageHeader
        titleId="alumno-examen-title"
        title="Examen diagnóstico"
        description={
          postulacionLabel
            ? `Postulación: ${postulacionLabel}`
            : "Responde todas las preguntas para continuar con tu proceso."
        }
        actions={
          phase === "in-progress" ? undefined : (
            <Button href={`${PANEL_PATHS.alumno}/postulaciones`} variant="outline">
              Volver a postulaciones
            </Button>
          )
        }
      />

      {phase === "loading" ? (
        <LoadingState label="Preparando tu examen…" />
      ) : null}

      {phase === "error" && error ? (
        <Alert tone="error" title="No pudimos cargar el examen">
          {error}
        </Alert>
      ) : null}

      {phase === "intro" && examen ? (
        <Modal
          open
          title="Antes de comenzar la evaluación"
          size="md"
          onClose={() => router.push(`${PANEL_PATHS.alumno}/postulaciones`)}
          footer={
            <div className={styles.introFooter}>
              <Button
                type="button"
                variant="outline"
                disabled={isStarting}
                onClick={() =>
                  router.push(`${PANEL_PATHS.alumno}/postulaciones`)
                }
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={isStarting}
                onClick={() => void handleStart()}
              >
                {isStarting ? "Iniciando…" : "Comenzar evaluación"}
              </Button>
            </div>
          }
        >
          <div className={styles.introHero}>
            <span className={styles.introHeroIcon}>
              <ShieldCheck size={24} aria-hidden="true" />
            </span>
            <div className={styles.introHeroText}>
              <h3 className={styles.introHeroTitle}>Evaluación con seguimiento</h3>
              <p className={styles.introHeroSubtitle}>
                Lee las condiciones antes de iniciar. Tu actividad se registra
                para garantizar una evaluación genuina.
              </p>
            </div>
          </div>

          <ul className={styles.introList}>
            <li className={styles.introItem}>
              <span className={styles.introItemIcon}>
                <ShieldCheck size={16} aria-hidden="true" />
              </span>
              <span>
                Esta es una <strong>evaluación oficial</strong> de tu proceso.
                Respóndela de forma individual y honesta.
              </span>
            </li>
            <li className={styles.introItem}>
              <span className={styles.introItemIcon}>
                <TimerReset size={16} aria-hidden="true" />
              </span>
              <span>
                Solo tienes <strong>un intento</strong>. Al comenzar inicia el
                cronómetro y no podrás reiniciarlo.
              </span>
            </li>
            <li className={styles.introItem}>
              <span className={styles.introItemIcon}>
                <Clock size={16} aria-hidden="true" />
              </span>
              <span>
                Si se agota el tiempo, tus respuestas se{" "}
                <strong>guardan automáticamente</strong> hasta donde llegaste.
              </span>
            </li>
            <li className={styles.introItem}>
              <span className={styles.introItemIcon}>
                <Lock size={16} aria-hidden="true" />
              </span>
              <span>
                Está deshabilitado copiar y pegar. Si cambias de pestaña o
                ventana quedará registrado; tras {MAX_SALIDAS} salidas la
                evaluación se enviará sola.
              </span>
            </li>
          </ul>

          <div className={styles.introMeta}>
            <span className={styles.introMetaChip}>
              Examen
              <strong>{examen.titulo}</strong>
            </span>
            <span className={styles.introMetaChip}>
              Preguntas
              <strong>{examen.preguntas?.length ?? 0}</strong>
            </span>
            <span className={styles.introMetaChip}>
              Tiempo límite
              <strong>{formatTiempoLimite(examen.tiempoLimiteMinutos)}</strong>
            </span>
          </div>

          {examen.instrucciones ? (
            <p className={styles.introWarning}>
              <strong>Instrucciones: </strong>
              {examen.instrucciones}
            </p>
          ) : null}
        </Modal>
      ) : null}

      {phase === "in-progress" && examen ? (
        <div className={styles.examLayout}>
          <div className={styles.examIntro}>
            <span className={styles.examIcon} aria-hidden="true">
              <FileQuestion size={22} strokeWidth={1.75} />
            </span>
            <div>
              <h2 className={styles.examTitle}>{examen.titulo}</h2>
              {examen.descripcion ? (
                <p className={styles.examDescription}>{examen.descripcion}</p>
              ) : null}
              {examen.instrucciones ? (
                <p className={styles.examInstructions}>
                  <strong>Instrucciones: </strong>
                  {examen.instrucciones}
                </p>
              ) : null}
              {examen.tiempoLimiteMinutos ? (
                <p className={styles.examMeta}>
                  Tiempo límite: {examen.tiempoLimiteMinutos} minutos
                </p>
              ) : null}
            </div>
          </div>

          {remainingMs !== null ? (
            <div className={styles.timerBar}>
              <div className={styles.timerInfo}>
                <span className={styles.timerLabel}>Tiempo restante</span>
                <span className={styles.timerProgress}>
                  {respondidas} de {preguntas.length} respondidas
                </span>
              </div>
              <span
                className={[
                  styles.timerClock,
                  isTimeWarning ? styles.timerClockWarning : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                role="timer"
                aria-live={isTimeWarning ? "assertive" : "off"}
              >
                <Clock size={16} aria-hidden="true" />
                {formatRemaining(remainingMs)}
              </span>
            </div>
          ) : null}

          <form
            className={styles.preguntasForm}
            onCopy={blockClipboard}
            onCut={blockClipboard}
            onPaste={blockClipboard}
            onContextMenu={(event) => event.preventDefault()}
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
          >
            {preguntas.map(renderPregunta)}

            <div className={styles.submitRow}>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Enviando respuestas…" : "Finalizar examen"}
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      {phase === "result" && resultado ? (
        <div className={styles.resultWrapper}>
          <div className={styles.resultCard}>
            <span
              className={[
                styles.resultIcon,
                resultado.aprobado
                  ? styles.resultIconSuccess
                  : styles.resultIconFail,
              ].join(" ")}
              aria-hidden="true"
            >
              {resultado.aprobado ? (
                <CheckCircle2 size={40} strokeWidth={1.75} />
              ) : (
                <XCircle size={40} strokeWidth={1.75} />
              )}
            </span>

            <div className={styles.resultHead}>
              <h2 className={styles.resultTitle}>
                {resultado.aprobado ? "¡Examen aprobado!" : "Examen finalizado"}
              </h2>
              <p className={styles.resultSubtitle}>
                {examen?.titulo ?? "Examen diagnóstico"}
              </p>
            </div>

            <dl className={styles.resultMetrics}>
              <div className={styles.resultMetric}>
                <dt>Puntaje</dt>
                <dd>
                  {resultado.puntajeObtenido ?? 0} /{" "}
                  {resultado.puntajeTotal ?? 0}
                </dd>
              </div>
              <div className={styles.resultMetric}>
                <dt>Porcentaje</dt>
                <dd>{resultado.porcentaje ?? 0}%</dd>
              </div>
              <div className={styles.resultMetric}>
                <dt>Resultado</dt>
                <dd
                  className={[
                    styles.resultBadge,
                    resultado.aprobado
                      ? styles.resultBadgeSuccess
                      : styles.resultBadgeFail,
                  ].join(" ")}
                >
                  {resultado.aprobado ? "Aprobado" : "No aprobado"}
                </dd>
              </div>
            </dl>

            <p className={styles.resultHint}>
              Tu postulación quedó en estatus <strong>Por evaluar</strong>. El
              titular revisará tu resultado y te notificará la decisión.
            </p>

            <Button
              type="button"
              variant="primary"
              onClick={() => router.push(`${PANEL_PATHS.alumno}/postulaciones`)}
            >
              Ir a mis postulaciones
            </Button>
          </div>
        </div>
      ) : null}

      {showAbandonoWarning && phase === "in-progress" ? (
        <div className={styles.abandonoOverlay} role="alertdialog" aria-modal="true">
          <div className={styles.abandonoCard}>
            <span className={styles.abandonoIcon}>
              <AlertTriangle size={28} aria-hidden="true" />
            </span>
            <h3 className={styles.abandonoTitle}>Saliste de la evaluación</h3>
            <p className={styles.abandonoText}>
              Detectamos que cambiaste de pestaña o ventana. Esto queda
              registrado. Llevas{" "}
              <span className={styles.abandonoCount}>
                {salidas} de {MAX_SALIDAS}
              </span>{" "}
              salidas permitidas. Si llegas al límite, la evaluación se enviará
              automáticamente.
            </p>
            <Button
              type="button"
              variant="primary"
              onClick={() => setShowAbandonoWarning(false)}
            >
              Continuar evaluación
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
