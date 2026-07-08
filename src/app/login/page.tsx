import type { Metadata } from "next";
import { LoginPage } from "@/features/auth";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description:
    "Accede a la plataforma de servicio social del Gobierno del Estado de México.",
  alternates: {
    canonical: "/login",
  },
  robots: {
    index: false,
    follow: false,
  },
};

type PageProps = {
  searchParams: Promise<{ next?: string; registered?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <LoginPage
      nextPath={params.next}
      justRegistered={params.registered === "1"}
    />
  );
}
