
import Image from 'next/image'
import styles from './ResetAside.module.css'


export function ResetAside() {

    return (
        <aside className={styles.aside}>
            <div className={styles.asideShape} aria-hidden="true" />

            <div className={styles.asideInner}>
                <div className={styles.asideIllustration}>

                    <div className={styles.asideIllustrationBox}>
                        <Image
                            src="/img/resetPassword/IconPassword.svg"
                            alt="Ilustración decorativa de registro"
                            width={731}
                            height={800}
                            className={styles.asideIllustrationImage}
                            loading="eager"
                            style={{ maxWidth: "100%", height: "auto" }}
                        />
                    </div>
                </div>

                <div className={styles.asideCopy}>
                    <Image
                        src="/img/resetPassword/IconFlor.svg"
                        alt=""
                        aria-hidden="true"
                        width={119}
                        height={200}
                        className={`${styles.flower} ${styles.flowerLeft}`}
                    />

                    <Image
                        src="/img/resetPassword/IconFlor.svg"
                        alt=""
                        aria-hidden="true"
                        width={119}
                        height={200}
                        className={`${styles.flower} ${styles.flowerRight}`}
                    />

                    <h1 className={styles.asideTitle}>Recupera tu acceso</h1>


                    <p className={styles.asideText}>
                        &quot;Restablece tu contraseña de forma segura.&quot;
                    </p>
                </div>
            </div>
        </aside>
    )
}
