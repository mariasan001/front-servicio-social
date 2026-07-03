"use client";

import Link from "next/link";
import { Briefcase } from "lucide-react";
import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useState } from "react";
import { getModalidadTrabajoLabel } from "@/features/titular/constants/vacante-form";
import { createPostulacionAction } from "../../actions/postulaciones.actions";
import { getVacanteDetailAction } from "../../actions/vacantes.actions";
import type { ProcesoDetalleResponse } from "../../types/alumno.types";
import { PANEL_PATHS } from "@/lib/auth/constants";
import { puedePostularVacantes } from "@/lib/domain";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { CupoMeter } from "@/shared/components/CupoMeter";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import styles from "@/shared/styles/EntityDetailModal.module.css";
import narrativeStyles from "@/shared/styles/VacanteDetailNarrative.module.css";
import alumnoStyles from "./AlumnoVacanteDetailModal.module.css";

function canPostular(estatus?: string, activa?: boolean) {
  const normalized = estatus?.trim().toUpperCase() ?? "";
  if (activa === false) return false;
  return normalized === "PUBLICADA" || normalized === "ACTIVA" || normalized === "VIGENTE";
}

export function AlumnoVacanteDetailModal({
  vacanteId,
  vacanteName,
  nombreCompleto,
  procesoActual,
  open,
  onClose,
}: {
  vacanteId: number | null;
  vacanteName?: string;
  nombreCompleto?: string;
  procesoActual: ProcesoDetalleResponse | null;
  open: boolean;
  onClose: () => void;
}) {
  const router = usePanelRouter();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [comentario, setComentario] = useState("");
  const { detail, error, isLoading, isReloading } = useDetailModalLoader(
    open,
    vacanteId,
    getVacanteDetailAction,
    {
      onBeforeLoad: () => {
        setActionError(null);
        setComentario("");
      },
    },
  );

  const alumnoPuedePostular = puedePostularVacantes(procesoActual);
  const vacanteDisponible = detail ? canPostular(detail.estatus, detail.activa) : false;
  const postularVisible = Boolean(detail && alumnoPuedePostular && vacanteDisponible);
  const firstName =
    nombreCompleto?.trim().split(/\s+/)[0]?.trim() || nombreCompleto?.trim() || "";

  const handlePostular = async () => {
    if (!detail) return;
    setIsMutating(true);
    setActionError(null);
    const result = await createPostulacionAction({
      vacanteId: detail.idVacante,
      comentarioAlumno: comentario.trim() || undefined,
    });
    setIsMutating(false);
    if (!result.success) {
      setActionError(result.error);
      return;
    }
    router.refresh();
    onClose();
  };

  const folio = detail?.folio?.trim();
  const areaNombre = detail?.areaNombre?.trim();
  const dependenciaNombre = detail?.dependenciaNombre?.trim();
  const descripcion = detail?.descripcion?.trim();
  const perfilRequerido = detail?.perfilRequerido?.trim();

  return (
    <Modal
      open={open}
      title={detail?.nombre ?? vacanteName ?? "Vacante"}
      onClose={onClose}
      size="lg"
    >
      {isLoading && !detail ? <EntityDetailModalSkeleton sections={2} /> : null}
      {error && !detail ? <Alert tone="error">{error}</Alert> : null}

      {detail ? (
        <div
          className={[styles.layout, isReloading && styles.layoutBusy].filter(Boolean).join(" ")}
          aria-busy={isReloading}
        >
          {actionError ? <Alert tone="error">{actionError}</Alert> : null}

          <div className={styles.summaryBar}>
            <div className={styles.avatar} aria-hidden="true">
              <Briefcase size={18} strokeWidth={1.75} />
            </div>

            <div className={styles.summaryMeta}>
              <p className={styles.summaryPrimary}>
                {dependenciaNombre || areaNombre || "Sin dependencia asignada"}
              </p>
              <p className={styles.summarySecondary}>{folio || "Sin folio registrado"}</p>
            </div>

            <EstatusBadge estatus={detail.estatus} />
          </div>

          <div className={styles.infoPanel}>
            <dl className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <dt>Área</dt>
                <dd>{areaNombre || "Sin área asignada"}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Dependencia</dt>
                <dd>{dependenciaNombre || "Sin dependencia asignada"}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Modalidad de trabajo</dt>
                <dd>{getModalidadTrabajoLabel(detail.modalidadTrabajo)}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Examen de ingreso</dt>
                <dd>{detail.requiereExamen ? "Sí" : "No"}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Cupo</dt>
                <dd>
                  <CupoMeter
                    variant="detail"
                    disponible={detail.cupoDisponible}
                    total={detail.cupoTotal ?? detail.cupoDisponible}
                  />
                </dd>
              </div>
            </dl>

            <div className={narrativeStyles.narrativeBlock}>
              <p className={narrativeStyles.narrativeLabel}>Descripción</p>
              <p
                className={[
                  narrativeStyles.narrativeValue,
                  !descripcion && narrativeStyles.narrativeEmpty,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {descripcion || "Sin descripción registrada."}
              </p>
            </div>

            <div className={narrativeStyles.narrativeBlock}>
              <p className={narrativeStyles.narrativeLabel}>Perfil requerido</p>
              <p
                className={[
                  narrativeStyles.narrativeValue,
                  !perfilRequerido && narrativeStyles.narrativeEmpty,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {perfilRequerido || "Sin perfil registrado."}
              </p>
            </div>
          </div>

          {postularVisible ? (
            <section className={alumnoStyles.postularSection} aria-labelledby="alumno-postulacion-title">
              <div className={alumnoStyles.postularIntro}>
                <h3 id="alumno-postulacion-title" className={alumnoStyles.postularTitle}>
                  {firstName ? `${firstName}, ¿quieres postularte?` : "Tu postulación"}
                </h3>
                <p className={alumnoStyles.postularHint}>
                  Si lo deseas, agrega un comentario breve sobre tu interés o disponibilidad.
                </p>
              </div>

              <label htmlFor="comentario-postulacion" className={alumnoStyles.srOnly}>
                Comentario opcional
              </label>
              <textarea
                id="comentario-postulacion"
                className={alumnoStyles.commentInput}
                rows={2}
                value={comentario}
                placeholder="Ej: Me interesa por mi formación en…"
                onChange={(event) => setComentario(event.target.value)}
              />

              <div className={alumnoStyles.postularActions}>
                <Button type="button" variant="primary" disabled={isMutating} onClick={() => void handlePostular()}>
                  {isMutating ? "Enviando postulación…" : "Postularme"}
                </Button>
              </div>
            </section>
          ) : !alumnoPuedePostular ? (
            <Alert tone="warning" title="Postulaciones bloqueadas">
              Tienes un proceso de servicio social en curso
              {procesoActual?.vacanteNombre ? (
                <>
                  {" "}
                  (<strong>{procesoActual.vacanteNombre}</strong>)
                </>
              ) : null}
              . Mientras esté vigente no puedes postularte a otra vacante.{" "}
              <Link href={`${PANEL_PATHS.alumno}/proceso`}>Ir a mi proceso</Link>.
            </Alert>
          ) : (
            <p className={alumnoStyles.unavailableNote} role="status">
              Esta vacante no está disponible para postulación en este momento.
            </p>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
