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
  const label = formatEtiqueta(estatus, fallback);

  return (
    <StatusBadge
      tone={estatusTone(estatus)}
      icon={variant === "pill" ? estatusBadgeIcon(estatus) : undefined}
      variant={variant === "dot" ? "dot" : "label"}
      className={className}
    >
      {label}
    </StatusBadge>
  );
}
