"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { getResultadoExamenAction } from "../../actions/examenes.actions";
import type { ResultadoExamenResponse } from "../../types/titular.types";
import { formatEtiqueta, formatFecha } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import detailStyles from "@/shared/styles/DetailModal.module.css";
import styles from "./TitularPostulacionExamenResultado.module.css";

type TitularPostulacionExamenResultadoProps = {
  idPostulacion: number;
  enabled: boolean;
};

export function TitularPostulacionExamenResultado({
  idPostulacion,
  enabled,
}: TitularPostulacionExamenResultadoProps) {
  const [resultado, setResultado] = useState<ResultadoExamenResponse | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setResultado(null);
      setError(null);
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      const response = await getResultadoExamenAction(idPostulacion);

      if (cancelled) return;

      if (!response.success) {
        setError(response.error);
        setResultado(null);
      } else {
        setResultado(response.data);
      }

      setIsLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [enabled, idPostulacion]);

  const respuestas = resultado?.respuestas ?? [];

  const { correctas, incorrectas } = useMemo(() => {
    let correctasCount = 0;
    let incorrectasCount = 0;

    for (const respuesta of respuestas) {
      if (respuesta.correcta) {
        correctasCount += 1;
      } else {
        incorrectasCount += 1;
      }
    }

    return { correctas: correctasCount, incorrectas: incorrectasCount };
  }, [respuestas]);

  if (!enabled) {
    return null;
  }

  if (isLoading) {
    return (
      <section className={detailStyles.contentPanel}>
        <p className={detailStyles.panelDescription}>Cargando resultado del examen…</p>
      </section>
    );
  }

  if (error) {
    return <Alert tone="info">{error}</Alert>;
  }

  if (!resultado) {
    return null;
  }

  const porcentaje = resultado.porcentaje ?? 0;
  const porcentajeDisplay = Number.isInteger(porcentaje)
    ? String(porcentaje)
    : porcentaje.toFixed(1);
  const porcentajeClamped = Math.min(100, Math.max(0, porcentaje));

  return (
    <section className={detailStyles.contentPanel} aria-label="Resultado del examen">
      <div className={detailStyles.panelHeader}>
        <h3 className={detailStyles.panelTitle}>Resultado del examen</h3>
        <p className={detailStyles.panelDescription}>
          Calificación automática del examen diagnóstico contestado por el alumno.
        </p>
      </div>

      <div className={styles.summaryCard}>
        <div className={styles.summaryHero}>
          <div className={styles.summaryHeroMain}>
            <span className={styles.summaryEyebrow}>Examen diagnóstico</span>
            <h4 className={styles.summaryExamTitle}>
              {resultado.examen?.trim() || "Sin nombre"}
            </h4>
          </div>
          {resultado.fechaFinalizacion ? (
            <time
              className={styles.summaryDate}
              dateTime={resultado.fechaFinalizacion}
            >
              Finalizado el {formatFecha(resultado.fechaFinalizacion)}
            </time>
          ) : null}
        </div>

        <div className={styles.summaryMetrics}>
          <div className={styles.metricBlock}>
            <span className={styles.metricLabel}>Puntaje</span>
            <p className={styles.metricValue}>
              <span className={styles.metricPrimary}>
                {resultado.puntajeObtenido ?? 0}
              </span>
              <span className={styles.metricSecondary}>
                / {resultado.puntajeTotal ?? 0}
              </span>
            </p>
          </div>

          <div className={styles.metricDivider} aria-hidden="true" />

          <div className={styles.metricBlock}>
            <span className={styles.metricLabel}>Porcentaje</span>
            <p className={styles.metricValue}>
              <span className={styles.metricPrimary}>{porcentajeDisplay}%</span>
            </p>
            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-valuenow={porcentajeClamped}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Porcentaje obtenido: ${porcentajeDisplay}%`}
            >
              <div
                className={[
                  styles.progressFill,
                  resultado.aprobado
                    ? styles.progressFillAprobado
                    : styles.progressFillRechazado,
                ].join(" ")}
                style={
                  {
                    "--progress-width": `${porcentajeClamped}%`,
                  } as CSSProperties
                }
              />
            </div>
          </div>

          <div className={styles.metricDivider} aria-hidden="true" />

          <div className={[styles.metricBlock, styles.metricBlockResult].join(" ")}>
            <span className={styles.metricLabel}>Resultado</span>
            <EstatusBadge
              estatus={resultado.aprobado ? "APROBADO" : "RECHAZADO"}
            />
          </div>
        </div>

        {respuestas.length ? (
          <div className={styles.summaryFooter}>
            <span>
              <strong>{respuestas.length}</strong> preguntas
            </span>
            <span className={styles.summaryFooterDot} aria-hidden="true">
              ·
            </span>
            <span>
              <strong>{correctas}</strong> correctas
            </span>
            <span className={styles.summaryFooterDot} aria-hidden="true">
              ·
            </span>
            <span>
              <strong>{incorrectas}</strong> incorrectas
            </span>
          </div>
        ) : null}
      </div>

      {respuestas.length ? (
        <div className={styles.respuestasBlock}>
          <div className={styles.respuestasHead}>
            <p className={styles.respuestasTitle}>
              Detalle por pregunta ({respuestas.length})
            </p>
          </div>

          <div className={styles.respuestasScroll}>
            <table className={styles.respuestasTable}>
              <caption className="sr-only">
                Respuestas del examen por pregunta
              </caption>
              <thead>
                <tr>
                  <th className={styles.colNum} scope="col">
                    #
                  </th>
                  <th className={styles.colPregunta} scope="col">
                    Pregunta
                  </th>
                  <th className={styles.colRespuesta} scope="col">
                    Respuesta del alumno
                  </th>
                  <th className={styles.colEstado} scope="col">
                    Estado
                  </th>
                  <th className={styles.colPts} scope="col">
                    Pts
                  </th>
                </tr>
              </thead>
              <tbody>
                {respuestas.map((respuesta, index) => (
                  <tr key={respuesta.idPregunta}>
                    <td className={styles.colNum}>{index + 1}</td>
                    <td className={styles.colPregunta}>
                      <span className={styles.preguntaText}>
                        {respuesta.pregunta || "Sin enunciado"}
                      </span>
                      {respuesta.tipo ? (
                        <span className={styles.preguntaTipo}>
                          {formatEtiqueta(respuesta.tipo)}
                        </span>
                      ) : null}
                    </td>
                    <td className={styles.colRespuesta}>
                      {respuesta.opcion?.trim() || "Sin respuesta"}
                    </td>
                    <td className={styles.colEstado}>
                      <span
                        className={
                          respuesta.correcta
                            ? styles.estadoCorrecta
                            : styles.estadoIncorrecta
                        }
                      >
                        {respuesta.correcta ? "Correcta" : "Incorrecta"}
                      </span>
                    </td>
                    <td className={styles.colPts}>
                      {respuesta.puntajeObtenido ?? 0}/
                      {respuesta.puntajePregunta ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}
