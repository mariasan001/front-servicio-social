"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import type { VacanteResponse } from "../../types/alumno.types";
import { AlumnoVacanteDetailModal } from "./AlumnoVacanteDetailModal";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { normalizeText } from "@/lib/utils/search";
import { CupoMeter } from "@/shared/components/CupoMeter";
import { DataTable, DataTableActions, DataTableIconAction, DataTableToolbar, type DataTableColumn } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

export function AlumnoVacantesView({
  vacantes,
  nombreCompleto,
}: {
  vacantes: VacanteResponse[];
  nombreCompleto?: string;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<VacanteResponse | null>(null);
  const deferredSearch = useDeferredValue(search);

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
      width: "22%",
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
    {
      id: "cupo",
      header: "Cupo",
      width: "12%",
      cell: (vacante) => (
        <CupoMeter
          variant="compact"
          disponible={vacante.cupoDisponible}
          total={vacante.cupoTotal ?? vacante.cupoDisponible}
        />
      ),
    },
    {
      id: "estatus",
      header: "Estatus",
      align: "center",
      cell: (vacante) => (
        <StatusBadge variant="dot" tone={estatusTone(vacante.estatus)}>
          {formatEtiqueta(vacante.estatus, "Sin estatus")}
        </StatusBadge>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      align: "right",
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
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
