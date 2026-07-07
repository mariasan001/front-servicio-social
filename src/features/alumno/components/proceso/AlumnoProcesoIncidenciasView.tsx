"use client";

import { MoreHorizontal, Shield } from "lucide-react";
import { useState } from "react";
import type { IncidenciaResponse, ProcesoDetalleResponse } from "../../types/alumno.types";
import { estatusTone, formatEtiqueta } from "@/lib/domain";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import { AlumnoProcesoLayout } from "./AlumnoProcesoLayout";
import styles from "./AlumnoProcesoDocumentosView.module.css";
import incidenciaStyles from "./AlumnoProcesoIncidenciasView.module.css";
import { IncidenciaDetalleModal } from "./IncidenciaDetalleModal";

type AlumnoProcesoIncidenciasViewProps = {
  proceso: ProcesoDetalleResponse;
  incidencias: IncidenciaResponse[];
  firstName: string;
};

function resolveIncidenciaLabel(incidencia: IncidenciaResponse) {
  return formatEtiqueta(incidencia.tipo, "Incidencia");
}

export function AlumnoProcesoIncidenciasView({
  proceso,
  incidencias,
  firstName,
}: AlumnoProcesoIncidenciasViewProps) {
  const [activeIncidenciaId, setActiveIncidenciaId] = useState<number | null>(null);

  const activeIncidencia =
    incidencias.find((incidencia) => incidencia.idIncidencia === activeIncidenciaId) ?? null;

  return (
    <AlumnoProcesoLayout
      titleId="alumno-proceso-incidencias-title"
      firstName={firstName}
      title="Mis incidencias"
      description="Consulta los eventos registrados durante tu proceso de servicio social."
      estatus={proceso.estatus}
    >
      <section className={styles.docSection} aria-label="Incidencias del proceso">
        {incidencias.length === 0 ? (
          <div className={incidenciaStyles.emptyWrap}>
            <span className={incidenciaStyles.emptyIcon} aria-hidden="true">
              <Shield size={22} strokeWidth={1.75} />
            </span>
            <p className={incidenciaStyles.emptyTitle}>Sin incidencias</p>
            <p className={incidenciaStyles.emptyHint}>
              No hay incidencias registradas en tu proceso. ¡Sigue así!
            </p>
          </div>
        ) : (
          <ul className={styles.fileGrid}>
            {incidencias.map((incidencia) => {
              const label = resolveIncidenciaLabel(incidencia);
              const tone = estatusTone(incidencia.estatus);
              const isActive = activeIncidenciaId === incidencia.idIncidencia;
              const severidad = formatEtiqueta(incidencia.severidad, "Sin severidad");
              const preview = incidencia.descripcion?.trim() || "Sin descripción registrada.";

              return (
                <li key={incidencia.idIncidencia}>
                  <button
                    type="button"
                    className={styles.fileCard}
                    data-tone={tone}
                    data-active={isActive || undefined}
                    aria-label={`Ver incidencia ${label}`}
                    onClick={() => setActiveIncidenciaId(incidencia.idIncidencia)}
                  >
                    <span className={styles.fileCardMenu} aria-hidden="true">
                      <MoreHorizontal size={16} strokeWidth={2} />
                    </span>

                    <span className={incidenciaStyles.cardBadge} aria-hidden="true">
                      <Shield size={18} strokeWidth={1.75} />
                    </span>

                    <span className={styles.fileName}>{label}</span>
                    <span className={styles.fileMeta}>{severidad}</span>
                    <span className={styles.fileMeta}>{preview}</span>

                    <span className={styles.fileStatus}>
                      <EstatusBadge estatus={incidencia.estatus} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <IncidenciaDetalleModal
        open={activeIncidencia !== null}
        incidencia={activeIncidencia}
        incidenciaLabel={activeIncidencia ? resolveIncidenciaLabel(activeIncidencia) : ""}
        onClose={() => setActiveIncidenciaId(null)}
      />
    </AlumnoProcesoLayout>
  );
}
