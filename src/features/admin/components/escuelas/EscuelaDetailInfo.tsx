"use client";

import { GraduationCap } from "lucide-react";
import type { EscuelaDetalleResponse } from "../../types/escuela.types";
import { formatFecha } from "./escuela-labels";
import { DetailModalHero } from "@/shared/components/DetailModal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import detailStyles from "@/shared/styles/DetailModal.module.css";

type EscuelaDetailInfoProps = {
  escuela: EscuelaDetalleResponse;
};

export function EscuelaDetailInfo({ escuela }: EscuelaDetailInfoProps) {
  const nombreCorto = escuela.nombreCorto?.trim();
  const clave = escuela.clave?.trim();

  return (
    <>
      <DetailModalHero
        icon={GraduationCap}
        title={nombreCorto || escuela.nombreOficial}
        subtitle={clave ? `Clave ${clave}` : escuela.municipio?.trim() || "Sin municipio registrado"}
        badges={
          <>
            <EstatusBadge estatus={escuela.estatus} fallback="Sin estatus" />
            <EstatusBadge estatus={escuela.convenioEstatus} fallback="Sin convenio" />
          </>
        }
      />

      <dl className={detailStyles.metaList}>
        <div className={detailStyles.metaRow}>
          <dt>Institución</dt>
          <dd>{escuela.nombreOficial}</dd>
        </div>
        <div className={detailStyles.metaRow}>
          <dt>Municipio</dt>
          <dd>{escuela.municipio?.trim() || "Sin municipio registrado"}</dd>
        </div>
        <div className={detailStyles.metaRow}>
          <dt>Correo de contacto</dt>
          <dd>{escuela.correoContacto?.trim() || "Sin correo registrado"}</dd>
        </div>
        <div className={detailStyles.metaRow}>
          <dt>Teléfono</dt>
          <dd>{escuela.telefono?.trim() || "Sin teléfono registrado"}</dd>
        </div>
        <div className={detailStyles.metaRow}>
          <dt>Clave de registro</dt>
          <dd>{clave || "Sin clave registrada"}</dd>
        </div>
        <div className={detailStyles.metaRow}>
          <dt>Domicilio</dt>
          <dd>{escuela.domicilio?.trim() || "Sin domicilio registrado"}</dd>
        </div>
        <div className={detailStyles.metaRow}>
          <dt>Última actualización</dt>
          <dd>{formatFecha(escuela.fechaActualizacion ?? escuela.fechaCreacion)}</dd>
        </div>
      </dl>
    </>
  );
}
