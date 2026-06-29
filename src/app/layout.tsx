import type { Metadata } from "next";
import { gotham } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Servicio Social",
  description:
    "Plataforma institucional para la gestión y seguimiento del servicio social.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={gotham.variable}>
      <body>{children}</body>
    </html>
  );
}
