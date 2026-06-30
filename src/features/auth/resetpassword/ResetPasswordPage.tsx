import { AuthShell } from "@/features/auth/components/AuthShell";
import { ResetAside } from "./ResetAside";
import { ResetPasswordFlow } from "./ResetPasswordFlow";

export function ResetPasswordPage() {
  return (
    <AuthShell>
      <ResetAside />
      <ResetPasswordFlow />
    </AuthShell>
  );
}
