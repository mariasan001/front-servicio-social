import { requireServerSession, redirectToRoleHome } from "@/lib/auth/session.server";

export default async function PanelIndexPage() {
  const session = await requireServerSession();
  await redirectToRoleHome(session);
}
