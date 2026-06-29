
import Image from 'next/image'
import styles from './ResetAside.module.css'
import IconRegister from '@/../public/img/resetPassword/IconPassword.svg'
import IconFlor from '@/../public/img/resetPassword/IconFlor.svg'


export default function ResetAside() {

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
                            height={557}
                            className={styles.asideIllustrationImage}
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

                    <h1 className={styles.asideTitle}>Restaurar Contraseña</h1>


                    <p className={styles.asideText}>
                        &quot;Recupera el acceso a tu cuenta de forma segura.&quot;
                    </p>
                </div>
            </div>
        </aside>
    )
}
