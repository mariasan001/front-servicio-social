import type { AuthVariant } from "../../constants/hero";
import styles from "./AuthHeroPanel.module.css";

type AuthHeroPanelProps = {
  variant?: AuthVariant;
};

export function AuthHeroPanel(_props: AuthHeroPanelProps) {
  return (
    <div className={styles.panel}>
      <svg
        className={styles.artwork}
        viewBox="0 0 720 1080"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="authHeroBase" x1="0%" y1="0%" x2="92%" y2="100%">
            <stop offset="0%" stopColor="#35111f" />
            <stop offset="38%" stopColor="#4a1829" />
            <stop offset="72%" stopColor="#63253c" />
            <stop offset="100%" stopColor="#6b2340" />
          </linearGradient>

          <linearGradient id="authHeroTopBand" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2b0e19" />
            <stop offset="100%" stopColor="#421525" />
          </linearGradient>

          <linearGradient id="authHeroWaveDeep" x1="8%" y1="100%" x2="92%" y2="12%">
            <stop offset="0%" stopColor="#3d1524" />
            <stop offset="42%" stopColor="#5a2236" />
            <stop offset="100%" stopColor="#7a3550" />
          </linearGradient>

          <linearGradient id="authHeroWaveMid" x1="0%" y1="55%" x2="100%" y2="45%">
            <stop offset="0%" stopColor="#5c2238" />
            <stop offset="50%" stopColor="#7a3a54" />
            <stop offset="100%" stopColor="#945468" />
          </linearGradient>

          <linearGradient id="authHeroWaveRose" x1="100%" y1="20%" x2="0%" y2="80%">
            <stop offset="0%" stopColor="#b8956a" stopOpacity="0.34" />
            <stop offset="38%" stopColor="#d4bc94" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#6b2340" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="authHeroSheen" x1="78%" y1="0%" x2="22%" y2="100%">
            <stop offset="0%" stopColor="#f7f0e6" stopOpacity="0.2" />
            <stop offset="55%" stopColor="#e4cfa8" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#f7f0e6" stopOpacity="0" />
          </linearGradient>

          <filter id="authHeroGrain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.78"
              numOctaves="4"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix type="saturate" values="0" in="noise" result="mono" />
            <feComponentTransfer in="mono" result="grain">
              <feFuncA type="linear" slope="0.42" intercept="0" />
            </feComponentTransfer>
          </filter>
        </defs>

        <rect width="720" height="1080" fill="url(#authHeroBase)" />

        <path
          fill="url(#authHeroTopBand)"
          d="M-20 -20 L 740 -20 L 740 210 C 560 150, 420 250, 240 190 C 120 150, 40 220, -20 170 Z"
        />

        <path
          fill="url(#authHeroWaveDeep)"
          d="M-40 700 C 140 560, 300 760, 500 650 C 640 570, 700 690, 780 610 L 780 1120 L -40 1120 Z"
        />

        <path
          fill="url(#authHeroWaveMid)"
          d="M-60 430 C 160 300, 340 500, 540 390 C 660 320, 720 430, 800 350 L 800 1120 L -60 1120 Z"
        />

        <path
          fill="url(#authHeroWaveRose)"
          d="M-20 80 C 220 -10, 380 70, 560 20 C 650 -5, 710 90, 760 40 L 760 -40 L -20 -40 Z"
        />

        <path
          fill="url(#authHeroSheen)"
          d="M420 -30 C 560 90, 680 50, 760 170 L 760 -30 Z"
        />

        <rect
          width="720"
          height="1080"
          filter="url(#authHeroGrain)"
          opacity="0.14"
          style={{ mixBlendMode: "soft-light" }}
        />
      </svg>

      <div className={styles.grain} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />
    </div>
  );
}
