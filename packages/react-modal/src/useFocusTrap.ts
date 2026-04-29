import { useCallback, useRef } from "react";

const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "details > summary",
].join(", ");

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
    (el) => !el.closest("[inert]") && getComputedStyle(el).display !== "none",
  );
}

export interface UseFocusTrapResult {
  activate: (container: HTMLElement) => void;
  deactivate: () => void;
  handleKeyDown: (e: KeyboardEvent) => void;
}

export function useFocusTrap(): UseFocusTrapResult {
  const containerRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const activate = useCallback((container: HTMLElement) => {
    containerRef.current = container;
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const focusable = getFocusableElements(container);
    const first = focusable[0];
    if (first) {
      first.focus();
    } else {
      container.focus();
    }
  }, []);

  const deactivate = useCallback(() => {
    containerRef.current = null;
    const prev = previousFocusRef.current;
    if (prev && typeof prev.focus === "function") {
      prev.focus();
    }
    previousFocusRef.current = null;
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key !== "Tab" || !containerRef.current) return;

    const focusable = getFocusableElements(containerRef.current);
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }

    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  return { activate, deactivate, handleKeyDown };
}
