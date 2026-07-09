"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  asociarExamenVacanteAction,
  getVacanteExamenAction,
  listExamenesAction,
  quitarExamenVacanteAction,
} from "../../actions/examenes.actions";
import {
  clearVacanteExamenCache,
  readVacanteExamenCache,
  saveVacanteExamenCache,
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

type ExamenVinculado = {
  idExamen: number;
  titulo: string;
};

function filterExamenesActivos(
  examenes: ExamenDiagnosticoResumenResponse[],
  areaId?: number,
) {
  return examenes.filter(
    (examen) =>
      isExamenActivo(examen.estatus) &&
      (!areaId || Number(examen.areaId) === Number(areaId)),
  );
}

function resolveExamenVinculado(
  vacante: VacanteDetalleResponse,
  examenes: ExamenDiagnosticoResumenResponse[],
  fromApi: ExamenVinculado | null,
): ExamenVinculado | null {
  if (!vacante.requiereExamen) {
    return null;
  }

  if (vacante.idExamen) {
    return {
      idExamen: vacante.idExamen,
      titulo:
        vacante.examenTitulo?.trim() ||
        examenes.find((examen) => examen.idExamen === vacante.idExamen)?.titulo ||
        `Examen #${vacante.idExamen}`,
    };
  }

  if (fromApi) {
    return fromApi;
  }

  const cached = readVacanteExamenCache(vacante.idVacante);
  if (cached) {
    return { idExamen: cached.idExamen, titulo: cached.titulo };
  }

  const activos = filterExamenesActivos(examenes, vacante.areaId);
  if (activos.length === 1) {
    return { idExamen: activos[0].idExamen, titulo: activos[0].titulo };
  }

  return null;
}

export function TitularVacanteExamenPanel({
  vacante,
  onChanged,
}: TitularVacanteExamenPanelProps) {
  const [examenes, setExamenes] = useState<ExamenDiagnosticoResumenResponse[]>([]);
  const [examenVinculado, setExamenVinculado] = useState<ExamenVinculado | null>(null);
  const [selectedExamenId, setSelectedExamenId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);

      const [examenesResult, examenApiResult] = await Promise.all([
        listExamenesAction(),
        vacante.requiereExamen
          ? getVacanteExamenAction(vacante.idVacante)
          : Promise.resolve({ success: true as const, data: null }),
      ]);

      if (cancelled) return;

      const lista = examenesResult.success ? examenesResult.data : [];
      setExamenes(lista);

      const fromApi =
        examenApiResult.success && examenApiResult.data
          ? {
              idExamen: examenApiResult.data.idExamen,
              titulo: examenApiResult.data.titulo,
            }
          : null;

      if (fromApi) {
        saveVacanteExamenCache(vacante.idVacante, fromApi);
      }

      const vinculado = resolveExamenVinculado(vacante, lista, fromApi);
      setExamenVinculado(vinculado);
      setSelectedExamenId(vinculado ? String(vinculado.idExamen) : "");
      setIsLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [vacante]);

  const opcionesActivas = useMemo(
    () => filterExamenesActivos(examenes, vacante.areaId),
    [examenes, vacante.areaId],
  );

  const opcionesSelect = useMemo(() => {
    if (
      examenVinculado &&
      !opcionesActivas.some((examen) => examen.idExamen === examenVinculado.idExamen)
    ) {
      return [
        {
          idExamen: examenVinculado.idExamen,
          titulo: examenVinculado.titulo,
          areaId: vacante.areaId ?? 0,
          estatus: "INACTIVO",
        } satisfies ExamenDiagnosticoResumenResponse,
        ...opcionesActivas,
      ];
    }

    return opcionesActivas;
  }, [examenVinculado, opcionesActivas, vacante.areaId]);

  const handleAsociar = async () => {
    const idExamen = Number(selectedExamenId);
    if (!idExamen) {
      notify.error("Selecciona un examen activo.");
      return;
    }

    const examenSeleccionado = opcionesSelect.find(
      (examen) => examen.idExamen === idExamen,
    );

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

    if (examenSeleccionado) {
      const entry = {
        idExamen: examenSeleccionado.idExamen,
        titulo: examenSeleccionado.titulo,
      };
      saveVacanteExamenCache(vacante.idVacante, entry);
      setExamenVinculado(entry);
      setSelectedExamenId(String(entry.idExamen));
    }

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
    setExamenVinculado(null);
    setSelectedExamenId("");
    notify.success("Examen desasociado de la vacante.");
    onChanged();
  };

  const yaRequiereExamen = Boolean(vacante.requiereExamen);
  const noHayActivos = !isLoading && opcionesActivas.length === 0;
  const cambioPendiente =
    Boolean(examenVinculado) &&
    selectedExamenId !== "" &&
    Number(selectedExamenId) !== examenVinculado?.idExamen;

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
        <p className={styles.statusBanner}>
          <CheckCircle2 size={16} aria-hidden="true" className={styles.statusIcon} />
          Esta vacante requiere examen de ingreso.
        </p>
      ) : null}

      {yaRequiereExamen && examenVinculado ? (
        <dl className={styles.linkedExam}>
          <dt>Examen vinculado</dt>
          <dd>{examenVinculado.titulo}</dd>
        </dl>
      ) : null}

      {yaRequiereExamen && !isLoading && !examenVinculado ? (
        <Alert tone="info">
          Esta vacante tiene examen configurado, pero no pudimos mostrar cuál es.
          Si tienes varios exámenes activos, selecciona el correcto para confirmarlo
          o cámbialo.
        </Alert>
      ) : null}

      {noHayActivos && !examenVinculado ? (
        <Alert tone="info">
          No tienes exámenes activos en tu área. Crea uno en la sección
          <strong> Exámenes</strong>, agrégale preguntas y actívalo para poder
          asociarlo aquí.
        </Alert>
      ) : opcionesSelect.length > 0 || isLoading ? (
        <div className={styles.form}>
          <SelectInput
            id="vacante-examen-id"
            label={yaRequiereExamen ? "Cambiar examen" : "Examen activo"}
            placeholder={isLoading ? "Cargando exámenes…" : "Selecciona un examen"}
            value={selectedExamenId}
            disabled={isLoading || opcionesSelect.length === 0 || isMutating}
            onChange={(event) => setSelectedExamenId(event.target.value)}
          >
            {opcionesSelect.map((examen) => (
              <option key={examen.idExamen} value={examen.idExamen}>
                {examen.titulo}
                {!isExamenActivo(examen.estatus) ? " (inactivo)" : ""}
              </option>
            ))}
          </SelectInput>

          <div className={styles.actions}>
            <Button
              type="button"
              variant="primary"
              disabled={
                isMutating ||
                !selectedExamenId ||
                (yaRequiereExamen && !cambioPendiente && Boolean(examenVinculado))
              }
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
      ) : null}
    </section>
  );
}
