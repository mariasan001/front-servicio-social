import { AuthLayout } from "../components/AuthLayout/AuthLayout";
import { ResetPasswordTokenForm } from "./ResetPasswordTokenForm";

type ResetPasswordTokenPageProps = {
  token?: string;
};

export function ResetPasswordTokenPage({ token }: ResetPasswordTokenPageProps) {
  return (
    <AuthLayout variant="reset" backHref="/login" backLabel="Ir a iniciar sesión">
      <ResetPasswordTokenForm token={token} />
    </AuthLayout>
  );
}
