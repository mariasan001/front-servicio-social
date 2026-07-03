import styles from "./StatusBadge.module.css";

export type StatusBadgeIconKind = "draft" | "progress" | "review" | "done" | "cancelled";

type StatusBadgeIconProps = {
  kind: StatusBadgeIconKind;
};

export function StatusBadgeIcon({ kind }: StatusBadgeIconProps) {
  switch (kind) {
    case "draft":
      return (
        <svg viewBox="0 0 16 16" className={styles.iconSvg} aria-hidden="true">
          <circle
            cx="8"
            cy="8"
            r="6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="2.5 2"
          />
        </svg>
      );
    case "progress":
      return (
        <svg viewBox="0 0 16 16" className={styles.iconSvg} aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
          <path d="M8 1.5 A6.5 6.5 0 0 1 14.5 8 L8 8 Z" fill="currentColor" />
        </svg>
      );
    case "review":
      return (
        <svg viewBox="0 0 16 16" className={styles.iconSvg} aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
          <path d="M8 8 L8 1.5 A6.5 6.5 0 0 1 14.5 8 Z" fill="currentColor" />
        </svg>
      );
    case "done":
      return (
        <svg viewBox="0 0 16 16" className={styles.iconSvg} aria-hidden="true">
          <circle cx="8" cy="8" r="7" fill="currentColor" />
          <path
            d="M5.25 8 L7.1 9.85 L10.85 6.1"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "cancelled":
      return (
        <svg viewBox="0 0 16 16" className={styles.iconSvg} aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
          <path
            d="M5.5 5.5 L10.5 10.5 M10.5 5.5 L5.5 10.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return null;
  }
}
