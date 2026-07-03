import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";

type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  note?: ReactNode;
  titleId?: string;
  headingLevel?: 1 | 2;
  className?: string;
  actions?: ReactNode;
};

function joinClassNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function PageHeader({
  title,
  description,
  note,
  titleId,
  headingLevel = 1,
  className,
  actions,
}: PageHeaderProps) {
  const HeadingTag = headingLevel === 1 ? "h1" : "h2";

  return (
    <header className={joinClassNames(styles.header, className)}>
      <div className={styles.headerRow}>
        <div className={styles.headerBody}>
          <HeadingTag id={titleId} className={styles.title}>
            {title}
          </HeadingTag>
          {description ? <p className={styles.description}>{description}</p> : null}
          {note ? <p className={styles.note}>{note}</p> : null}
        </div>
        {actions ? <div className={styles.headerActions}>{actions}</div> : null}
      </div>
      <hr className={styles.divider} aria-hidden="true" />
    </header>
  );
}
