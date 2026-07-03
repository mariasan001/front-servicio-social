"use client";

import { EllipsisVertical } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  TITULAR_PROCESO_SECTION_OPTIONS,
  type TitularProcesoModalSection,
} from "./titular-proceso-sections";
import styles from "./TitularProcesoActionMenu.module.css";

type MenuPlacement = "up" | "down";

type MenuPosition = {
  top: number;
  left: number;
  placement: MenuPlacement;
};

const MENU_ESTIMATED_HEIGHT = TITULAR_PROCESO_SECTION_OPTIONS.length * 36 + 12;

function getMenuPosition(trigger: HTMLButtonElement): MenuPosition {
  const rect = trigger.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  const placement =
    spaceBelow < MENU_ESTIMATED_HEIGHT && spaceAbove > spaceBelow ? "up" : "down";

  return {
    top: placement === "down" ? rect.bottom + 4 : rect.top - 4,
    left: rect.right,
    placement,
  };
}

export function TitularProcesoActionMenu({
  onSelect,
}: {
  onSelect: (section: TitularProcesoModalSection) => void;
}) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setMenuPosition(null);
      return;
    }

    const updatePosition = () => {
      if (!triggerRef.current) {
        return;
      }

      setMenuPosition(getMenuPosition(triggerRef.current));
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        const menu = document.getElementById(menuId);
        if (menu?.contains(event.target as Node)) {
          return;
        }

        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuId, open]);

  const menu =
    open && menuPosition ? (
      <div
        id={menuId}
        className={[
          styles.menu,
          menuPosition.placement === "up" ? styles.menuUp : styles.menuDown,
        ]
          .filter(Boolean)
          .join(" ")}
        role="menu"
        style={{
          top: menuPosition.top,
          left: menuPosition.left,
        }}
      >
        {TITULAR_PROCESO_SECTION_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="menuitem"
            className={styles.option}
            onClick={() => {
              setOpen(false);
              onSelect(option.id);
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    ) : null;

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label="Opciones del proceso"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        <EllipsisVertical size={15} strokeWidth={2} aria-hidden="true" />
      </button>

      {mounted && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
