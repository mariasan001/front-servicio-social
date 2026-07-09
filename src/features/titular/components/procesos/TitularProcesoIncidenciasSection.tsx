"use client";

import { formatEtiqueta } from "@/lib/domain/labels";
import { canRegistrarIncidenciaProceso } from "@/lib/domain/proceso";
import {
  INCIDENCIA_SEVERIDADES,
  INCIDENCIA_SEVERIDAD_LABELS,
  INCIDENCIA_TIPOS,
  INCIDENCIA_TIPO_LABELS,
} from "@/lib/domain/incidencia";
import { Button } from "@/shared/components/Button";
import { FormField, SelectInput, TextInput } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import sectionStyles from "@/shared/styles/DetailModalSections.module.css";
import type { IncidenciaResponse, ProcesoResponse } from "../../types/titular.types";

type TitularProcesoIncidenciasSectionProps = {
  proceso: ProcesoResponse;
  incidencias: IncidenciaResponse[];
  nuevaIncidencia: {
    tipo: string;
    severidad: string;
    descripcion: string;
    fechaIncidencia: string;
  };
  isMutating: boolean;
  onIncidenciaChange: (value: TitularProcesoIncidenciasSectionProps["nuevaIncidencia"]) => void;
  onRegistrar: () => void;
};

export function TitularProcesoIncidenciasSection({
  proceso,
  incidencias,
  nuevaIncidencia,
  isMutating,
  onIncidenciaChange,
  onRegistrar,
}: TitularProcesoIncidenciasSectionProps) {
  const canRegister = canRegistrarIncidenciaProceso(proceso.estatus);

  return (
    <>
      {incidencias.length === 0 ? (
        <p className={sectionStyles.emptyHint}>No hay incidencias registradas.</p>
      ) : (
        <ul className={sectionStyles.recordList}>
          {incidencias.map((incidencia) => (
            <li key={incidencia.idIncidencia} className={sectionStyles.recordCard}>
              <div className={sectionStyles.recordHeader}>
                <span className={sectionStyles.recordTitle}>
                  {formatEtiqueta(incidencia.tipo, "Incidencia")}
                </span>
                <EstatusBadge estatus={incidencia.estatus} />
              </div>
              {incidencia.severidad ? (
                <div className={sectionStyles.recordDetails}>
                  <span>Severidad: {formatEtiqueta(incidencia.severidad)}</span>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {canRegister ? (
        <div className={sectionStyles.registerPanel} aria-label="Registrar incidencia">
          <div className={sectionStyles.registerPanelHeader}>
            <h3 className={sectionStyles.registerPanelTitle}>Nueva incidencia</h3>
            <p className={sectionStyles.registerPanelDescription}>
              Documenta un evento relevante durante el seguimiento.
            </p>
          </div>

          <div className={sectionStyles.fieldGrid}>
            <SelectInput
              id="inc-tipo"
              label="Tipo"
              required
              placeholder="Selecciona un tipo"
              value={nuevaIncidencia.tipo}
              onChange={(event) =>
                onIncidenciaChange({ ...nuevaIncidencia, tipo: event.target.value })
              }
            >
              {INCIDENCIA_TIPOS.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {INCIDENCIA_TIPO_LABELS[tipo]}
                </option>
              ))}
            </SelectInput>
            <SelectInput
              id="inc-severidad"
              label="Severidad"
              required
              placeholder="Selecciona severidad"
              value={nuevaIncidencia.severidad}
              onChange={(event) =>
                onIncidenciaChange({ ...nuevaIncidencia, severidad: event.target.value })
              }
            >
              {INCIDENCIA_SEVERIDADES.map((severidad) => (
                <option key={severidad} value={severidad}>
                  {INCIDENCIA_SEVERIDAD_LABELS[severidad]}
                </option>
              ))}
            </SelectInput>
            <TextInput
              id="inc-fecha"
              label="Fecha"
              type="date"
              value={nuevaIncidencia.fechaIncidencia}
              onChange={(event) =>
                onIncidenciaChange({ ...nuevaIncidencia, fechaIncidencia: event.target.value })
              }
            />
          </div>

          <FormField id="inc-descripcion" label="Descripción" required>
            <textarea
              id="inc-descripcion"
              className={formStyles.textarea}
              rows={2}
              value={nuevaIncidencia.descripcion}
              onChange={(event) =>
                onIncidenciaChange({ ...nuevaIncidencia, descripcion: event.target.value })
              }
            />
          </FormField>

          <div className={sectionStyles.registerPanelActions}>
            <Button
              type="button"
              variant="success"
              disabled={isMutating}
              onClick={() => void onRegistrar()}
            >
              Registrar incidencia
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
