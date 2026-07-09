"use client";

import {
  canRegistrarHoraProceso,
  formatHorasProceso,
} from "@/lib/domain/proceso";
import { Alert } from "@/shared/components/Alert";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import detailStyles from "@/shared/styles/DetailModal.module.css";
import sectionStyles from "@/shared/styles/DetailModalSections.module.css";
import {
  TITULAR_PROCESO_SECTION_LABELS,
  type TitularProcesoModalSection,
} from "./titular-proceso-sections";
import { TitularProcesoHorasPanel } from "./TitularProcesoHorasPanel";
import { TitularProcesoEvaluacionSection } from "./TitularProcesoEvaluacionSection";
import { TitularProcesoIncidenciasSection } from "./TitularProcesoIncidenciasSection";
import { TitularProcesoLiberacionSection } from "./TitularProcesoLiberacionSection";
import { getTitularProcesoSectionAside } from "./titular-proceso-section-aside";
import { useTitularProcesoDetailModal } from "./useTitularProcesoDetailModal";

type TitularProcesoDetailModalProps = {
  procesoId: number | null;
  section: TitularProcesoModalSection | null;
  open: boolean;
  onClose: () => void;
};

export function TitularProcesoDetailModal({
  procesoId,
  section,
  open,
  onClose,
}: TitularProcesoDetailModalProps) {
  const modal = useTitularProcesoDetailModal({ open, procesoId });
  const { proceso, detail, error, isLoading, isReloading, isMutating } = modal;

  const alumnoNombre = proceso?.alumnoNombre?.trim();
  const vacanteNombre = proceso?.vacanteNombre?.trim();
  const horasLabel = proceso
    ? formatHorasProceso(proceso.horasAcumuladas, proceso.horasRequeridas, "detalle")
    : "—";
  const sectionLabel = section ? TITULAR_PROCESO_SECTION_LABELS[section] : "Proceso";
  const sectionAside = section
    ? getTitularProcesoSectionAside(section, modal.incidenciasRegistradas.length, horasLabel)
    : null;

  return (
    <Modal open={open} title={sectionLabel} onClose={onClose} size="lg">
      {isLoading && !detail ? <EntityDetailModalSkeleton sections={1} /> : null}
      {error && !detail ? <Alert tone="error">{error}</Alert> : null}

      {proceso && section && detail ? (
        <div
          className={[
            detailStyles.layout,
            detailStyles.modalBody,
            isReloading && detailStyles.layoutBusy,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-busy={isReloading}
        >
          <div className={sectionStyles.sectionContext}>
            <div className={sectionStyles.sectionContextMain}>
              <p className={sectionStyles.sectionContextName}>
                {alumnoNombre || "Sin alumno registrado"}
              </p>
              <p className={sectionStyles.sectionContextMeta}>
                {vacanteNombre || "Sin vacante"}
              </p>
            </div>
            {sectionAside ? (
              <div className={sectionStyles.sectionContextAside}>
                <span className={sectionStyles.sectionContextAsideLabel}>
                  {sectionAside.label}
                </span>
                <strong>{sectionAside.value}</strong>
              </div>
            ) : null}
          </div>

          {section === "horas" ? (
            <TitularProcesoHorasPanel
              horas={modal.horasRegistradas}
              idProceso={proceso.idProceso}
              canRegister={canRegistrarHoraProceso(proceso.estatus)}
              onUpdated={modal.refresh}
            />
          ) : null}

          {section === "incidencias" ? (
            <TitularProcesoIncidenciasSection
              proceso={proceso}
              incidencias={modal.incidenciasRegistradas}
              nuevaIncidencia={modal.nuevaIncidencia}
              isMutating={isMutating}
              onIncidenciaChange={modal.setNuevaIncidencia}
              onRegistrar={() => void modal.registrarIncidencia()}
            />
          ) : null}

          {section === "liberacion" ? (
            <TitularProcesoLiberacionSection
              proceso={proceso}
              detail={detail}
              liberacionComentario={modal.liberacionComentario}
              isMutating={isMutating}
              onComentarioChange={modal.setLiberacionComentario}
              onEmitir={() => void modal.emitirLiberacion()}
            />
          ) : null}

          {section === "evaluacion" ? (
            <TitularProcesoEvaluacionSection
              proceso={proceso}
              detail={detail}
              evaluacion={modal.evaluacion}
              isMutating={isMutating}
              onEvaluacionChange={modal.setEvaluacion}
              onRegistrar={() => void modal.registrarEvaluacion()}
            />
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
