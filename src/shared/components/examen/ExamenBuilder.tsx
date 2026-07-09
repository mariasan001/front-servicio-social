import type { ReactNode } from "react";
import { AlertTriangle, FileQuestion, Plus, Settings2 } from "lucide-react";
import styles from "./Examen.module.css";

type ExamenBuilderProps = {
  children: ReactNode;
};

/** Contenedor de dos paneles (barra lateral + área principal). */
export function ExamenBuilder({ children }: ExamenBuilderProps) {
  return <div className={styles.builder}>{children}</div>;
}

type ExamenBuilderSidebarProps = {
  title: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

export function ExamenBuilderSidebar({
  title,
  action,
  footer,
  children,
}: ExamenBuilderSidebarProps) {
  return (
    <aside className={styles.builderSidebar}>
      <div className={styles.builderSidebarHeader}>
        <p className={styles.builderSidebarTitle}>{title}</p>
        {action ?? null}
      </div>
      <ul className={styles.builderList}>{children}</ul>
      {footer ? (
        <div className={styles.builderSidebarFooter}>{footer}</div>
      ) : null}
    </aside>
  );
}

type ExamenBuilderAddButtonProps = {
  label: string;
  disabled?: boolean;
  onClick: () => void;
};

export function ExamenBuilderAddButton({
  label,
  disabled,
  onClick,
}: ExamenBuilderAddButtonProps) {
  return (
    <button
      type="button"
      className={styles.builderAddButton}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      <Plus size={16} aria-hidden="true" />
    </button>
  );
}

type ExamenBuilderItemProps = {
  number: ReactNode;
  text: ReactNode;
  meta?: ReactNode;
  warn?: boolean;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export function ExamenBuilderItem({
  number,
  text,
  meta,
  warn,
  active,
  disabled,
  onClick,
}: ExamenBuilderItemProps) {
  return (
    <li>
      <button
        type="button"
        disabled={disabled}
        className={[styles.builderItem, active ? styles.builderItemActive : ""]
          .filter(Boolean)
          .join(" ")}
        onClick={onClick}
      >
        {active ? <span className={styles.builderItemAccent} aria-hidden="true" /> : null}
        <span className={styles.builderItemNumber}>{number}</span>
        <span className={styles.builderItemBody}>
          <span className={styles.builderItemText}>{text}</span>
          {meta !== undefined ? (
            <span className={styles.builderItemMeta}>
              {meta}
              {warn ? (
                <AlertTriangle
                  size={13}
                  aria-label="Configuración incompleta"
                  className={styles.builderItemWarn}
                />
              ) : null}
            </span>
          ) : null}
        </span>
      </button>
    </li>
  );
}

type ExamenBuilderEmptyItemProps = {
  children: ReactNode;
};

export function ExamenBuilderEmptyItem({ children }: ExamenBuilderEmptyItemProps) {
  return (
    <li>
      <p className={styles.builderItemMeta}>{children}</p>
    </li>
  );
}

type ExamenBuilderSettingsButtonProps = {
  onClick: () => void;
  title?: string;
  hint?: string;
  active?: boolean;
};

export function ExamenBuilderSettingsButton({
  onClick,
  title = "Datos del examen",
  hint = "Título, puntaje y tiempo",
  active = false,
}: ExamenBuilderSettingsButtonProps) {
  return (
    <button
      type="button"
      className={[styles.builderSettingsButton, active ? styles.builderSettingsButtonActive : ""]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
    >
      <span className={styles.builderSettingsIcon}>
        <Settings2 size={16} aria-hidden="true" />
      </span>
      <span className={styles.builderSettingsText}>
        <span className={styles.builderSettingsTitle}>{title}</span>
        <span className={styles.builderSettingsHint}>{hint}</span>
      </span>
    </button>
  );
}

type ExamenBuilderMainProps = {
  children: ReactNode;
};

export function ExamenBuilderMain({ children }: ExamenBuilderMainProps) {
  return <div className={styles.builderMain}>{children}</div>;
}

type ExamenBuilderPanelTitleProps = {
  children: ReactNode;
};

export function ExamenBuilderPanelTitle({
  children,
}: ExamenBuilderPanelTitleProps) {
  return <h3 className={styles.builderPanelTitle}>{children}</h3>;
}

type ExamenBuilderEmptyProps = {
  children: ReactNode;
};

export function ExamenBuilderEmpty({ children }: ExamenBuilderEmptyProps) {
  return (
    <div className={styles.builderMainEmpty}>
      <FileQuestion size={30} aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}
