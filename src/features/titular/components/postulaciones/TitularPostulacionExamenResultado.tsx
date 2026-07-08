"use client";

import { useEffect, useState } from "react";
import { getResultadoExamenAction } from "../../actions/examenes.actions";
import type { ResultadoExamenResponse } from "../../types/titular.types";
import { formatEtiqueta, formatFecha } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import detailStyles from "@/shared/styles/DetailModal.module.css";
import styles from "../examenes/TitularExamen.module.css";

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

  return (
    <section className={detailStyles.contentPanel} aria-label="Resultado del examen">
      <div className={detailStyles.panelHeader}>
        <h3 className={detailStyles.panelTitle}>Resultado del examen</h3>
        <p className={detailStyles.panelDescription}>
          Calificación automática del examen diagnóstico contestado por el alumno.
        </p>
      </div>

      <dl className={detailStyles.metaList}>
        <div className={detailStyles.metaRow}>
          <dt>Examen</dt>
          <dd>{resultado.examen?.trim() || "Sin nombre"}</dd>
        </div>
        <div className={detailStyles.metaRow}>
          <dt>Puntaje</dt>
          <dd>
            {resultado.puntajeObtenido ?? 0} / {resultado.puntajeTotal ?? 0}
          </dd>
        </div>
        <div className={detailStyles.metaRow}>
          <dt>Porcentaje</dt>
          <dd>{resultado.porcentaje ?? 0}%</dd>
        </div>
        <div className={detailStyles.metaRow}>
          <dt>Resultado</dt>
          <dd>
            <EstatusBadge
              estatus={resultado.aprobado ? "APROBADO" : "RECHAZADO"}
            />
          </dd>
        </div>
        <div className={detailStyles.metaRow}>
          <dt>Finalizado</dt>
          <dd>
            {resultado.fechaFinalizacion
              ? formatFecha(resultado.fechaFinalizacion)
              : "Sin fecha"}
          </dd>
        </div>
      </dl>

      {resultado.respuestas?.length ? (
        <ol className={styles.preguntasList}>
          {resultado.respuestas.map((respuesta, index) => (
            <li key={respuesta.idPregunta} className={styles.preguntaCard}>
              <p className={styles.preguntaCardTitle}>
                {index + 1}. {respuesta.pregunta}
              </p>
              <p className={styles.preguntaCardMeta}>
                Respuesta: {respuesta.opcion}
                {" · "}
                {respuesta.correcta ? "Correcta" : "Incorrecta"}
                {" · "}
                {respuesta.puntajeObtenido ?? 0}/{respuesta.puntajePregunta ?? 0} pts
                {respuesta.tipo ? ` · ${formatEtiqueta(respuesta.tipo)}` : ""}
              </p>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
