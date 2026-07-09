"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import type { VacanteResponse, ProcesoDetalleResponse } from "../../types/alumno.types";
import { AlumnoVacanteDetailModal } from "./AlumnoVacanteDetailModal";
import { normalizeText } from "@/lib/utils/search";
import { puedePostularVacantes } from "@/lib/domain";
import { buildVacanteTipoColumn, getVacanteTipoLabel } from "@/shared/components/vacante";
import { PANEL_PATHS } from "@/lib/auth/constants";
import { CupoMeter } from "@/shared/components/CupoMeter";
import { DataTable, DataTableActions, DataTableIconAction, DataTableToolbar, type DataTableColumn } from "@/shared/components/DataTable";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

export function AlumnoVacantesView({
  vacantes,
  nombreCompleto,
  procesoActual,
}: {
  vacantes: VacanteResponse[];
  nombreCompleto?: string;
  procesoActual: ProcesoDetalleResponse | null;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<VacanteResponse | null>(null);
  const deferredSearch = useDeferredValue(search);
  const puedePostular = puedePostularVacantes(procesoActual);

  const filtered = useMemo(() => {
    const query = normalizeText(deferredSearch);
    if (!query) return vacantes;
    return vacantes.filter((vacante) => {
      const haystack = [
        vacante.nombre,
        vacante.folio,
        vacante.estatus,
        vacante.areaNombre,
        vacante.dependenciaNombre,
        vacante.modalidadId ? getVacanteTipoLabel(vacante.modalidadId) : "",
      ]
        .filter(Boolean)
        .join(" ");
      return normalizeText(haystack).includes(query);
    });
  }, [deferredSearch, vacantes]);

  const columns: DataTableColumn<VacanteResponse>[] = [
    {
      id: "vacante",
      header: "Vacante",
      width: "28%",
      cell: (vacante) => (
        <div className={styles.nameCell}>
          <strong>{vacante.nombre?.trim() || "Sin nombre"}</strong>
          <span className={styles.nameHint}>{vacante.folio?.trim() || "Sin folio"}</span>
        </div>
      ),
    },
    {
      id: "area",
      header: "Área",
      width: "20%",
      cell: (vacante) => {
        const area = vacante.areaNombre?.trim();
        return area ? (
          <span className={styles.cellTruncate} title={area}>
            {area}
          </span>
        ) : (
          <span className={styles.cellEmpty}>—</span>
        );
      },
    },
    buildVacanteTipoColumn<VacanteResponse>(),
    {
      id: "cupo",
      header: "Cupo",
      align: "center",
      width: "6.75rem",
      cell: (vacante) => (
        <CupoMeter
          variant="slots"
          disponible={vacante.cupoDisponible}
          total={vacante.cupoTotal ?? vacante.cupoDisponible}
        />
      ),
    },
    {
      id: "estatus",
      header: "Estatus",
      align: "center",
      width: "10.25rem",
      cell: (vacante) => <EstatusBadge estatus={vacante.estatus} />,
    },
    {
      id: "acciones",
      header: "Acciones",
      variant: "actions",
      cell: (vacante) => (
        <DataTableActions>
          <DataTableIconAction label="Ver detalle" icon={Eye} onClick={() => setSelected(vacante)} />
        </DataTableActions>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="alumno-vacantes-title">
      <PageHeader
        titleId="alumno-vacantes-title"
        title="Vacantes"
        description="Oportunidades de servicio social y residencia disponibles para postularte."
      />

      {!puedePostular ? (
        <Alert tone="warning" title="Postulaciones bloqueadas">
          Tienes un proceso de servicio social en curso
          {procesoActual?.vacanteNombre ? (
            <>
              {" "}
              (<strong>{procesoActual.vacanteNombre}</strong>)
            </>
          ) : null}
          . Mientras esté vigente no puedes postularte a nuevas vacantes.{" "}
          <Link href={`${PANEL_PATHS.alumno}/proceso`}>Ir a mi proceso</Link>.
        </Alert>
      ) : null}

      <DataTable
        toolbar={
          <DataTableToolbar>
            <label className={styles.searchField}>
              <span className={styles.searchLabel}>Buscar vacante</span>
              <span className={styles.searchControl}>
                <Search size={18} aria-hidden="true" className={styles.searchIcon} />
                <input
                  type="search"
                  className={styles.searchInput}
                  value={search}
                  placeholder="Nombre, folio o área"
                  onChange={(event) => setSearch(event.target.value)}
                />
              </span>
            </label>
          </DataTableToolbar>
        }
        columns={columns}
        rows={filtered}
        rowKey={(vacante) => vacante.idVacante}
        caption="Vacantes disponibles"
        emptyTitle="No hay vacantes disponibles"
        emptyDescription="Cuando existan vacantes publicadas, podrás consultarlas y postularte aquí."
      />
      <AlumnoVacanteDetailModal
        open={selected !== null}
        vacanteId={selected?.idVacante ?? null}
        vacanteName={selected?.nombre}
        nombreCompleto={nombreCompleto}
        procesoActual={procesoActual}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
