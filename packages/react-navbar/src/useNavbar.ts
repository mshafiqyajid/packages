import { useCallback, useEffect, useRef, useState } from "react";

export interface UseNavbarOptions {
  scrollThreshold?: number;
  onMenuToggle?: (open: boolean) => void;
}

export interface UseNavbarResult {
  navProps: {
    role: "navigation";
    "aria-label": string;
  };
  menuProps: {
    id: string;
  };
  toggleProps: {
    "aria-expanded": boolean;
    "aria-controls": string;
    onClick: () => void;
  };
  isMenuOpen: boolean;
  isScrolled: boolean;
}

const MENU_ID = "rnav-menu";

export function useNavbar(opts: UseNavbarOptions = {}): UseNavbarResult {
  const { scrollThreshold = 16, onMenuToggle } = opts;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const onMenuToggleRef = useRef(onMenuToggle);
  onMenuToggleRef.current = onMenuToggle;

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => {
      const next = !prev;
      onMenuToggleRef.current?.(next);
      return next;
    });
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen((prev) => {
      if (prev) {
        onMenuToggleRef.current?.(false);
        return false;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollThreshold]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen, closeMenu]);

  return {
    navProps: {
      role: "navigation",
      "aria-label": "Main navigation",
    },
    menuProps: {
      id: MENU_ID,
    },
    toggleProps: {
      "aria-expanded": isMenuOpen,
      "aria-controls": MENU_ID,
      onClick: toggleMenu,
    },
    isMenuOpen,
    isScrolled,
  };
}
