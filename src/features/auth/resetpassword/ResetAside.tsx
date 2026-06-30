
import Image from 'next/image'
import styles from './ResetAside.module.css'
import IconRegister from '@/../public/img/resetPassword/IconPassword.svg'
import IconFlor from '@/../public/img/resetPassword/IconFlor.svg'


export function ResetAside() {

    return (
        <aside className={styles.aside}>
            <div className={styles.asideShape} aria-hidden="true" />

            <div className={styles.asideInner}>
                <div className={styles.asideIllustration}>

                    <div className={styles.asideIllustrationBox}>
                        <Image
                            src={IconRegister}
                            alt="Ilustración decorativa de registro"
                            width={400}
                            height={438}
                            className={styles.asideIllustrationImage}
                            loading="eager"
                            style={{ maxWidth: "100%", height: "auto" }}
                        />
                    </div>
                </div>

                <div className={styles.asideCopy}>
                    <Image
                        src={IconFlor}
                        alt=""
                        aria-hidden="true"
                        className={`${styles.flower} ${styles.flowerLeft}`}
                    />

                    <Image
                        src={IconFlor}
                        alt=""
                        aria-hidden="true"
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
