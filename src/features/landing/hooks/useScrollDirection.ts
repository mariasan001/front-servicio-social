export type ScrollDirection = "up" | "down";

let direction: ScrollDirection = "down";
let lastScrollY = 0;
let isListening = false;

export function initScrollDirection() {
  if (typeof window === "undefined" || isListening) return;

  isListening = true;
  lastScrollY = window.scrollY;

  window.addEventListener(
    "scroll",
    () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY !== lastScrollY) {
        direction = currentScrollY > lastScrollY ? "down" : "up";
        lastScrollY = currentScrollY;
      }
    },
    { passive: true },
  );
}

export function getScrollDirection() {
  return direction;
}
