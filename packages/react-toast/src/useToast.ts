import { useCallback, useEffect, useSyncExternalStore } from "react";
import { toastStore, type ToastItem, type ToastOptions } from "./store";

export type { ToastItem, ToastOptions, ToastType } from "./store";

export interface ToastFn {
  (message: string, options?: ToastOptions): string;
  success(message: string, options?: Omit<ToastOptions, "type">): string;
  error(message: string, options?: Omit<ToastOptions, "type">): string;
  warning(message: string, options?: Omit<ToastOptions, "type">): string;
  info(message: string, options?: Omit<ToastOptions, "type">): string;
}

function buildToastFn(): ToastFn {
  const fn = (message: string, options?: ToastOptions): string =>
    toastStore.add(message, options);

  fn.success = (message: string, options?: Omit<ToastOptions, "type">) =>
    toastStore.add(message, { ...options, type: "success" });

  fn.error = (message: string, options?: Omit<ToastOptions, "type">) =>
    toastStore.add(message, { ...options, type: "error" });

  fn.warning = (message: string, options?: Omit<ToastOptions, "type">) =>
    toastStore.add(message, { ...options, type: "warning" });

  fn.info = (message: string, options?: Omit<ToastOptions, "type">) =>
    toastStore.add(message, { ...options, type: "info" });

  return fn as ToastFn;
}

const _toastFn = buildToastFn();

export function useToast(): {
  toast: ToastFn;
  dismiss: (id: string) => void;
  dismissAll: () => void;
} {
  const dismiss = useCallback((id: string) => toastStore.dismiss(id), []);
  const dismissAll = useCallback(() => toastStore.dismissAll(), []);

  return { toast: _toastFn, dismiss, dismissAll };
}

export function useToasts(): ToastItem[] {
  return useSyncExternalStore(
    toastStore.subscribe.bind(toastStore),
    toastStore.getSnapshot.bind(toastStore),
    () => [],
  );
}

export function useToastStore() {
  const toasts = useToasts();

  useEffect(() => {
    return toastStore.subscribe(() => {});
  }, []);

  return { toasts, store: toastStore };
}
