import { AuthLayout } from "../components/AuthLayout/AuthLayout";
import { LoginForm } from "./LoginForm";

type LoginPageProps = {
  nextPath?: string;
};

export function LoginPage({ nextPath }: LoginPageProps) {
  return (
    <AuthLayout variant="login">
      <LoginForm nextPath={nextPath} />
    </AuthLayout>
  );
}
