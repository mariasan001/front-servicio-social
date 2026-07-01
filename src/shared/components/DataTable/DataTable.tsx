import type { ReactNode } from "react";
import { EmptyState } from "@/shared/components/EmptyState";
import { LoadingStateBlock } from "@/shared/components/LoadingState";
import styles from "./DataTable.module.css";

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: "left" | "right";
  width?: string;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  caption?: string;
  isLoading?: boolean;
  loadingLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
};

function joinClassNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  isLoading = false,
  loadingLabel = "Cargando registros…",
  emptyTitle = "Sin resultados",
  emptyDescription = "No hay registros para mostrar con los filtros actuales.",
  className,
}: DataTableProps<T>) {
  if (isLoading) {
    return <LoadingStateBlock label={loadingLabel} className={className} />;
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        className={className}
      />
    );
  }

  return (
    <div className={joinClassNames(styles.wrapper, className)}>
      <table className={styles.table}>
        {caption ? <caption className={styles.caption}>{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={joinClassNames(
                  styles.headerCell,
                  column.align === "right" && styles.alignRight,
                )}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td
                  key={column.id}
                  className={joinClassNames(
                    styles.cell,
                    column.align === "right" && styles.alignRight,
                  )}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
