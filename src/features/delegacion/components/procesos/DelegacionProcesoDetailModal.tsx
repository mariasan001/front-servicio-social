"use client";

import { CartaGestionModal } from "@/shared/proceso";
import {
  canCancelProceso,
  canSetHorasRequeridas,
  formatHorasProceso,
  isListoParaActivacion,
  tieneHorasRequeridas,
} from "@/lib/domain/proceso";
import { cartaTipoIncludes, resolveCartaDownloadKind } from "@/lib/domain";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import detailStyles from "@/shared/styles/DetailModal.module.css";
import sectionStyles from "@/shared/styles/DetailModalSections.module.css";
import {
  DELEGACION_PROCESO_SECTION_LABELS,
  type DelegacionProcesoModalSection,
} from "./delegacion-proceso-sections";
import { DelegacionDocumentoRevisionModal } from "./DelegacionDocumentoRevisionModal";
import { DelegacionProcesoCancelacionSection } from "./DelegacionProcesoCancelacionSection";
import { DelegacionProcesoCartasSection } from "./DelegacionProcesoCartasSection";
import { DelegacionProcesoDocumentacionSection } from "./DelegacionProcesoDocumentacionSection";
import { DelegacionProcesoHorasSection } from "./DelegacionProcesoHorasSection";
import { DelegacionProcesoRegistrosHorasSection } from "./DelegacionProcesoRegistrosHorasSection";
import { getDelegacionProcesoSectionAside } from "./delegacion-proceso-section-aside";
import { useDelegacionProcesoDetailModal } from "./useDelegacionProcesoDetailModal";
import { resolveCartaBadgeLabel, resolveCartaLabel } from "@/shared/proceso";

type DelegacionProcesoDetailModalProps = {
  procesoId: number | null;
  section: DelegacionProcesoModalSection | null;
  open: boolean;
  onClose: () => void;
};

export function DelegacionProcesoDetailModal({
  procesoId,
  section,
  open,
  onClose,
}: DelegacionProcesoDetailModalProps) {
  const modal = useDelegacionProcesoDetailModal({ open, procesoId });
  const { proceso, detail, error, isLoading, isReloading, isMutating } = modal;

  const estatus = proceso?.estatus?.trim().toUpperCase() ?? "";
  const cartaAceptacionEmitida = (modal.cartas ?? []).some((carta) =>
    cartaTipoIncludes(carta.tipoCarta, "aceptacion"),
  );
  const listoParaActivar = isListoParaActivacion(estatus);
  const canCancel = canCancelProceso(estatus);
  const canEditHoras = canSetHorasRequeridas(estatus);
  const alumnoNombre = proceso?.alumnoNombre?.trim();
  const folio = proceso?.folio?.trim();
  const vacanteNombre = proceso?.vacanteNombre?.trim();
  const horasLabel = proceso
    ? formatHorasProceso(proceso.horasAcumuladas, proceso.horasRequeridas, "detalle")
    : "—";
  const sectionLabel = section ? DELEGACION_PROCESO_SECTION_LABELS[section] : "Proceso";
  const showActivacionForm =
    section === "horas-requeridas" && listoParaActivar && !cartaAceptacionEmitida;
  const modalTitle = showActivacionForm
    ? "Activar alumno"
    : section === "horas-requeridas"
      ? alumnoNombre || "Horas requeridas"
      : sectionLabel;

  const sectionAside =
    proceso && section
      ? getDelegacionProcesoSectionAside(
          section,
          modal.documentos.length,
          modal.horas.length,
          modal.cartas.length,
          horasLabel,
          folio || `#${proceso.idProceso}`,
        )
      : null;

  return (
    <Modal
      open={open}
      title={modalTitle}
      onClose={onClose}
      size="lg"
      footer={
        showActivacionForm && proceso ? (
          <div className={detailStyles.footerActions}>
            <Button
              type="button"
              variant="outline"
              disabled={isMutating || !modal.horasRequeridas.trim()}
              onClick={() => void modal.guardarHoras()}
            >
              {isMutating ? "Guardando…" : "Guardar horas"}
            </Button>
            <Button
              type="button"
              variant="success"
              disabled={
                isMutating ||
                !modal.horasRequeridas.trim() ||
                (!tieneHorasRequeridas(proceso.horasRequeridas) &&
                  Number(modal.horasRequeridas) <= 0)
              }
              onClick={() => void modal.activarAlumno()}
            >
              {isMutating
                ? "Activando…"
                : modal.cartaAceptacionFile
                  ? "Activar con PDF subido"
                  : "Activar y generar carta"}
            </Button>
          </div>
        ) : undefined
      }
    >
      {isLoading && !detail ? <EntityDetailModalSkeleton sections={1} /> : null}
      {error && !detail ? <Alert tone="error">{error}</Alert> : null}

      {proceso && section ? (
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
          {!showActivacionForm ? (
            <div className={sectionStyles.sectionContext}>
              <div className={sectionStyles.sectionContextMain}>
                <p className={sectionStyles.sectionContextName}>
                  {alumnoNombre || "Sin alumno registrado"}
                </p>
                <p className={sectionStyles.sectionContextMeta}>
                  {vacanteNombre || folio || `Proceso #${proceso.idProceso}`}
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
          ) : null}

          {section === "horas-requeridas" ? (
            <DelegacionProcesoHorasSection
              proceso={proceso}
              alumnoNombre={alumnoNombre}
              vacanteNombre={vacanteNombre}
              folio={folio}
              horasLabel={horasLabel}
              showActivacionForm={showActivacionForm}
              canEditHoras={canEditHoras}
              horasRequeridas={modal.horasRequeridas}
              cartaAceptacionFile={modal.cartaAceptacionFile}
              isMutating={isMutating}
              onHorasRequeridasChange={modal.setHorasRequeridasDraft}
              onCartaAceptacionFileChange={modal.setCartaAceptacionFile}
              onGuardarHoras={() => void modal.guardarHoras()}
            />
          ) : null}

          {section === "documentacion" ? (
            <DelegacionProcesoDocumentacionSection
              documentos={modal.documentos}
              activeDocumentoId={modal.activeDocumentoId}
              onSelectDocumento={(id) => {
                modal.setActiveDocumentoId(id);
                modal.setDocumentoComentario("");
              }}
            />
          ) : null}

          {section === "registros-horas" ? (
            <DelegacionProcesoRegistrosHorasSection
              horas={modal.horas}
              comentario={modal.comentario}
              isMutating={isMutating}
              onComentarioChange={modal.setComentario}
              onHoraAction={(action, id) => void modal.runHoraAction(action, id)}
            />
          ) : null}

          {section === "cartas" ? (
            <DelegacionProcesoCartasSection
              estatus={estatus}
              cartas={modal.cartas}
              activeCartaId={modal.activeCartaId}
              cartaLiberacionFile={modal.cartaLiberacionFile}
              isMutating={isMutating}
              hasCarta={modal.hasCarta}
              onSelectCarta={modal.setActiveCartaId}
              onCartaLiberacionFileChange={modal.setCartaLiberacionFile}
              onEmitCarta={(kind, withFile) => void modal.emitCarta(kind, withFile)}
            />
          ) : null}

          {section === "cancelacion" ? (
            <DelegacionProcesoCancelacionSection
              canCancel={canCancel}
              motivoCancelacion={modal.motivoCancelacion}
              isMutating={isMutating}
              onMotivoChange={modal.setMotivoCancelacion}
              onCancelar={() => void modal.cancelarProceso()}
            />
          ) : null}
        </div>
      ) : null}

      <DelegacionDocumentoRevisionModal
        open={modal.activeDocumento !== null}
        documento={modal.activeDocumento}
        disabled={isMutating}
        comentario={modal.documentoComentario}
        onComentarioChange={modal.setDocumentoComentario}
        onClose={() => {
          modal.setActiveDocumentoId(null);
          modal.setDocumentoComentario("");
        }}
        onDownload={() => {
          if (!modal.activeDocumento) return;
          void modal.downloadDocumento(modal.activeDocumento.idProcesoDocumento);
        }}
        onApprove={() => {
          if (!modal.activeDocumento) return;
          void modal.runDocAction("approve", modal.activeDocumento.idProcesoDocumento);
        }}
        onObserve={() => {
          if (!modal.activeDocumento) return;
          void modal.runDocAction("observe", modal.activeDocumento.idProcesoDocumento);
        }}
        onReject={() => {
          if (!modal.activeDocumento) return;
          void modal.runDocAction("reject", modal.activeDocumento.idProcesoDocumento);
        }}
      />

      <CartaGestionModal
        open={modal.activeCarta !== null}
        carta={modal.activeCarta}
        cartaLabel={modal.activeCarta ? resolveCartaLabel(modal.activeCarta) : ""}
        badgeLabel={modal.activeCarta ? resolveCartaBadgeLabel(modal.activeCarta.tipoCarta) : "PDF"}
        disabled={isMutating}
        canDownload={
          modal.activeCarta ? Boolean(resolveCartaDownloadKind(modal.activeCarta.tipoCarta)) : false
        }
        onClose={() => modal.setActiveCartaId(null)}
        onDownload={() => {
          if (!modal.activeCarta) return;
          const kind = resolveCartaDownloadKind(modal.activeCarta.tipoCarta);
          if (!kind) return;
          void modal.downloadCarta(kind);
        }}
      />
    </Modal>
  );
}
