export type ToastType = "neutral" | "success" | "error" | "warning" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  message: string;
  title?: string;
  type: ToastType;
  duration: number;
  action?: ToastAction;
  createdAt: number;
}

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  title?: string;
  action?: ToastAction;
}

type Listener = (toasts: ToastItem[]) => void;

let _toasts: ToastItem[] = [];
const _listeners = new Set<Listener>();
let _counter = 0;

function notify() {
  const snapshot = [..._toasts];
  _listeners.forEach((fn) => fn(snapshot));
}

export const toastStore = {
  getSnapshot(): ToastItem[] { return _toasts; },

  subscribe(listener: Listener): () => void {
    _listeners.add(listener);
    return () => _listeners.delete(listener);
  },

  add(message: string, options: ToastOptions = {}): string {
    const id = `toast-${++_counter}-${Date.now()}`;
    _toasts = [..._toasts, {
      id,
      message,
      title: options.title,
      type: options.type ?? "neutral",
      duration: options.duration ?? 4000,
      action: options.action,
      createdAt: Date.now(),
    }];
    notify();
    return id;
  },

  dismiss(id: string): void {
    _toasts = _toasts.filter((t) => t.id !== id);
    notify();
  },

  dismissAll(): void {
    _toasts = [];
    notify();
  },

  setToasts(toasts: ToastItem[]): void {
    _toasts = toasts;
    notify();
  },
};
