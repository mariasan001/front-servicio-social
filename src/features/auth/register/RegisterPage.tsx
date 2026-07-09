import { AuthLayout } from "../components/AuthLayout/AuthLayout";
import { AUTH_ROUTES } from "../constants/routes";
import { isSafeInternalPath } from "@/lib/auth/roles";
import { RegisterForm } from "./RegisterForm";

type RegisterPageProps = {
  token?: string;
  nextPath?: string;
};

function buildLoginHref(nextPath?: string) {
  if (!isSafeInternalPath(nextPath)) {
    return AUTH_ROUTES.login;
  }

  return `${AUTH_ROUTES.login}?next=${encodeURIComponent(nextPath as string)}`;
}

export function RegisterPage({ token, nextPath }: RegisterPageProps) {
  return (
    <AuthLayout
      variant="register"
      wide
      backHref={buildLoginHref(nextPath)}
      backLabel="Ir a iniciar sesión"
    >
      <RegisterForm token={token} nextPath={nextPath} />
    </AuthLayout>
  );
}
