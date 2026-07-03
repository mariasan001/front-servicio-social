import styles from "./CupoMeter.module.css";

type CupoMeterTone = "success" | "warning" | "danger" | "neutral";

type CupoMeterProps = {
  disponible?: number;
  total?: number;
  variant?: "compact" | "detail" | "slots";
  className?: string;
};

function resolveCupo(disponible?: number, total?: number) {
  const hasDisponible = typeof disponible === "number" && Number.isFinite(disponible);
  const hasTotal = typeof total === "number" && Number.isFinite(total) && total > 0;

  if (!hasDisponible && !hasTotal) {
    return null;
  }

  const safeTotal = hasTotal ? total : hasDisponible ? disponible : 0;
  const safeDisponible = hasDisponible ? Math.max(0, disponible) : 0;
  const ocupado = Math.max(0, safeTotal - safeDisponible);
  const ratio = safeTotal > 0 ? safeDisponible / safeTotal : 0;

  return {
    disponible: safeDisponible,
    total: safeTotal,
    ocupado,
    ratio,
  };
}

function resolveTone(ratio: number, disponible: number): CupoMeterTone {
  if (disponible <= 0) {
    return "danger";
  }

  if (ratio <= 0.25) {
    return "warning";
  }

  return "success";
}

const FILL_TONE_CLASS: Record<CupoMeterTone, string> = {
  success: styles.fillSuccess,
  warning: styles.fillWarning,
  danger: styles.fillDanger,
  neutral: styles.fillNeutral,
};

function joinClassNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function formatLibres(disponible: number) {
  return disponible === 1 ? "1 libre" : `${disponible} libres`;
}

export function CupoMeter({
  disponible,
  total,
  variant = "compact",
  className,
}: CupoMeterProps) {
  const cupo = resolveCupo(disponible, total);

  if (!cupo) {
    return <span className={styles.hint}>Sin cupo</span>;
  }

  const tone = resolveTone(cupo.ratio, cupo.disponible);
  const fillPercent = cupo.total > 0 ? Math.round((cupo.disponible / cupo.total) * 100) : 0;

  if (variant === "slots") {
    const maxVisibleSlots = 12;
    const showSlots = cupo.total > 0 && cupo.total <= maxVisibleSlots;

    return (
      <div
        className={joinClassNames(styles.slotsMeter, className)}
        role="img"
        aria-label={`${cupo.disponible} lugares libres de ${cupo.total}`}
      >
        <div className={styles.slotsInline}>
          {showSlots ? (
            <div className={styles.slotsRow} aria-hidden="true">
              {Array.from({ length: cupo.total }, (_, index) => (
                <span
                  key={index}
                  className={joinClassNames(
                    styles.slot,
                    index < cupo.ocupado ? styles.slotTaken : styles.slotFree,
                  )}
                />
              ))}
            </div>
          ) : (
            <div className={styles.track}>
              <div
                className={joinClassNames(styles.fill, FILL_TONE_CLASS[tone])}
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          )}

          <span className={styles.slotsValue}>
            {cupo.disponible}/{cupo.total}
          </span>
        </div>

        <p className={styles.slotsHint}>
          {cupo.disponible > 0 ? formatLibres(cupo.disponible) : "Completo"}
        </p>
      </div>
    );
  }

  return (
    <div
      className={joinClassNames(styles.meter, variant === "compact" && styles.meterCompact, className)}
      role="img"
      aria-label={`${cupo.disponible} lugares libres de ${cupo.total}`}
    >
      <div className={styles.labelRow}>
        <p className={styles.value}>
          {cupo.disponible}/{cupo.total}
        </p>
      </div>

      <div className={joinClassNames(styles.track, variant === "detail" && styles.trackDetail)}>
        <div
          className={joinClassNames(styles.fill, FILL_TONE_CLASS[tone])}
          style={{ width: `${fillPercent}%` }}
        />
      </div>

      {variant === "detail" ? (
        <p className={styles.hint}>
          {cupo.disponible > 0
            ? `${formatLibres(cupo.disponible)} · ${cupo.ocupado} ocupados`
            : "Cupo completo"}
        </p>
      ) : (
        <p className={styles.hint}>
          {cupo.disponible > 0 ? formatLibres(cupo.disponible) : "Completo"}
        </p>
      )}
    </div>
  );
}
