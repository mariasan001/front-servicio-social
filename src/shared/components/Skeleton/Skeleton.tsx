"use client";

import type { ComponentProps, ReactNode } from "react";
import BaseSkeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import styles from "./Skeleton.module.css";

const SKELETON_THEME = {
  baseColor: "var(--skeleton-base)",
  highlightColor: "var(--skeleton-highlight)",
  borderRadius: "0.5rem",
  duration: 1.35,
} as const;

type SkeletonProps = ComponentProps<typeof BaseSkeleton>;

function joinClassNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Skeleton({ className, containerClassName, ...props }: SkeletonProps) {
  return (
    <BaseSkeleton
      className={joinClassNames(styles.skeleton, className)}
      containerClassName={joinClassNames(styles.skeletonContainer, containerClassName)}
      {...props}
    />
  );
}

type AppSkeletonThemeProps = {
  children: ReactNode;
};

export function AppSkeletonTheme({ children }: AppSkeletonThemeProps) {
  return <SkeletonTheme {...SKELETON_THEME}>{children}</SkeletonTheme>;
}
