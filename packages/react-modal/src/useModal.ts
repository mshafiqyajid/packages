import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusTrap } from "./useFocusTrap";

export interface UseModalOptions {
  defaultOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  closeOnEsc?: boolean;
}

export interface ModalProps {
  role: "dialog";
  "aria-modal": true;
  tabIndex: -1;
}

export interface OverlayProps {
  "data-rmod-overlay": string;
}

export interface UseModalResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  modalProps: ModalProps;
  overlayProps: OverlayProps;
}

export function useModal(options: UseModalOptions = {}): UseModalResult {
  const { defaultOpen = false, onOpen, onClose, closeOnEsc = true } = options;

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { activate, deactivate, handleKeyDown } = useFocusTrap();
  const modalRef = useRef<HTMLElement | null>(null);
  const originalOverflowRef = useRef<string>("");
  const hasOpenedRef = useRef(defaultOpen);

  const open = useCallback(() => {
    setIsOpen(true);
    onOpen?.();
  }, [onOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) {
        onClose?.();
      } else {
        onOpen?.();
      }
      return !prev;
    });
  }, [onOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      hasOpenedRef.current = true;
      originalOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflowRef.current;
      };
    } else if (hasOpenedRef.current) {
      document.body.style.overflow = originalOverflowRef.current;
      return () => {
        document.body.style.overflow = originalOverflowRef.current;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === "Escape") {
        close();
        return;
      }
      handleKeyDown(e);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeOnEsc, close, handleKeyDown]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      activate(modalRef.current);
    } else if (!isOpen) {
      deactivate();
    }
  }, [isOpen, activate, deactivate]);

  const setModalRef = useCallback(
    (el: HTMLElement | null) => {
      modalRef.current = el;
      if (el && isOpen) {
        activate(el);
      }
    },
    [isOpen, activate],
  );

  const modalProps: ModalProps & { ref: (el: HTMLElement | null) => void } = {
    role: "dialog",
    "aria-modal": true,
    tabIndex: -1,
    ref: setModalRef,
  };

  const overlayProps: OverlayProps = {
    "data-rmod-overlay": "true",
  };

  return {
    isOpen,
    open,
    close,
    toggle,
    modalProps,
    overlayProps,
  };
}
