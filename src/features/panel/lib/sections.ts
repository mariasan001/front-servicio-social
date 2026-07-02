import { type UserRole } from "@/lib/auth/constants";
import { getNavigationForRole } from "../constants/navigation";

export function getRoleSectionSlugs(role: UserRole): readonly string[] {
  const navigation = getNavigationForRole(role);

  if (!navigation) {
    return [];
  }

  return navigation.items.map((item) => item.id);
}

export function isRoleSectionSlug(role: UserRole, value: string): boolean {
  return getRoleSectionSlugs(role).includes(value);
}
