"use client";

import Link from "next/link";
import { Briefcase } from "lucide-react";
import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useState } from "react";
import { getModalidadCatalogoLabel } from "@/lib/domain/modalidad";
import { getModalidadTrabajoLabel } from "@/lib/domain/vacante";
import { createPostulacionAction } from "../../actions/postulaciones.actions";
import { getVacanteDetailAction } from "../../actions/vacantes.actions";
import type { ProcesoDetalleResponse } from "../../types/alumno.types";
import { PANEL_PATHS } from "@/lib/auth/constants";
import { puedePostularVacantes } from "@/lib/domain";
import { notify } from "@/shared/notifications";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { CupoMeter } from "@/shared/components/CupoMeter";
import { DetailModalHero } from "@/shared/components/DetailModal";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import detailStyles from "@/shared/styles/DetailModal.module.css";
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
  const [isMutating, setIsMutating] = useState(false);
  const [comentario, setComentario] = useState("");
  const { detail, error, isLoading, isReloading } = useDetailModalLoader(
    open,
    vacanteId,
    getVacanteDetailAction,
    {
      onBeforeLoad: () => {
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
    const result = await createPostulacionAction({
      vacanteId: detail.idVacante,
      comentarioAlumno: comentario.trim() || undefined,
    });
    setIsMutating(false);
    if (!result.success) {
      if (result.code === "CV_INCOMPLETO") {
        notify.warning(result.error, {
          description: "Completa tu perfil en Mi CV y vuelve a intentarlo.",
        });
        router.push(`${PANEL_PATHS.alumno}/cv`);
        onClose();
        return;
      }
      notify.error(result.error);
      return;
    }
    notify.success("Tu postulación se registró correctamente.");
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
      footer={
        postularVisible ? (
          <div className={detailStyles.footerActions}>
            <Button
              type="button"
              variant="primary"
              disabled={isMutating}
              onClick={() => void handlePostular()}
            >
              {isMutating ? "Enviando postulación…" : "Postularme"}
            </Button>
          </div>
        ) : undefined
      }
    >
      {isLoading && !detail ? <EntityDetailModalSkeleton sections={2} /> : null}
      {error && !detail ? <Alert tone="error">{error}</Alert> : null}

      {detail ? (
        <div
          className={[detailStyles.layout, detailStyles.modalBody, isReloading && detailStyles.layoutBusy]
            .filter(Boolean)
            .join(" ")}
          aria-busy={isReloading}
        >
          <DetailModalHero
            icon={Briefcase}
            title={detail.nombre?.trim() || "Vacante sin nombre"}
            subtitle={
              <>
                {dependenciaNombre || areaNombre || "Sin dependencia asignada"}
                {folio ? ` · ${folio}` : ""}
              </>
            }
            badges={<EstatusBadge estatus={detail.estatus} />}
          />

          <dl className={detailStyles.metaList}>
            <div className={detailStyles.metaRow}>
              <dt>Área</dt>
              <dd>{areaNombre || "Sin área asignada"}</dd>
            </div>
            <div className={detailStyles.metaRow}>
              <dt>Dependencia</dt>
              <dd>{dependenciaNombre || "Sin dependencia asignada"}</dd>
            </div>
            <div className={detailStyles.metaRow}>
              <dt>Tipo</dt>
              <dd>
                {detail.modalidadId
                  ? getModalidadCatalogoLabel(detail.modalidadId)
                  : "Sin tipo registrado"}
              </dd>
            </div>
            <div className={detailStyles.metaRow}>
              <dt>Modalidad de trabajo</dt>
              <dd>{getModalidadTrabajoLabel(detail.modalidadTrabajo)}</dd>
            </div>
            <div className={detailStyles.metaRow}>
              <dt>Examen de ingreso</dt>
              <dd>{detail.requiereExamen ? "Sí" : "No"}</dd>
            </div>
            <div className={detailStyles.metaRow}>
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

          <div className={detailStyles.narrativeSection}>
            <p className={detailStyles.narrativeLabel}>Descripción</p>
            <p
              className={[
                detailStyles.narrativeValue,
                !descripcion && detailStyles.narrativeEmpty,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {descripcion || "Sin descripción registrada."}
            </p>
          </div>

          <div className={detailStyles.narrativeSection}>
            <p className={detailStyles.narrativeLabel}>Perfil requerido</p>
            <p
              className={[
                detailStyles.narrativeValue,
                !perfilRequerido && detailStyles.narrativeEmpty,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {perfilRequerido || "Sin perfil registrado."}
            </p>
          </div>

          {postularVisible ? (
            <section
              className={detailStyles.contentPanel}
              aria-labelledby="alumno-postulacion-title"
            >
              <div className={detailStyles.panelHeader}>
                <h3 id="alumno-postulacion-title" className={detailStyles.panelTitle}>
                  {firstName ? `${firstName}, ¿quieres postularte?` : "Tu postulación"}
                </h3>
                <p className={detailStyles.panelDescription}>
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
