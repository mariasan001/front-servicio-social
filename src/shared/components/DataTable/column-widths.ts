import type { DataTableColumn } from "./DataTable";

const STATUS_WIDTH = "14rem";
const ACTIONS_WIDTH = "5.5rem";

export function resolveColumnWidths<T>(columns: DataTableColumn<T>[]) {
  const textCount = columns.filter((column) => column.variant === "text").length;
  const statusCount = columns.filter((column) => column.variant === "status").length;
  const actionsCount = columns.filter((column) => column.variant === "actions").length;

  const fixedRem = statusCount * 4.75 + actionsCount * 5.5;
  const reservedPercent = statusCount * 8 + actionsCount * 6;
  const textPercent =
    textCount > 0
      ? Math.max(14, Math.min(22, (100 - reservedPercent - 36) / textCount))
      : 0;
  const primaryPercent =
    textCount > 0 ? Math.max(28, 100 - reservedPercent - textPercent * textCount) : 42;

  return columns.map((column) => {
    if (column.width) {
      return column.width;
    }

    switch (column.variant) {
      case "primary":
        return textCount > 0 ? `${primaryPercent}%` : `calc(100% - ${fixedRem}rem)`;
      case "text":
        return `${textPercent}%`;
      case "status":
        return STATUS_WIDTH;
      case "actions":
        return ACTIONS_WIDTH;
      default:
        return undefined;
    }
  });
}
