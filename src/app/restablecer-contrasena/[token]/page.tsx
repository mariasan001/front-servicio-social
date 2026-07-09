import type { Metadata } from "next";
import { ResetPasswordTokenPage } from "@/features/auth";

export const metadata: Metadata = {
  title: "Restablecer contraseña",
  description:
    "Define una nueva contraseña para tu cuenta en la plataforma de servicio social del Gobierno del Estado de México.",
  alternates: {
    canonical: "/restablecer-contrasena",
  },
  robots: {
    index: false,
    follow: false,
  },
};

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function Page({ params }: PageProps) {
  const { token } = await params;

  return <ResetPasswordTokenPage token={decodeURIComponent(token)} />;
}
