import { Alert } from "@/shared/components/Alert";
import styles from "./LandingPublicLoadAlert.module.css";

type LandingPublicLoadAlertProps = {
  message: string;
};

export function LandingPublicLoadAlert({ message }: LandingPublicLoadAlertProps) {
  return (
    <div className={styles.wrap}>
      <Alert tone="error">{message}</Alert>
    </div>
  );
}
