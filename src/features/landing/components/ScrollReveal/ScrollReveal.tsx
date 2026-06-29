"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import {
  getScrollDirection,
  initScrollDirection,
} from "../../hooks/useScrollDirection";
import styles from "./ScrollReveal.module.css";

type RevealState = "hidden-down" | "hidden-up" | "visible";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
  immediate?: boolean;
  as?: ElementType;
} & Omit<
  React.HTMLAttributes<HTMLElement>,
  "children" | "className" | "style" | "data-reveal"
>;

function joinClassNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function scheduleReveal(onReveal: () => void) {
  requestAnimationFrame(() => {
    requestAnimationFrame(onReveal);
  });
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  once = true,
  immediate = false,
  as: Component = "div",
  ...rest
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const hasEnteredRef = useRef(immediate);
  const [reduceMotion, setReduceMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const [animatedState, setAnimatedState] = useState<RevealState>(
    immediate ? "visible" : "hidden-down",
  );
  const revealState: RevealState =
    immediate || reduceMotion ? "visible" : animatedState;

  useEffect(() => {
    initScrollDirection();

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      setReduceMotion(media.matches);
    };

    media.addEventListener("change", updateMotionPreference);

    return () => {
      media.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion || immediate) {
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        if (entry.isIntersecting) {
          hasEnteredRef.current = true;
          const enterFrom: RevealState =
            getScrollDirection() === "down" ? "hidden-down" : "hidden-up";

          setAnimatedState(enterFrom);
          scheduleReveal(() => {
            setAnimatedState("visible");
          });

          if (once) {
            observer.disconnect();
          }

          return;
        }

        if (once) return;

        setAnimatedState(
          getScrollDirection() === "down" ? "hidden-down" : "hidden-up",
        );
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [immediate, once, reduceMotion]);

  const style = {
    "--reveal-delay": `${delay}ms`,
  } as CSSProperties;

  return (
    <Component
      ref={ref}
      className={joinClassNames(
        styles.reveal,
        reduceMotion && styles.reduced,
        revealState === "visible" && styles.isVisible,
        className,
      )}
      data-reveal={revealState}
      style={style}
      {...rest}
    >
      {children}
    </Component>
  );
}
