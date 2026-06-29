import styles from '../login/LoginPage.module.css'

import ResetAside from './ResetAside'

export default function ResetPasswordPage() {
    return (
        <div className={styles.page}>
            <section className={styles.shell}>
                <div className={styles.panel}>

                    <ResetAside/>
                    
                    {/* <ResetAside/> */}


                </div>
            </section>

        </div>
    )
}
