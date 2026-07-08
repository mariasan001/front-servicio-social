import { AuthLayout } from "../components/AuthLayout/AuthLayout";
import { LoginForm } from "./LoginForm";

type LoginPageProps = {
  nextPath?: string;
  justRegistered?: boolean;
};

export function LoginPage({ nextPath, justRegistered }: LoginPageProps) {
  return (
    <AuthLayout variant="login">
      <LoginForm nextPath={nextPath} justRegistered={justRegistered} />
    </AuthLayout>
  );
}
