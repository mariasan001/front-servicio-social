import type { Metadata } from "next";
import { ResetPasswordPage } from "@/features/auth";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  description:
    "Restablece el acceso a tu cuenta en la plataforma de servicio social del Gobierno del Estado de México.",
  alternates: {
    canonical: "/recuperar-contrasena",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <ResetPasswordPage />;
}
