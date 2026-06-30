import AuthShell from "@/features/auth/components/AuthShell";

import ResetAside from "./ResetAside";
import ResetEmailForm from "./ResetEmailForm";

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <ResetAside />
      <ResetEmailForm />
    </AuthShell>
  );
}
