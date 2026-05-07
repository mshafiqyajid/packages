export type ToastType = "neutral" | "success" | "error" | "warning" | "info" | "loading";

export type ToastActionVariant = "primary" | "outline" | "ghost";

export interface ToastAction {
  label: string;
  onClick: () => void;
  /** Visual variant. Default: "primary". */
  variant?: ToastActionVariant;
}

export interface ToastItem {
  id: string;
  message: string;
  title?: string;
  type: ToastType;
  duration: number;
  action?: ToastAction;
  /** When provided, renders an undo button with a circular countdown ring. */
  undo?: () => void;
  /** Label for the undo button. Default: "Undo". */
  undoLabel?: string;
  /** When true, the toast can be dismissed by swiping (touch only). Default: true. */
  dismissibleSwipe?: boolean;
  /** When true AND duration > 0, renders a circular SVG progress ring. */
  showProgress?: boolean;
  createdAt: number;
  /** True when the toast is showing a pending state (set by toast.promise). */
  loading?: boolean;
  /** Channel this toast belongs to. Default: "default". */
  channel: string;
}

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  title?: string;
  action?: ToastAction;
  /** Render an undo button + countdown ring. The toast auto-dismisses unless cancelled. */
  undo?: () => void;
  undoLabel?: string;
  dismissibleSwipe?: boolean;
  /** When true AND duration > 0, renders a circular SVG progress ring. */
  showProgress?: boolean;
  /** Pre-supplied id; useful for updating an existing toast. */
  id?: string;
  /** Channel to send the toast to. Default: "default". */
  channel?: string;
}

/** Partial update applied by toast.update(). Accepts any subset of ToastOptions fields. */
export type ToastUpdatePartial = Pick<
  ToastOptions,
  "type" | "title" | "duration" | "action" | "showProgress"
> & { message?: string };

type Listener = (toasts: ToastItem[]) => void;

const _stores = new Map<string, { toasts: ToastItem[]; listeners: Set<Listener> }>();

function getChannelStore(channel: string) {
  if (!_stores.has(channel)) {
    _stores.set(channel, { toasts: [], listeners: new Set() });
  }
  return _stores.get(channel)!;
}

let _counter = 0;

function notifyChannel(channel: string) {
  const store = _stores.get(channel);
  if (!store) return;
  const snapshot = [...store.toasts];
  store.listeners.forEach((fn) => fn(snapshot));
}

function makeChannelStore(channel: string) {
  return {
    getSnapshot(): ToastItem[] {
      return getChannelStore(channel).toasts;
    },

    subscribe(listener: Listener): () => void {
      const store = getChannelStore(channel);
      store.listeners.add(listener);
      return () => store.listeners.delete(listener);
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
        undo: options.undo,
        undoLabel: options.undoLabel,
        dismissibleSwipe: options.dismissibleSwipe,
        showProgress: options.showProgress,
        createdAt: Date.now(),
        loading: type === "loading",
        channel,
      };
      const store = getChannelStore(channel);
      const existing = store.toasts.findIndex((t) => t.id === id);
      if (existing !== -1) {
        store.toasts = store.toasts.map((t, i) => (i === existing ? item : t));
      } else {
        store.toasts = [...store.toasts, item];
      }
      notifyChannel(channel);
      return id;
    },

    update(id: string, partial: ToastUpdatePartial): void {
      const store = getChannelStore(channel);
      let changed = false;
      store.toasts = store.toasts.map((t) => {
        if (t.id !== id) return t;
        changed = true;
        const merged: ToastItem = {
          ...t,
          ...(partial.message !== undefined ? { message: partial.message } : {}),
          ...(partial.title !== undefined ? { title: partial.title } : {}),
          ...(partial.type !== undefined ? { type: partial.type } : {}),
          ...(partial.duration !== undefined ? { duration: partial.duration, createdAt: Date.now() } : {}),
          ...(partial.action !== undefined ? { action: partial.action } : {}),
          ...(partial.showProgress !== undefined ? { showProgress: partial.showProgress } : {}),
        };
        if (partial.type !== undefined) {
          merged.loading = partial.type === "loading";
        }
        return merged;
      });
      if (changed) notifyChannel(channel);
    },

    dismiss(id: string): void {
      const store = getChannelStore(channel);
      store.toasts = store.toasts.filter((t) => t.id !== id);
      notifyChannel(channel);
    },

    dismissAll(): void {
      const store = getChannelStore(channel);
      store.toasts = [];
      notifyChannel(channel);
    },

    setToasts(toasts: ToastItem[]): void {
      const store = getChannelStore(channel);
      store.toasts = toasts;
      notifyChannel(channel);
    },
  };
}

export const toastStore = makeChannelStore("default");

export function getToastStore(channel: string) {
  return makeChannelStore(channel);
}
