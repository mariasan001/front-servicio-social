"use client";

import { Download, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { downloadCartaArchivoAction } from "../../actions/proceso.actions";
import type { CartaMetadataResponse, ProcesoDetalleResponse } from "../../types/alumno.types";
import {
  estatusTone,
  formatEtiqueta,
  formatFecha,
  resolveCartaDownloadKind,
} from "@/lib/domain";
import { runDownloadAction } from "@/lib/utils/download-file";
import { Alert } from "@/shared/components/Alert";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import { AlumnoProcesoLayout } from "./AlumnoProcesoLayout";
import { CartaGestionModal } from "./CartaGestionModal";
import styles from "./AlumnoProcesoDocumentosView.module.css";

type AlumnoProcesoCartasViewProps = {
  proceso: ProcesoDetalleResponse;
  cartas: CartaMetadataResponse[];
  firstName: string;
};

function resolveCartaLabel(carta: CartaMetadataResponse) {
  return formatEtiqueta(carta.tipoCarta, "Carta");
}

function resolveCartaBadgeLabel(tipoCarta?: string) {
  const normalized = tipoCarta?.trim().toUpperCase() ?? "";

  if (normalized.includes("ACEPTACION")) return "ACEP";
  if (normalized.includes("LIBERACION")) return "LIB";
  return "PDF";
}

export function AlumnoProcesoCartasView({
  proceso,
  cartas,
  firstName,
}: AlumnoProcesoCartasViewProps) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [activeCartaId, setActiveCartaId] = useState<number | null>(null);

  const activeCarta = cartas.find((carta) => carta.idCarta === activeCartaId) ?? null;

  const closeCarta = () => {
    setActiveCartaId(null);
    setActionError(null);
  };

  const downloadCarta = async (carta: CartaMetadataResponse) => {
    const kind = resolveCartaDownloadKind(carta.tipoCarta);

    if (!kind) {
      setActionError("No pudimos identificar el tipo de carta para descargar.");
      return;
    }

    setIsMutating(true);
    setActionError(null);
    await runDownloadAction(
      () => downloadCartaArchivoAction(proceso.idProceso, kind),
      setActionError,
    );
    setIsMutating(false);
  };

  return (
    <AlumnoProcesoLayout
      titleId="alumno-proceso-cartas-title"
      firstName={firstName}
      title="Mis cartas"
      description="Consulta y descarga las cartas emitidas por la dependencia."
      estatus={proceso.estatus}
    >
      {actionError && !activeCarta ? <Alert tone="error">{actionError}</Alert> : null}

      <section className={styles.docSection} aria-label="Cartas del proceso">
        {cartas.length === 0 ? (
          <Alert tone="info" title="Sin cartas por ahora">
            Aún no hay cartas emitidas para tu proceso. Aparecerán aquí cuando la dependencia o la
            delegación las generen.
          </Alert>
        ) : (
          <ul className={styles.fileGrid}>
            {cartas.map((carta) => {
              const label = resolveCartaLabel(carta);
              const tone = estatusTone(carta.estatus);
              const isActive = activeCartaId === carta.idCarta;
              const canDownload = Boolean(resolveCartaDownloadKind(carta.tipoCarta));
              const folio = carta.folio?.trim() || "Sin folio";
              const fecha = formatFecha(carta.fechaEmision) || "Sin fecha";

              return (
                <li key={carta.idCarta}>
                  <button
                    type="button"
                    className={styles.fileCard}
                    data-tone={tone}
                    data-active={isActive || undefined}
                    aria-label={`Ver ${label}`}
                    onClick={() => {
                      setActiveCartaId(carta.idCarta);
                      setActionError(null);
                    }}
                  >
                    <span className={styles.fileCardMenu} aria-hidden="true">
                      <MoreHorizontal size={16} strokeWidth={2} />
                    </span>

                    <span className={styles.fileTypeBadge}>
                      {resolveCartaBadgeLabel(carta.tipoCarta)}
                    </span>

                    <span className={styles.fileName}>{label}</span>
                    <span className={styles.fileMeta}>
                      {folio} · {fecha}
                    </span>

                    <span className={styles.fileStatus}>
                      <EstatusBadge estatus={carta.estatus} />
                    </span>

                    {canDownload ? (
                      <span className={styles.fileActionHint} aria-hidden="true">
                        <Download size={12} strokeWidth={2} />
                        PDF
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <CartaGestionModal
        open={activeCarta !== null}
        carta={activeCarta}
        cartaLabel={activeCarta ? resolveCartaLabel(activeCarta) : ""}
        badgeLabel={activeCarta ? resolveCartaBadgeLabel(activeCarta.tipoCarta) : "PDF"}
        disabled={isMutating}
        canDownload={activeCarta ? Boolean(resolveCartaDownloadKind(activeCarta.tipoCarta)) : false}
        actionError={activeCarta ? actionError : null}
        onClose={closeCarta}
        onDownload={() => {
          if (!activeCarta) return;
          void downloadCarta(activeCarta);
        }}
      />
    </AlumnoProcesoLayout>
  );
}
