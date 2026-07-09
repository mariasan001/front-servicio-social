"use client";

import { useRouter } from "next/navigation";
import { PANEL_PATHS } from "@/lib/auth/constants";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { PageHeader } from "@/shared/components/PageHeader";
import { LoadingState } from "@/shared/components/LoadingState";
import pageStyles from "@/shared/styles/PanelSectionView.module.css";
import { AlumnoExamenAbandonoWarning } from "./AlumnoExamenAbandonoWarning";
import { AlumnoExamenInProgressPanel } from "./AlumnoExamenInProgressPanel";
import { AlumnoExamenIntroModal } from "./AlumnoExamenIntroModal";
import { AlumnoExamenResultPanel } from "./AlumnoExamenResultPanel";
import { useAlumnoExamenPostulacion } from "./useAlumnoExamenPostulacion";

type AlumnoExamenPostulacionViewProps = {
  idPostulacion: number;
  postulacionLabel?: string;
};

export function AlumnoExamenPostulacionView({
  idPostulacion,
  postulacionLabel,
}: AlumnoExamenPostulacionViewProps) {
  const router = useRouter();
  const exam = useAlumnoExamenPostulacion(idPostulacion);
  const postulacionesPath = `${PANEL_PATHS.alumno}/postulaciones`;

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
          exam.phase === "in-progress" ? undefined : (
            <Button href={postulacionesPath} variant="outline">
              Volver a postulaciones
            </Button>
          )
        }
      />

      {exam.phase === "loading" ? <LoadingState label="Preparando tu examen…" /> : null}

      {exam.phase === "error" && exam.error ? (
        <Alert tone="error" title="No pudimos cargar el examen">
          {exam.error}
        </Alert>
      ) : null}

      {exam.phase === "intro" && exam.examen ? (
        <AlumnoExamenIntroModal
          examen={exam.examen}
          isStarting={exam.isStarting}
          onCancel={() => router.push(postulacionesPath)}
          onStart={() => void exam.handleStart()}
        />
      ) : null}

      {exam.phase === "in-progress" && exam.examen ? (
        <AlumnoExamenInProgressPanel
          examen={exam.examen}
          preguntas={exam.preguntas}
          respuestas={exam.respuestas}
          remainingMs={exam.remainingMs}
          respondidas={exam.respondidas}
          isSubmitting={exam.isSubmitting}
          onSelectRespuesta={exam.selectRespuesta}
          onSubmit={() => void exam.submitExam()}
        />
      ) : null}

      {exam.phase === "result" && exam.resultado ? (
        <AlumnoExamenResultPanel
          resultado={exam.resultado}
          examenTitulo={exam.examen?.titulo}
          onGoToPostulaciones={() => router.push(postulacionesPath)}
        />
      ) : null}

      {exam.showAbandonoWarning && exam.phase === "in-progress" ? (
        <AlumnoExamenAbandonoWarning
          salidas={exam.salidas}
          onContinue={exam.dismissAbandonoWarning}
        />
      ) : null}
    </section>
  );
}
