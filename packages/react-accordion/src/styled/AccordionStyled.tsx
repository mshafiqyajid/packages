import {
  forwardRef,
  useId,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import { useAccordion, type AccordionType } from "../useAccordion";

export type AccordionSize = "sm" | "md" | "lg";
export type AccordionTone = "neutral" | "primary" | "success" | "danger";
export type AccordionVariant = "bordered" | "separated" | "flush";

export interface AccordionItem {
  title: ReactNode;
  content: ReactNode;
  /** Disable this item — trigger is non-interactive. */
  disabled?: boolean;
  /** Replaces the trigger button content. Button shell and ARIA attrs remain. */
  renderHeader?: (props: { isOpen: boolean; toggle: () => void }) => ReactNode;
  /** Override lazy: always mount this item's content regardless of accordion lazy prop. */
  forceMount?: boolean;
}

export interface AccordionImperative {
  expandAll: () => void;
  collapseAll: () => void;
  open: (index: number) => void;
  close: (index: number) => void;
  toggle: (index: number) => void;
}

export interface AccordionStyledProps {
  items: AccordionItem[];
  type?: AccordionType;
  size?: AccordionSize;
  tone?: AccordionTone;
  /** Visual variant. Default: "bordered". */
  variant?: AccordionVariant;
  /** Index or array of indices that should be open initially */
  defaultOpen?: number | number[];
  /** Controlled open state by index. Single → number | null, multiple → number[]. */
  value?: number | number[] | null;
  /** Fires when the open set changes. Reports indices to match the items array. */
  onValueChange?: (value: number | number[] | null) => void;
  /** Per-item open/close callback. Reports the item index. */
  onOpenChange?: (index: number, isOpen: boolean) => void;
  /** Disable all items. */
  disabled?: boolean;
  /** Single mode only: allow clicking the open item again to close it. Default: true. */
  collapsible?: boolean;
  /** Enable smooth height animation. Default: true */
  animated?: boolean;
  /**
   * When true, panel children only mount after first expand.
   * Once mounted they remain in the DOM (not destroyed on collapse).
   * Per-item forceMount overrides this.
   * Default: false
   */
  lazy?: boolean;
  /** Imperative ref handle exposing expandAll / collapseAll. */
  apiRef?: Ref<AccordionImperative>;
  className?: string;
  style?: CSSProperties;
}

function indicesToIds(
  indices: number | number[] | null | undefined,
  ids: string[],
): string | string[] | null | undefined {
  if (indices === undefined) return undefined;
  if (indices === null) return null;
  if (Array.isArray(indices)) {
    return indices.filter((i) => i >= 0 && i < ids.length).map((i) => ids[i] as string);
  }
  return indices >= 0 && indices < ids.length ? (ids[indices] as string) : null;
}

function idsToIndices(
  v: string | string[] | null,
  ids: string[],
): number | number[] | null {
  if (v === null) return null;
  if (Array.isArray(v)) return v.map((s) => ids.indexOf(s)).filter((i) => i >= 0);
  return ids.indexOf(v);
}

function normalizeDefaultOpenIndices(
  defaultOpen: number | number[] | undefined,
  ids: string[],
  type: AccordionType,
): string | string[] | undefined {
  if (defaultOpen === undefined) return undefined;
  if (Array.isArray(defaultOpen)) {
    const resolved = defaultOpen
      .filter((i) => i >= 0 && i < ids.length)
      .map((i) => ids[i] as string);
    if (type === "single") {
      return resolved.length > 0 ? resolved[0] : undefined;
    }
    return resolved;
  }
  if (defaultOpen >= 0 && defaultOpen < ids.length) {
    return ids[defaultOpen] as string;
  }
  return undefined;
}

function LazyPanel({
  isOpen,
  forceMount,
  lazy,
  children,
}: {
  isOpen: boolean;
  forceMount: boolean;
  lazy: boolean;
  children: ReactNode;
}) {
  const hasMountedRef = useRef(false);
  if (isOpen) hasMountedRef.current = true;

  const shouldMount = forceMount || !lazy || hasMountedRef.current;
  if (!shouldMount) return null;
  return <>{children}</>;
}

export const AccordionStyled = forwardRef<HTMLDivElement, AccordionStyledProps>(
  function AccordionStyled(
    {
      items,
      type = "single",
      size = "md",
      tone = "neutral",
      variant = "bordered",
      defaultOpen,
      value,
      onValueChange,
      onOpenChange,
      disabled = false,
      collapsible = true,
      animated = true,
      lazy = false,
      apiRef,
      className,
      style,
    },
    ref,
  ) {
    const baseId = useId();
    const itemIds = useMemo(
      () => items.map((_, i) => `${baseId}-item-${i}`),
      [items, baseId],
    );

    const resolvedDefaultOpen = normalizeDefaultOpenIndices(
      defaultOpen,
      itemIds,
      type,
    );

    const controlledValue =
      value !== undefined ? indicesToIds(value, itemIds) : undefined;

    const disabledItemIds = useMemo(
      () =>
        items
          .map((it, i) => (it.disabled ? itemIds[i]! : null))
          .filter((id): id is string => id !== null),
      [items, itemIds],
    );

    const accordion = useAccordion({
      items: itemIds,
      type,
      defaultOpen: resolvedDefaultOpen,
      value: controlledValue as string | string[] | null | undefined,
      onValueChange: onValueChange
        ? (v) => onValueChange(idsToIndices(v as string | string[] | null, itemIds))
        : undefined,
      disabled,
      disabledItems: disabledItemIds,
      collapsible,
      onOpenChange: onOpenChange
        ? (id, isItemOpen) => onOpenChange(itemIds.indexOf(id), isItemOpen)
        : undefined,
    });

    if (apiRef) {
      const handle: AccordionImperative = {
        expandAll: accordion.expandAll,
        collapseAll: accordion.collapseAll,
        open: (i) => itemIds[i] && accordion.open(itemIds[i]!),
        close: (i) => itemIds[i] && accordion.close(itemIds[i]!),
        toggle: (i) => itemIds[i] && accordion.toggle(itemIds[i]!),
      };
      if (typeof apiRef === "function") apiRef(handle);
      else (apiRef as React.MutableRefObject<AccordionImperative | null>).current = handle;
    }

    return (
      <div
        ref={ref}
        className={["racc-root", className].filter(Boolean).join(" ")}
        style={style}
        data-size={size}
        data-tone={tone}
        data-variant={variant}
        data-animated={animated ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
      >
        {items.map((item, index) => {
          const id = itemIds[index] as string;
          const { triggerProps, panelProps, isOpen, isDisabled } =
            accordion.getItemProps(id);

          const triggerContent = item.renderHeader
            ? item.renderHeader({ isOpen, toggle: () => accordion.toggle(id) })
            : (
              <>
                <span className="racc-trigger-text">{item.title}</span>
                <span className="racc-chevron" aria-hidden="true">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 6L8 10L12 6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </>
            );

          return (
            <div
              key={id}
              className="racc-item"
              data-open={isOpen ? "true" : undefined}
              data-state={isOpen ? "open" : "closed"}
              data-disabled={isDisabled ? "true" : undefined}
            >
              <button
                {...triggerProps}
                role={undefined}
                type="button"
                className="racc-trigger"
              >
                {triggerContent}
              </button>
              <div
                id={panelProps.id}
                role={panelProps.role}
                aria-labelledby={panelProps["aria-labelledby"]}
                className="racc-panel"
                data-open={isOpen ? "true" : undefined}
                data-state={panelProps["data-state"]}
              >
                <div className="racc-panel-inner">
                  <LazyPanel
                    isOpen={isOpen}
                    forceMount={item.forceMount ?? false}
                    lazy={lazy}
                  >
                    {item.content}
                  </LazyPanel>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  },
);
