import { AuthLayout } from "../components/AuthLayout/AuthLayout";
import { RegisterForm } from "./RegisterForm";

type RegisterPageProps = {
  token?: string;
};

export function RegisterPage({ token }: RegisterPageProps) {
  return (
    <AuthLayout wide backHref="/login" backLabel="Ir a iniciar sesión">
      <RegisterForm token={token} />
    </AuthLayout>
  );
}
