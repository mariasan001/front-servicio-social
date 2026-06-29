
import styles from '../login/LoginPage.module.css'

import RegisterAside from './RegisterAside'


export default function RegisterPage() {
    return (
        <div className={styles.page}>
            <section className={styles.shell}>
                <div className={styles.panel}>
                    <RegisterAside />
                    {/* 

                <LoginForm /> */}
                </div>
            </section>

        </div>
    )
}
