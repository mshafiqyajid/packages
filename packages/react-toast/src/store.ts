export type ToastType = "neutral" | "success" | "error" | "warning" | "info" | "loading";

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
  /** True when the toast is showing a pending state (set by toast.promise). */
  loading?: boolean;
}

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  title?: string;
  action?: ToastAction;
  /** Pre-supplied id; useful for updating an existing toast. */
  id?: string;
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
    const id = options.id ?? `toast-${++_counter}-${Date.now()}`;
    const type = options.type ?? "neutral";
    const item: ToastItem = {
      id,
      message,
      title: options.title,
      type,
      duration: options.duration ?? (type === "loading" ? Infinity : 4000),
      action: options.action,
      createdAt: Date.now(),
      loading: type === "loading",
    };
    const existing = _toasts.findIndex((t) => t.id === id);
    if (existing !== -1) {
      _toasts = _toasts.map((t, i) => (i === existing ? item : t));
    } else {
      _toasts = [..._toasts, item];
    }
    notify();
    return id;
  },

  update(id: string, partial: Partial<ToastItem>): void {
    let changed = false;
    _toasts = _toasts.map((t) => {
      if (t.id !== id) return t;
      changed = true;
      const merged: ToastItem = { ...t, ...partial };
      if (partial.type !== undefined && partial.loading === undefined) {
        merged.loading = partial.type === "loading";
      }
      return merged;
    });
    if (changed) notify();
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
