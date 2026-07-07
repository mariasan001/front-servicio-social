"use client";

import { Download, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { downloadCartaArchivoAction } from "../../actions/proceso.actions";
import type { CartaMetadataResponse, ProcesoDetalleResponse } from "../../types/alumno.types";
import {
  estatusTone,
  formatFecha,
  resolveCartaDownloadKind,
} from "@/lib/domain";
import { runDownloadAction } from "@/lib/utils/download-file";
import { Alert } from "@/shared/components/Alert";
import { notify } from "@/shared/notifications";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import {
  CartaGestionModal,
  resolveCartaBadgeLabel,
  resolveCartaLabel,
} from "@/shared/proceso";
import fileCardStyles from "@/shared/proceso/ProcesoFileCard.module.css";
import { AlumnoProcesoLayout } from "./AlumnoProcesoLayout";
import styles from "./AlumnoProcesoDocumentosView.module.css";

type AlumnoProcesoCartasViewProps = {
  proceso: ProcesoDetalleResponse;
  cartas: CartaMetadataResponse[];
  firstName: string;
};

export function AlumnoProcesoCartasView({
  proceso,
  cartas,
  firstName,
}: AlumnoProcesoCartasViewProps) {
  const [isMutating, setIsMutating] = useState(false);
  const [activeCartaId, setActiveCartaId] = useState<number | null>(null);

  const activeCarta = cartas.find((carta) => carta.idCarta === activeCartaId) ?? null;

  const closeCarta = () => {
    setActiveCartaId(null);
  };

  const downloadCarta = async (carta: CartaMetadataResponse) => {
    const kind = resolveCartaDownloadKind(carta.tipoCarta);

    if (!kind) {
      notify.error("No pudimos identificar el tipo de carta para descargar.");
      return;
    }

    setIsMutating(true);
    await runDownloadAction(
      () => downloadCartaArchivoAction(proceso.idProceso, kind), notify.error,
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

      <section className={styles.docSection} aria-label="Cartas del proceso">
        {cartas.length === 0 ? (
          <Alert tone="info" title="Sin cartas por ahora">
            Aún no hay cartas emitidas para tu proceso. Aparecerán aquí cuando la dependencia o la
            delegación las generen.
          </Alert>
        ) : (
          <ul className={fileCardStyles.fileGrid}>
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
                    className={fileCardStyles.fileCard}
                    data-tone={tone}
                    data-active={isActive || undefined}
                    aria-label={`Ver ${label}`}
                    onClick={() => {
                      setActiveCartaId(carta.idCarta);
                    }}
                  >
                    <span className={fileCardStyles.fileCardMenu} aria-hidden="true">
                      <MoreHorizontal size={16} strokeWidth={2} />
                    </span>

                    <span className={fileCardStyles.fileTypeBadge}>
                      {resolveCartaBadgeLabel(carta.tipoCarta)}
                    </span>

                    <span className={fileCardStyles.fileName}>{label}</span>
                    <span className={fileCardStyles.fileMeta}>
                      {folio} · {fecha}
                    </span>

                    <span className={fileCardStyles.fileStatus}>
                      <EstatusBadge estatus={carta.estatus} />
                    </span>

                    {canDownload ? (
                      <span className={fileCardStyles.fileActionHint} aria-hidden="true">
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
        onClose={closeCarta}
        onDownload={() => {
          if (!activeCarta) return;
          void downloadCarta(activeCarta);
        }}
      />
    </AlumnoProcesoLayout>
  );
}
