// src/features/auth/components/AuthShell.tsx

import { ReactNode } from "react";
import styles from './AuthShell.module.css'

type Props = {
    children: ReactNode;
}

export function AuthShell({ children }: Props) {
    return (
        <main className={styles.page}>
            <section className={styles.shell}>
                <div className={styles.panel}>
                    {children}
                </div>
            </section>
        </main>
    )
}
