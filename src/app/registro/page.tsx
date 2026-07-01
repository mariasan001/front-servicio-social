import type { Metadata } from "next";
import { RegisterPage } from "@/features/auth";

export const metadata: Metadata = {
  title: "Registro de estudiantes",
  description:
    "Crea tu cuenta en la plataforma de servicio social del Gobierno del Estado de México.",
  alternates: {
    canonical: "/registro",
  },
  robots: {
    index: false,
    follow: false,
  },
};

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  return <RegisterPage token={params.token} />;
}
