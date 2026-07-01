import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";

type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: string;
  note?: ReactNode;
  titleId?: string;
  headingLevel?: 1 | 2;
  className?: string;
};

function joinClassNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function PageHeader({
  title,
  description,
  eyebrow,
  note,
  titleId,
  headingLevel = 1,
  className,
}: PageHeaderProps) {
  const HeadingTag = headingLevel === 1 ? "h1" : "h2";

  return (
    <header className={joinClassNames(styles.header, className)}>
      {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
      <HeadingTag id={titleId} className={styles.title}>
        {title}
      </HeadingTag>
      {description ? <p className={styles.description}>{description}</p> : null}
      {note ? <p className={styles.note}>{note}</p> : null}
    </header>
  );
}
