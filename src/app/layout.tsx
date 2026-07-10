import type { Metadata, Viewport } from "next";
import { gotham } from "@/lib/fonts";
import { OG_IMAGE } from "@/lib/seo/og";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { SkipLink } from "@/shared/components/SkipLink";
import { AppToaster } from "@/shared/notifications";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "servicio social",
    "prácticas profesionales",
    "residencias profesionales",
    "Estado de México",
    "Gobierno del Estado de México",
    "vacantes",
    "estudiantes",
  ],
  authors: [{ name: "Gobierno del Estado de México" }],
  creator: "Subdirección de Desarrollo Tecnológico",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  icons: {
    icon: "/images/logo.webp",
    apple: "/images/logo.webp",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6b2340",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={gotham.variable}>
      <body className={gotham.variable}>
        <SkipLink />
        <AppToaster />
        {children}
      </body>
    </html>
  );
}
