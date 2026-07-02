"use client";

import { Inbox, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Button } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { LoadingStateBlock } from "@/shared/components/LoadingState";
import styles from "./DataTable.module.css";
import { resolveColumnWidths } from "./column-widths";
import { DataTablePagination } from "./DataTablePagination";
import { getPageSlice } from "./pagination.utils";

export type DataTableColumnVariant = "primary" | "text" | "status" | "actions";

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
  variant?: DataTableColumnVariant;
};

function columnClassNames<T>(
  column: DataTableColumn<T>,
  base: "headerCell" | "cell",
) {
  const prefix = base === "headerCell" ? styles.headerCell : styles.cell;

  return joinClassNames(
    prefix,
    column.variant === "primary" && styles[`${base}Primary`],
    column.variant === "text" && styles[`${base}Text`],
    column.variant === "status" && styles[`${base}Status`],
    column.variant === "actions" && styles[`${base}Actions`],
    column.align === "right" && styles.alignRight,
    column.align === "center" && styles.alignCenter,
  );
}

type DataTableToolbarProps = {
  children?: ReactNode;
  actions?: ReactNode;
};

type DataTableToolbarActionProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

type DataTableIconActionProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: LucideIcon;
};

type DataTableActionsProps = {
  children: ReactNode;
};

type DataTableShellProps = {
  toolbar?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  fillHeight?: boolean;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  caption?: string;
  toolbar?: ReactNode;
  isLoading?: boolean;
  loadingLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: LucideIcon;
  className?: string;
  fillHeight?: boolean;
  pageSize?: number;
};

const DEFAULT_PAGE_SIZE = 7;

function joinClassNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function DataTableToolbar({ children, actions }: DataTableToolbarProps) {
  return (
    <>
      {children ? <div className={styles.toolbarFilters}>{children}</div> : null}
      {actions ? <div className={styles.toolbarActions}>{actions}</div> : null}
    </>
  );
}

export function DataTableToolbarAction({
  className,
  children,
  ...props
}: DataTableToolbarActionProps) {
  return (
    <Button variant="primary" className={joinClassNames(styles.toolbarAction, className)} {...props}>
      {children}
    </Button>
  );
}

export function DataTableActions({ children }: DataTableActionsProps) {
  return <div className={styles.rowActions}>{children}</div>;
}

export function DataTableIconAction({
  label,
  icon: Icon,
  className,
  ...props
}: DataTableIconActionProps) {
  return (
    <button
      type="button"
      className={joinClassNames(styles.iconAction, className)}
      aria-label={label}
      title={label}
      {...props}
    >
      <Icon size={15} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}

export function DataTableShell({
  toolbar,
  children,
  className,
  bodyClassName,
  fillHeight = false,
}: DataTableShellProps) {
  return (
    <div className={joinClassNames(styles.wrapper, fillHeight && styles.wrapperFill, className)}>
      {toolbar ? <div className={styles.toolbar}>{toolbar}</div> : null}
      <div className={joinClassNames(styles.body, fillHeight && styles.bodyFill, bodyClassName)}>
        {children}
      </div>
    </div>
  );
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  toolbar,
  isLoading = false,
  loadingLabel = "Cargando registros…",
  emptyTitle = "Sin resultados",
  emptyDescription = "No hay registros para mostrar con los filtros actuales.",
  emptyIcon,
  className,
  fillHeight = true,
  pageSize = DEFAULT_PAGE_SIZE,
}: DataTableProps<T>) {
  const EmptyIcon = emptyIcon ?? Inbox;
  const [page, setPage] = useState(1);
  const shouldExpand = fillHeight && (isLoading || rows.length === 0);
  const columnWidths = resolveColumnWidths(columns);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [rows]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedRows = useMemo(() => {
    if (isLoading || rows.length === 0) {
      return [];
    }

    return getPageSlice(rows, safePage, pageSize);
  }, [isLoading, rows, safePage, pageSize]);

  const body = isLoading ? (
    <LoadingStateBlock label={loadingLabel} className={styles.emptyEmbedded} />
  ) : rows.length === 0 ? (
    <EmptyState
      title={emptyTitle}
      description={emptyDescription}
      icon={EmptyIcon}
      embedded
    />
  ) : (
    <table className={styles.table}>
      {caption ? <caption className={styles.caption}>{caption}</caption> : null}
      <colgroup>
        {columns.map((column, index) => (
          <col key={column.id} style={columnWidths[index] ? { width: columnWidths[index] } : undefined} />
        ))}
      </colgroup>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.id} scope="col" className={columnClassNames(column, "headerCell")}>
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {paginatedRows.map((row) => (
          <tr key={rowKey(row)} className={styles.dataRow}>
            {columns.map((column) => (
              <td key={column.id} className={columnClassNames(column, "cell")}>
                {column.cell(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div
      className={joinClassNames(
        styles.wrapper,
        shouldExpand && styles.wrapperFill,
        className,
      )}
      data-table-expand={shouldExpand ? "true" : undefined}
    >
      {toolbar ? <div className={styles.toolbar}>{toolbar}</div> : null}
      <div className={joinClassNames(styles.body, shouldExpand && styles.bodyFill)}>{body}</div>
      {!isLoading && rows.length > 0 ? (
        <DataTablePagination
          page={safePage}
          pageSize={pageSize}
          totalItems={rows.length}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}
