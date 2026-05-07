import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  toastStore,
  getToastStore,
  type ToastItem,
  type ToastOptions,
  type ToastUpdatePartial,
} from "./store";

export type { ToastItem, ToastOptions, ToastType, ToastUpdatePartial } from "./store";

const EMPTY_TOASTS: ToastItem[] = [];

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
  /** Update an existing toast in place without closing/reopening it. */
  update(id: string, partial: ToastUpdatePartial): void;
  /** Route toasts to a named channel, matching a <Toaster channel="..."> */
  channel(name: string): Omit<ToastFn, "channel">;
}

function resolveMessage<T>(
  template: string | ((value: T) => string),
  value: T,
): string {
  return typeof template === "function" ? template(value) : template;
}

function buildToastFn(store = toastStore): ToastFn {
  const fn = (message: string, options?: ToastOptions): string =>
    store.add(message, options);

  fn.success = (message: string, options?: Omit<ToastOptions, "type">) =>
    store.add(message, { ...options, type: "success" });

  fn.error = (message: string, options?: Omit<ToastOptions, "type">) =>
    store.add(message, { ...options, type: "error" });

  fn.warning = (message: string, options?: Omit<ToastOptions, "type">) =>
    store.add(message, { ...options, type: "warning" });

  fn.info = (message: string, options?: Omit<ToastOptions, "type">) =>
    store.add(message, { ...options, type: "info" });

  fn.loading = (message: string, options?: Omit<ToastOptions, "type">) =>
    store.add(message, { ...options, type: "loading" });

  fn.promise = <T,>(
    promise: Promise<T>,
    messages: ToastPromiseMessages<T>,
  ): string => {
    const id = store.add(messages.loading, { type: "loading" });
    promise.then(
      (value) => {
        store.update(id, {
          type: "success",
          message: resolveMessage(messages.success, value),
          duration: 4000,
        });
      },
      (err) => {
        store.update(id, {
          type: "error",
          message: resolveMessage(messages.error, err),
          duration: 6000,
        });
      },
    );
    return id;
  };

  fn.dismiss = (id?: string) => {
    if (id === undefined) store.dismissAll();
    else store.dismiss(id);
  };

  fn.update = (id: string, partial: ToastUpdatePartial) => {
    store.update(id, partial);
  };

  fn.channel = (name: string): Omit<ToastFn, "channel"> => {
    return buildToastFn(getToastStore(name)) as Omit<ToastFn, "channel">;
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

export function useToasts(channel = "default"): ToastItem[] {
  const store = getToastStore(channel);
  return useSyncExternalStore(
    store.subscribe.bind(store),
    store.getSnapshot.bind(store),
    () => EMPTY_TOASTS,
  );
}

export function useToastStore(channel = "default") {
  const store = getToastStore(channel);
  const toasts = useToasts(channel);

  useEffect(() => {
    return store.subscribe(() => {});
  }, [store]);

  return { toasts, store };
}
