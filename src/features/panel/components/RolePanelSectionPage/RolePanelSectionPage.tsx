import { notFound } from "next/navigation";
import type { UserRole } from "@/lib/auth/constants";
import {
  getNavigationForRole,
  isValidPanelSection,
  resolvePanelNavItem,
} from "../../constants/navigation";
import { PanelContent } from "../PanelContent/PanelContent";

type RolePanelSectionPageProps = {
  role: UserRole;
  section?: string[];
};

export function RolePanelSectionPage({
  role,
  section,
}: RolePanelSectionPageProps) {
  const navigation = getNavigationForRole(role);
  const sectionSlug = section?.[0];

  if (!navigation || !isValidPanelSection(role, sectionSlug)) {
    notFound();
  }

  const navItem = resolvePanelNavItem(role, sectionSlug);

  if (!navItem) {
    notFound();
  }

  return (
    <PanelContent
      roleLabel={navigation.label}
      title={navItem.label}
      description={navItem.description}
    />
  );
}
