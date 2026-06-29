import LoginAside from "./LoginAside";
import LoginForm from "./LoginForm";

import styles from "./LoginPage.module.css";

export default function LoginPage() {
    return (
        <div className={styles.page}>
            <section className={styles.shell}>
                <div className={styles.panel}>
                    <LoginAside/>
                    <LoginForm />
                </div>
            </section>
        </div>
    );
}