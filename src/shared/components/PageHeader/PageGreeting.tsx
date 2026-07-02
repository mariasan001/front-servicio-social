import styles from "./PageGreeting.module.css";

type PageGreetingProps = {
  name: string;
  className?: string;
};

function joinClassNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function PageGreeting({ name, className }: PageGreetingProps) {
  return (
    <span className={joinClassNames(styles.greeting, className)}>
      <span className={styles.prefix}>Hola, </span>
      <span className={styles.name}>{name}</span>
    </span>
  );
}
