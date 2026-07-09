import Link from "next/link";
import { StatusPage } from "@/shared/components/StatusPage/StatusPage";
import styles from "@/shared/components/StatusPage/StatusPage.module.css";

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="Página no encontrada"
      message="La ruta que buscas no existe o ya no está disponible. Revisa la dirección o regresa al inicio."
      primaryAction={
        <Link href="/login" className={styles.primaryAction}>
          Iniciar sesión
        </Link>
      }
    />
  );
}
