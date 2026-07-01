import Image from 'next/image'
import styles from './LoginAside.module.css'


export function LoginAside() {
    return (
        <aside className={styles.aside}>
            <div className={styles.asideShape} aria-hidden="true" />

            <div className={styles.asideInner}>
                <div className={styles.asideIllustration}>
                    <div className={styles.asideIllustrationBox}>
                        <Image
                            src="/img/login/FondoLogin.svg"
                            alt="Ilustración decorativa del inicio de sesión"
                            width={559}
                            height={557}
                            className={styles.asideIllustrationImage}
                            priority
                        />
                    </div>
                </div>

                <div className={styles.asideCopy}>
                    <h1 className={styles.asideTitle}>¡Bienvenido a tu plataforma!</h1>

                    <p className={styles.asideText}>
                        &quot;El servicio social es una oportunidad para transformar
                        comunidades mientras desarrollas habilidades profesionales.&quot;
                    </p>
                </div>
            </div>
        </aside>
    )
}
