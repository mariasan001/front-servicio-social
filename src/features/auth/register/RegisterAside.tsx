// src/features/auth/register/RegisterAside.tsx
import Image from 'next/image'
import styles from './RegisterAside.module.css'
import IconRegister from '@/../public/img/register/IconoRegister.svg'
import IconFlor from '@/../public/img/register/IconFlor.svg'



export function RegisterAside() {
  return (
    <aside className={styles.aside}>
      <div className={styles.asideShape} aria-hidden="true" />

      <div className={styles.asideInner}>
        <div className={styles.asideIllustration}>
          
          <div className={styles.asideIllustrationBox}>
            <Image
              src={IconRegister}
              alt="Ilustración decorativa de registro"
              width={560}
              height={441}
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
          
          <h1 className={styles.asideTitle}>Únete al Sistema</h1>


          <p className={styles.asideText}>
            &quot;Registra tu cuenta para comenzar a gestionar
            tu servicio social o residencias profesionales.&quot;
          </p>
        </div>
      </div>
    </aside>
  )
}
