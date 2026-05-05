import { useCallback, useEffect, useSyncExternalStore } from "react";
import { toastStore, type ToastItem, type ToastOptions } from "./store";

export type { ToastItem, ToastOptions, ToastType } from "./store";

export interface ToastPromiseMessages<T> {
  loading: string;
  success: string | ((value: T) => string);
  error: string | ((err: unknown) => string);
}

export interface ToastFn {
  (message: string, options?: ToastOptions): string;
  success(message: string, options?: Omit<ToastOptions, "type">): string;
  error(message: string, options?: Omit<ToastOptions, "type">): string;
  warning(message: string, options?: Omit<ToastOptions, "type">): string;
  info(message: string, options?: Omit<ToastOptions, "type">): string;
  loading(message: string, options?: Omit<ToastOptions, "type">): string;
  promise<T>(promise: Promise<T>, messages: ToastPromiseMessages<T>): string;
  dismiss(id?: string): void;
}

function resolveMessage<T>(
  template: string | ((value: T) => string),
  value: T,
): string {
  return typeof template === "function" ? template(value) : template;
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

  fn.loading = (message: string, options?: Omit<ToastOptions, "type">) =>
    toastStore.add(message, { ...options, type: "loading" });

  fn.promise = <T,>(
    promise: Promise<T>,
    messages: ToastPromiseMessages<T>,
  ): string => {
    const id = toastStore.add(messages.loading, { type: "loading" });
    promise.then(
      (value) => {
        toastStore.update(id, {
          type: "success",
          message: resolveMessage(messages.success, value),
          duration: 4000,
          createdAt: Date.now(),
          loading: false,
        });
      },
      (err) => {
        toastStore.update(id, {
          type: "error",
          message: resolveMessage(messages.error, err),
          duration: 6000,
          createdAt: Date.now(),
          loading: false,
        });
      },
    );
    return id;
  };

  fn.dismiss = (id?: string) => {
    if (id === undefined) toastStore.dismissAll();
    else toastStore.dismiss(id);
  };

  return fn as ToastFn;
}

const _toastFn = buildToastFn();

/** Standalone toast accessor — usable outside React (e.g. async helpers). */
export const toast: ToastFn = _toastFn;

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
