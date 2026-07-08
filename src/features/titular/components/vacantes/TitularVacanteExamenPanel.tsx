"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileQuestion } from "lucide-react";
import {
  asociarExamenVacanteAction,
  listExamenesAction,
  quitarExamenVacanteAction,
} from "../../actions/examenes.actions";
import {
  clearVacanteExamenCache,
  getVacanteExamenCache,
  setVacanteExamenCache,
} from "../../lib/vacante-examen-cache";
import type {
  ExamenDiagnosticoResumenResponse,
  VacanteDetalleResponse,
} from "../../types/titular.types";
import { isExamenActivo } from "@/lib/domain";
import { notify } from "@/shared/notifications";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { SelectInput } from "@/shared/components/Form";
import detailStyles from "@/shared/styles/DetailModal.module.css";
import styles from "./TitularVacanteExamenPanel.module.css";

type TitularVacanteExamenPanelProps = {
  vacante: VacanteDetalleResponse;
  onChanged: () => void;
};

export function TitularVacanteExamenPanel({
  vacante,
  onChanged,
}: TitularVacanteExamenPanelProps) {
  const [examenes, setExamenes] = useState<ExamenDiagnosticoResumenResponse[]>([]);
  const [selectedExamenId, setSelectedExamenId] = useState("");
  const [examenAsociado, setExamenAsociado] = useState<{
    idExamen: number;
    titulo: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      const result = await listExamenesAction();
      if (cancelled) return;

      if (result.success) {
        setExamenes(result.data);
      }

      setIsLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!vacante.requiereExamen) {
      setExamenAsociado(null);
      setSelectedExamenId("");
      return;
    }

    const cached = getVacanteExamenCache(vacante.idVacante);
    if (cached) {
      setExamenAsociado(cached);
      setSelectedExamenId(String(cached.idExamen));
    }
  }, [vacante.idVacante, vacante.requiereExamen]);

  const opcionesActivas = useMemo(() => {
    const activos = examenes.filter(
      (examen) =>
        isExamenActivo(examen.estatus) &&
        (!vacante.areaId || examen.areaId === vacante.areaId),
    );

    if (
      examenAsociado &&
      !activos.some((examen) => examen.idExamen === examenAsociado.idExamen)
    ) {
      return [
        {
          idExamen: examenAsociado.idExamen,
          titulo: examenAsociado.titulo,
          estatus: "ACTIVO",
        } satisfies ExamenDiagnosticoResumenResponse,
        ...activos,
      ];
    }

    return activos;
  }, [examenes, examenAsociado, vacante.areaId]);

  useEffect(() => {
    if (isLoading || !vacante.requiereExamen || examenAsociado) {
      return;
    }

    if (opcionesActivas.length === 1) {
      const unico = opcionesActivas[0];
      if (!unico) {
        return;
      }

      const entry = {
        idExamen: unico.idExamen,
        titulo: unico.titulo?.trim() || "Examen asociado",
      };
      setExamenAsociado(entry);
      setSelectedExamenId(String(entry.idExamen));
      setVacanteExamenCache(vacante.idVacante, entry);
    }
  }, [
    examenAsociado,
    isLoading,
    opcionesActivas,
    vacante.idVacante,
    vacante.requiereExamen,
  ]);

  const handleAsociar = async () => {
    const idExamen = Number(selectedExamenId);
    if (!idExamen) {
      notify.error("Selecciona un examen activo.");
      return;
    }

    setIsMutating(true);

    if (vacante.requiereExamen) {
      const quitarResult = await quitarExamenVacanteAction(vacante.idVacante);
      if (!quitarResult.success) {
        setIsMutating(false);
        notify.error(quitarResult.error);
        return;
      }
    }

    const result = await asociarExamenVacanteAction(vacante.idVacante, idExamen);
    setIsMutating(false);

    if (!result.success) {
      notify.error(result.error);
      return;
    }

    const titulo =
      result.data.titulo?.trim() ||
      opcionesActivas.find((examen) => examen.idExamen === idExamen)?.titulo ||
      "Examen asociado";

    setVacanteExamenCache(vacante.idVacante, { idExamen, titulo });
    setExamenAsociado({ idExamen, titulo });

    notify.success(
      vacante.requiereExamen
        ? "Examen actualizado en la vacante."
        : "Examen asociado a la vacante.",
    );
    onChanged();
  };

  const handleQuitar = async () => {
    setIsMutating(true);
    const result = await quitarExamenVacanteAction(vacante.idVacante);
    setIsMutating(false);

    if (!result.success) {
      notify.error(result.error);
      return;
    }

    clearVacanteExamenCache(vacante.idVacante);
    setExamenAsociado(null);
    setSelectedExamenId("");
    notify.success("Examen desasociado de la vacante.");
    onChanged();
  };

  const yaRequiereExamen = Boolean(vacante.requiereExamen);
  const noHayActivos = !isLoading && opcionesActivas.length === 0;
  const examenConocido = Boolean(examenAsociado?.titulo);

  return (
    <section className={detailStyles.contentPanel} aria-label="Examen de la vacante">
      <div className={detailStyles.panelHeader}>
        <h3 className={detailStyles.panelTitle}>Examen diagnóstico</h3>
        <p className={detailStyles.panelDescription}>
          Asocia un examen activo de tu área para que los postulantes lo
          contesten en línea.
        </p>
      </div>

      {yaRequiereExamen ? (
        examenConocido ? (
          <div className={styles.associatedCard}>
            <span className={styles.associatedIcon} aria-hidden="true">
              <FileQuestion size={18} strokeWidth={1.75} />
            </span>
            <div className={styles.associatedCopy}>
              <p className={styles.associatedLabel}>Examen asociado</p>
              <p className={styles.associatedTitle}>{examenAsociado?.titulo}</p>
            </div>
            <CheckCircle2
              size={18}
              aria-hidden="true"
              className={styles.associatedCheck}
            />
          </div>
        ) : (
          <p className={styles.statusBanner}>
            <CheckCircle2 size={16} aria-hidden="true" className={styles.statusIcon} />
            Esta vacante requiere examen de ingreso. Selecciona el examen vinculado
            abajo si no aparece automáticamente.
          </p>
        )
      ) : null}

      {noHayActivos ? (
        <Alert tone="info">
          No tienes exámenes activos en tu área. Crea uno en la sección
          <strong> Exámenes</strong>, agrégale preguntas y actívalo para poder
          asociarlo aquí.
        </Alert>
      ) : (
        <div className={styles.form}>
          <SelectInput
            id="vacante-examen-id"
            label={yaRequiereExamen ? "Cambiar examen" : "Examen activo"}
            placeholder={isLoading ? "Cargando exámenes…" : "Selecciona un examen"}
            value={selectedExamenId}
            disabled={isLoading || opcionesActivas.length === 0 || isMutating}
            onChange={(event) => setSelectedExamenId(event.target.value)}
          >
            {opcionesActivas.map((examen) => (
              <option key={examen.idExamen} value={examen.idExamen}>
                {examen.titulo}
              </option>
            ))}
          </SelectInput>

          <div className={styles.actions}>
            <Button
              type="button"
              variant="primary"
              disabled={isMutating || !selectedExamenId}
              onClick={() => void handleAsociar()}
            >
              {yaRequiereExamen ? "Actualizar examen" : "Asociar examen"}
            </Button>
            {yaRequiereExamen ? (
              <Button
                type="button"
                variant="outline"
                className={detailStyles.dangerButton}
                disabled={isMutating}
                onClick={() => void handleQuitar()}
              >
                Quitar examen
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
