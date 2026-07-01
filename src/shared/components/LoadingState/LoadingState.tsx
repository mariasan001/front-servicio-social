import styles from "./LoadingState.module.css";

type LoadingStateProps = {
  label?: string;
  description?: string;
  className?: string;
};

function joinClassNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function LoadingState({
  label = "Cargando…",
  description,
  className,
}: LoadingStateProps) {
  return (
    <div
      className={joinClassNames(styles.loadingState, className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className={styles.spinner} aria-hidden="true" />
      <div className={styles.copy}>
        <p className={styles.label}>{label}</p>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
    </div>
  );
}

export function LoadingStateBlock(props: LoadingStateProps) {
  return (
    <div className={styles.block}>
      <LoadingState {...props} />
    </div>
  );
}
