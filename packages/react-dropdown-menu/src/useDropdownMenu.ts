import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
  type RefObject,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

export interface UseDropdownMenuOptions {
  closeOnSelect?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnEsc?: boolean;
  itemCount?: number;
}

export interface UseDropdownMenuResult {
  triggerProps: {
    ref: RefObject<HTMLButtonElement>;
    id: string;
    "aria-haspopup": "menu";
    "aria-expanded": boolean;
    "aria-controls": string;
    onKeyDown: (e: ReactKeyboardEvent<HTMLButtonElement>) => void;
    onClick: () => void;
  };
  menuProps: {
    ref: RefObject<HTMLUListElement>;
    id: string;
    role: "menu";
    "aria-labelledby": string;
    tabIndex: number;
    onKeyDown: (e: ReactKeyboardEvent<HTMLUListElement>) => void;
  };
  getItemProps: (index: number) => {
    role: "menuitem";
    tabIndex: number;
    "data-active": boolean;
    onMouseEnter: () => void;
    onClick: () => void;
  };
  isOpen: boolean;
  open: () => void;
  close: () => void;
  activeIndex: number;
}

export function useDropdownMenu({
  closeOnSelect = true,
  closeOnOutsideClick = true,
  closeOnEsc = true,
  itemCount = 0,
}: UseDropdownMenuOptions = {}): UseDropdownMenuResult {
  const triggerId = useId();
  const menuId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const open = useCallback(() => {
    setIsOpen(true);
    setActiveIndex(0);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  const selectItem = useCallback(() => {
    if (closeOnSelect) close();
  }, [closeOnSelect, close]);

  const handleTriggerKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (isOpen) {
          close();
        } else {
          open();
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!isOpen) open();
        else setActiveIndex((i) => (i + 1) % Math.max(itemCount, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!isOpen) open();
        else
          setActiveIndex(
            (i) => (i - 1 + Math.max(itemCount, 1)) % Math.max(itemCount, 1),
          );
      } else if (e.key === "Escape" && closeOnEsc) {
        e.preventDefault();
        close();
        triggerRef.current?.focus();
      } else if (e.key === "Tab") {
        close();
      }
    },
    [isOpen, itemCount, open, close, closeOnEsc],
  );

  const handleMenuKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLUListElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % Math.max(itemCount, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(
          (i) => (i - 1 + Math.max(itemCount, 1)) % Math.max(itemCount, 1),
        );
      } else if (e.key === "Escape" && closeOnEsc) {
        e.preventDefault();
        close();
        triggerRef.current?.focus();
      } else if (e.key === "Tab") {
        close();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectItem();
      }
    },
    [itemCount, closeOnEsc, close, selectItem],
  );

  useEffect(() => {
    if (!isOpen || !closeOnOutsideClick) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        close();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, closeOnOutsideClick, close]);

  return {
    triggerProps: {
      ref: triggerRef as RefObject<HTMLButtonElement>,
      id: triggerId,
      "aria-haspopup": "menu",
      "aria-expanded": isOpen,
      "aria-controls": menuId,
      onKeyDown: handleTriggerKeyDown,
      onClick: () => (isOpen ? close() : open()),
    },
    menuProps: {
      ref: menuRef as RefObject<HTMLUListElement>,
      id: menuId,
      role: "menu",
      "aria-labelledby": triggerId,
      tabIndex: -1,
      onKeyDown: handleMenuKeyDown,
    },
    getItemProps: (index: number) => ({
      role: "menuitem",
      tabIndex: activeIndex === index ? 0 : -1,
      "data-active": activeIndex === index,
      onMouseEnter: () => setActiveIndex(index),
      onClick: () => selectItem(),
    }),
    isOpen,
    open,
    close,
    activeIndex,
  };
}
