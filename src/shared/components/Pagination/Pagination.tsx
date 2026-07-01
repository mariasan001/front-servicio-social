"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Pagination.module.css";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalElements?: number;
  pageSize?: number;
  className?: string;
};

function joinClassNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function buildPageList(page: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index);
  }

  const pages = new Set<number>([0, totalPages - 1, page]);

  for (let offset = -1; offset <= 1; offset += 1) {
    const candidate = page + offset;
    if (candidate >= 0 && candidate < totalPages) {
      pages.add(candidate);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  totalElements,
  pageSize,
  className,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = buildPageList(page, totalPages);
  const summary =
    typeof totalElements === "number" && typeof pageSize === "number"
      ? `${totalElements} registros · página ${page + 1} de ${totalPages}`
      : `Página ${page + 1} de ${totalPages}`;

  return (
    <nav
      className={joinClassNames(styles.pagination, className)}
      aria-label="Paginación"
    >
      <p className={styles.summary}>{summary}</p>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.control}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 0}
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>

        {pages.map((pageIndex, index, list) => {
          const previous = list[index - 1];
          const showEllipsis = previous !== undefined && pageIndex - previous > 1;

          return (
            <span key={pageIndex} className={styles.pageGroup}>
              {showEllipsis ? <span className={styles.ellipsis}>…</span> : null}
              <button
                type="button"
                className={joinClassNames(
                  styles.pageButton,
                  pageIndex === page && styles.pageButtonActive,
                )}
                onClick={() => onPageChange(pageIndex)}
                aria-current={pageIndex === page ? "page" : undefined}
              >
                {pageIndex + 1}
              </button>
            </span>
          );
        })}

        <button
          type="button"
          className={styles.control}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          aria-label="Página siguiente"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
