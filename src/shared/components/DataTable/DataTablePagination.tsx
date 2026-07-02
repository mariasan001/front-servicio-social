"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildPageRange } from "./pagination.utils";
import styles from "./DataTablePagination.module.css";

type DataTablePaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

export function DataTablePagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
}: DataTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, totalItems);
  const pageRange = buildPageRange(totalPages, safePage);

  return (
    <nav className={styles.pagination} aria-label="Paginación de la tabla">
      <p className={styles.summary}>
        Mostrando <strong>{start}</strong>–<strong>{end}</strong> de{" "}
        <strong>{totalItems}</strong> {totalItems === 1 ? "registro" : "registros"}
      </p>

      {totalPages > 1 ? (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.navButton}
            aria-label="Página anterior"
            disabled={safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
          >
            <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
          </button>

          <div className={styles.pageList}>
            {pageRange.map((item, index) =>
              item === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className={styles.ellipsis} aria-hidden="true">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  className={[
                    styles.pageButton,
                    item === safePage && styles.pageButtonActive,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-label={`Ir a la página ${item}`}
                  aria-current={item === safePage ? "page" : undefined}
                  onClick={() => onPageChange(item)}
                >
                  {item}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            className={styles.navButton}
            aria-label="Página siguiente"
            disabled={safePage >= totalPages}
            onClick={() => onPageChange(safePage + 1)}
          >
            <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </nav>
  );
}
