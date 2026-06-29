import Image from 'next/image'
import styles from './LoginAside.module.css'
import fondoLogin from '@/../public/img/login/FondoLogin.svg'


export default function LoginAside() {
    return (
        <aside className={styles.aside}>
            {/* <div className={styles.asideShape} aria-hidden="true" /> */}

            <div className={styles.asideInner}>
                <div className={styles.asideIllustration}>
                    <div className={styles.asideIllustrationBox}>
                        <Image
                            src={fondoLogin}
                            alt="Ilustración decorativa del inicio de sesión"
                            width={559}
                            height={557}
                            className={styles.asideIllustrationImage}
                            priority
                        />
                    </div>
                </div>

                <div className={styles.asideCopy}>
                    <h1 className={styles.asideTitle}>¡Bienvenido!</h1>

                    <p className={styles.asideText}>
                        &quot;El servicio social es una oportunidad para transformar
                        comunidades mientras desarrollas habilidades profesionales.&quot;
                    </p>
                </div>
            </div>
        </aside>
    )
}
