import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import type { UserRole } from "@/lib/auth/constants";
import { hasAnyRole } from "@/lib/auth/roles";
import { requireServerSession } from "@/lib/auth/session.server";
import { PanelLayout } from "../PanelLayout/PanelLayout";

type RolePanelLayoutProps = {
  role: UserRole;
  children: ReactNode;
};

export async function RolePanelLayout({ role, children }: RolePanelLayoutProps) {
  const user = await requireServerSession();

  if (!hasAnyRole(user.roles, [role])) {
    notFound();
  }

  return (
    <PanelLayout user={user} role={role}>
      {children}
    </PanelLayout>
  );
}
