import type { Metadata } from "next";
import { RegisterPage } from "@/features/auth";

export const metadata: Metadata = {
  title: "Registro de estudiantes",
  description:
    "Crea tu cuenta en la plataforma de servicio social del Gobierno del Estado de México.",
  robots: {
    index: false,
    follow: false,
  },
};

type PageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ next?: string }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { token } = await params;
  const { next } = await searchParams;

  return <RegisterPage token={token} nextPath={next} />;
}
