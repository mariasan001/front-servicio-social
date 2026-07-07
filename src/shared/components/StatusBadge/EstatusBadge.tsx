import { estatusBadgeIcon, estatusTone, formatEtiqueta } from "@/lib/domain";
import { StatusBadge, type StatusBadgeVariant } from "./StatusBadge";

type EstatusBadgeProps = {
  estatus?: string;
  className?: string;
  variant?: StatusBadgeVariant;
  fallback?: string;
};

export function EstatusBadge({
  estatus,
  className,
  variant = "pill",
  fallback = "Sin información",
}: EstatusBadgeProps) {
  const hasEstatus = Boolean(estatus?.trim());
  const label = formatEtiqueta(estatus, fallback);

  return (
    <StatusBadge
      tone={hasEstatus ? estatusTone(estatus) : "neutral"}
      icon={
        variant === "pill"
          ? hasEstatus
            ? estatusBadgeIcon(estatus)
            : "draft"
          : undefined
      }
      variant={variant === "dot" ? "dot" : "label"}
      className={className}
    >
      {label}
    </StatusBadge>
  );
}
