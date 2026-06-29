import type { Metadata } from "next";
import { LandingPage } from "@/features/landing";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

export default function Home() {
  return <LandingPage />;
}
