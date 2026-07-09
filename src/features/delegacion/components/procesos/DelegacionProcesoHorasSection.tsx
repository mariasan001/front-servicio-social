"use client";

import { DocumentoUploadField } from "@/shared/proceso";
import { tieneHorasRequeridas } from "@/lib/domain/proceso";
import { Alert } from "@/shared/components/Alert";
import { notify } from "@/shared/notifications";
import { Button } from "@/shared/components/Button";
import { FormField, TextInput } from "@/shared/components/Form";
import { DetailModalHero } from "@/shared/components/DetailModal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import detailStyles from "@/shared/styles/DetailModal.module.css";
import sectionStyles from "@/shared/styles/DetailModalSections.module.css";
import { UserRound } from "lucide-react";
import type { ProcesoResponse } from "../../types/delegacion.types";

type DelegacionProcesoHorasSectionProps = {
  proceso: ProcesoResponse;
  alumnoNombre?: string;
  vacanteNombre?: string;
  folio?: string;
  horasLabel: string;
  showActivacionForm: boolean;
  canEditHoras: boolean;
  horasRequeridas: string;
  cartaAceptacionFile: File | null;
  isMutating: boolean;
  onHorasRequeridasChange: (value: string) => void;
  onCartaAceptacionFileChange: (file: File | null) => void;
  onGuardarHoras: () => void;
};

export function DelegacionProcesoHorasSection({
  proceso,
  alumnoNombre,
  vacanteNombre,
  folio,
  horasLabel,
  showActivacionForm,
  canEditHoras,
  horasRequeridas,
  cartaAceptacionFile,
  isMutating,
  onHorasRequeridasChange,
  onCartaAceptacionFileChange,
  onGuardarHoras,
}: DelegacionProcesoHorasSectionProps) {
  if (showActivacionForm) {
    return (
      <>
        <DetailModalHero
          icon={UserRound}
          title={alumnoNombre || "Sin alumno registrado"}
          subtitle={vacanteNombre || folio || `Proceso #${proceso.idProceso}`}
          badges={<EstatusBadge estatus={proceso.estatus} />}
        />

        <dl className={detailStyles.metaList}>
          <div className={detailStyles.metaRow}>
            <dt>Avance de horas</dt>
            <dd>{horasLabel}</dd>
          </div>
        </dl>

        <section className={detailStyles.contentPanel} aria-labelledby="activar-alumno-title">
          <div className={detailStyles.panelHeader}>
            <h3 id="activar-alumno-title" className={detailStyles.panelTitle}>
              Horas y carta de aceptación
            </h3>
            <p className={detailStyles.panelDescription}>
              Define las horas del servicio social y activa al alumno. El sistema puede generar la
              carta de aceptación en PDF por ti; subir un archivo solo es necesario si ya tienes la
              carta firmada.
            </p>
          </div>

          <Alert tone="info">
            Guardar horas no activa al alumno. Con «Activar y generar carta» el sistema emite un PDF
            genérico de aceptación. Sube un archivo solo si ya tienes la carta firmada.
          </Alert>

          <TextInput
            id="horas-activacion"
            label="Horas requeridas de servicio social"
            type="number"
            min={1}
            required
            value={horasRequeridas}
            onChange={(event) => onHorasRequeridasChange(event.target.value)}
            hint={
              tieneHorasRequeridas(proceso.horasRequeridas)
                ? "Puedes actualizar el valor antes de activar."
                : "Ejemplo: 480 horas según el plan de estudios."
            }
          />

          <FormField
            id="carta-aceptacion-archivo"
            label="Carta firmada (solo si ya la tienes)"
            hint="Opcional. Si no adjuntas nada, al activar se generará el PDF automáticamente."
          >
            <DocumentoUploadField
              documentoLabel="Carta de aceptación"
              selectedFile={cartaAceptacionFile}
              disabled={isMutating}
              canUpload
              canDownload={false}
              showActions={false}
              onFileSelect={onCartaAceptacionFileChange}
              onInvalidFile={notify.error}
              onUpload={() => {}}
              onDownload={() => {}}
            />
          </FormField>
        </section>
      </>
    );
  }

  if (canEditHoras) {
    return (
      <div className={sectionStyles.registerPanel} aria-label="Horas requeridas">
        <div className={sectionStyles.registerPanelHeader}>
          <h3 className={sectionStyles.registerPanelTitle}>Horas requeridas</h3>
          <p className={sectionStyles.registerPanelDescription}>
            Actualiza el total de horas que el alumno debe cumplir.
          </p>
        </div>

        <TextInput
          id="horas-req"
          label="Horas requeridas"
          type="number"
          min={1}
          value={horasRequeridas}
          onChange={(event) => onHorasRequeridasChange(event.target.value)}
        />

        <div className={sectionStyles.registerPanelActions}>
          <Button
            type="button"
            variant="success"
            disabled={isMutating || !horasRequeridas.trim()}
            onClick={() => void onGuardarHoras()}
          >
            {isMutating ? "Guardando…" : "Guardar horas requeridas"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <p className={sectionStyles.emptyHint}>
      Las horas requeridas ya están definidas o el proceso no admite cambios en este momento.
    </p>
  );
}
