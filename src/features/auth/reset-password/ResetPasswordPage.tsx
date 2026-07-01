import { AuthLayout } from "../components/AuthLayout/AuthLayout";
import { ResetPasswordFlow } from "./ResetPasswordFlow";

export function ResetPasswordPage() {
  return (
    <AuthLayout backHref="/login" backLabel="Ir a iniciar sesión">
      <ResetPasswordFlow />
    </AuthLayout>
  );
}
