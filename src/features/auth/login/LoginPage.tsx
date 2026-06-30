import { AuthShell } from "@/features/auth/components/AuthShell";
import { LoginAside } from "./LoginAside";
import { LoginForm } from "./LoginForm";

export function LoginPage() {
    return (
        <AuthShell>
            <LoginAside />
            <LoginForm />
        </AuthShell>
    );
}