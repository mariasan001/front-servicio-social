import type { ReactNode } from "react";
import { RolePanelLayout } from "@/features/panel";
import { USER_ROLES } from "@/lib/auth/constants";

type LayoutProps = {
  children: ReactNode;
};

export default function EnlacePanelLayout({ children }: LayoutProps) {
  return (
    <RolePanelLayout role={USER_ROLES.ENLACE_ESCOLAR}>{children}</RolePanelLayout>
  );
}
