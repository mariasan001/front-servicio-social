"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { AUTH_ROUTES } from "@/features/auth/constants/routes";
import { MODALIDAD_CATALOGO_OPTIONS } from "@/lib/domain/modalidad";
import { MODALIDAD_TRABAJO_OPTIONS } from "@/lib/domain/vacante";
import { Button } from "@/shared/components/Button";
import { ArrowLeft, Briefcase, Search } from "@/shared/icons";
import { PUBLIC_VACANTES_ROUTES } from "../../constants/routes";
import {
  EMPTY_PUBLIC_VACANTES_FILTERS,
  filterPublishedVacantes,
  getDependenciaFilterOptions,
  hasActivePublicVacantesFilters,
} from "../../lib/public-vacantes-filter";
import type { PublicVacanteResponse } from "../../types/public-vacante.types";
import { LandingVacancyPreviewCard } from "../LandingVacancies/LandingVacancyPreviewCard";
import { LandingSectionHeader } from "../LandingSectionHeader/LandingSectionHeader";
import headerStyles from "../LandingSectionHeader/LandingSectionHeader.module.css";
import styles from "./PublicVacantesDirectory.module.css";

type PublicVacantesDirectoryProps = {
  vacantes: PublicVacanteResponse[];
};

export function PublicVacantesDirectory({ vacantes }: PublicVacantesDirectoryProps) {
  const [filters, setFilters] = useState(EMPTY_PUBLIC_VACANTES_FILTERS);
  const deferredQuery = useDeferredValue(filters.query);
  const deferredFilters = useMemo(
    () => ({ ...filters, query: deferredQuery }),
    [filters, deferredQuery],
  );

  const dependenciaOptions = useMemo(
    () => getDependenciaFilterOptions(vacantes),
    [vacantes],
  );

  const filteredVacantes = useMemo(
    () => filterPublishedVacantes(vacantes, deferredFilters),
    [vacantes, deferredFilters],
  );

  const hasFilters = hasActivePublicVacantesFilters(filters);
  const totalCount = vacantes.length;
  const visibleCount = filteredVacantes.length;
  const resultsText = hasFilters
    ? `${visibleCount} de ${totalCount} vacantes`
    : `${totalCount} ${totalCount === 1 ? "vacante publicada" : "vacantes publicadas"}`;

  const modalidadTitle =
    MODALIDAD_CATALOGO_OPTIONS.find((option) => option.value === filters.modalidadId)
      ?.label ?? "Todas las modalidades";

  const trabajoTitle =
    MODALIDAD_TRABAJO_OPTIONS.find((option) => option.value === filters.modalidadTrabajo)
      ?.label ?? "Todas las modalidades de trabajo";

  const dependenciaTitle =
    dependenciaOptions.find((option) => option.value === filters.dependenciaId)?.label ??
    "Todas las dependencias";

  function updateFilter<Key extends keyof typeof filters>(key: Key, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function clearFilters() {
    setFilters(EMPTY_PUBLIC_VACANTES_FILTERS);
  }

  return (
    <section className={styles.section}>
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.topRow}>
            <Link href={AUTH_ROUTES.home} className={styles.backLink}>
              <ArrowLeft size={16} strokeWidth={2} />
              Volver al inicio
            </Link>
            {totalCount > 0 ? (
              <p className={styles.resultsMeta}>{resultsText}</p>
            ) : null}
          </div>

          <LandingSectionHeader
            className={styles.directoryHeader}
            copyClassName={styles.directoryCopy}
            eyebrow="Oportunidades"
            title={
              <>
                Directorio de{" "}
                <span className={headerStyles.titleAccent}>vacantes</span>
              </>
            }
            intro="Vacantes publicadas con cupo disponible en dependencias del Gobierno del Estado de México."
            titleAs="h1"
          />
        </header>

        {totalCount > 0 ? (
          <div className={styles.filtersBar} aria-label="Filtrar vacantes">
            <div className={styles.searchWrap}>
              <label className="sr-only" htmlFor="vacantes-buscar">
                Buscar vacantes
              </label>
              <Search className={styles.searchIcon} size={18} strokeWidth={2} aria-hidden />
              <input
                id="vacantes-buscar"
                className={styles.searchInput}
                type="search"
                value={filters.query}
                placeholder="Buscar vacante, dependencia o área"
                onChange={(event) => updateFilter("query", event.target.value)}
              />
            </div>

            <div className={styles.filterField}>
              <label className="sr-only" htmlFor="vacantes-modalidad">
                Modalidad
              </label>
              <select
                id="vacantes-modalidad"
                className={styles.filterSelect}
                value={filters.modalidadId}
                title={modalidadTitle}
                onChange={(event) => updateFilter("modalidadId", event.target.value)}
              >
                <option value="">Modalidad: todas</option>
                {MODALIDAD_CATALOGO_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterField}>
              <label className="sr-only" htmlFor="vacantes-trabajo">
                Modalidad de trabajo
              </label>
              <select
                id="vacantes-trabajo"
                className={styles.filterSelect}
                value={filters.modalidadTrabajo}
                title={trabajoTitle}
                onChange={(event) => updateFilter("modalidadTrabajo", event.target.value)}
              >
                <option value="">Trabajo: todos</option>
                {MODALIDAD_TRABAJO_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {dependenciaOptions.length > 0 ? (
              <div className={styles.filterField}>
                <label className="sr-only" htmlFor="vacantes-dependencia">
                  Dependencia
                </label>
                <select
                  id="vacantes-dependencia"
                  className={styles.filterSelect}
                  value={filters.dependenciaId}
                  title={dependenciaTitle}
                  onChange={(event) => updateFilter("dependenciaId", event.target.value)}
                >
                  <option value="">Dependencia: todas</option>
                  {dependenciaOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {hasFilters ? (
              <Button
                type="button"
                variant="outline"
                className={styles.clearBtn}
                onClick={clearFilters}
              >
                Limpiar
              </Button>
            ) : null}
          </div>
        ) : null}

        {totalCount === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon} aria-hidden>
              <Briefcase size={28} strokeWidth={1.75} />
            </span>
            <p>No hay vacantes publicadas en este momento.</p>
            <Button href={AUTH_ROUTES.register} variant="primary">
              Crear cuenta
            </Button>
          </div>
        ) : visibleCount === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay vacantes que coincidan con los filtros seleccionados.</p>
            <Button type="button" variant="outline" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <ul className={styles.grid} aria-label="Listado de vacantes">
            {filteredVacantes.map((vacante, index) => (
              <li key={vacante.idVacante} className={styles.gridItem}>
                <LandingVacancyPreviewCard
                  vacante={vacante}
                  index={index}
                  href={PUBLIC_VACANTES_ROUTES.detail(vacante.idVacante)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
