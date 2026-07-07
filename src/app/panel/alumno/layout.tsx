import type { ReactNode } from "react";
import { AlumnoPanelLayout } from "@/features/alumno/components/AlumnoPanelLayout";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return <AlumnoPanelLayout>{children}</AlumnoPanelLayout>;
}
