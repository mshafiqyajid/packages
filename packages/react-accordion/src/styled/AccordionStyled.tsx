import { forwardRef, useId, useMemo, type ReactNode, type Ref } from "react";
import { useAccordion, type AccordionType } from "../useAccordion";

export type AccordionSize = "sm" | "md" | "lg";
export type AccordionTone = "neutral" | "primary" | "success" | "danger";

export interface AccordionItem {
  title: ReactNode;
  content: ReactNode;
  /** Disable this item — trigger is non-interactive. */
  disabled?: boolean;
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
  /** Imperative ref handle exposing expandAll / collapseAll. */
  apiRef?: Ref<AccordionImperative>;
  className?: string;
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

export const AccordionStyled = forwardRef<HTMLDivElement, AccordionStyledProps>(
  function AccordionStyled(
    {
      items,
      type = "single",
      size = "md",
      tone = "neutral",
      defaultOpen,
      value,
      onValueChange,
      onOpenChange,
      disabled = false,
      collapsible = true,
      animated = true,
      apiRef,
      className,
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
        data-size={size}
        data-tone={tone}
        data-animated={animated ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
      >
        {items.map((item, index) => {
          const id = itemIds[index] as string;
          const { triggerProps, panelProps, isOpen, isDisabled } =
            accordion.getItemProps(id);

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
              </button>
              <div
                id={panelProps.id}
                role={panelProps.role}
                aria-labelledby={panelProps["aria-labelledby"]}
                className="racc-panel"
                data-open={isOpen ? "true" : undefined}
                data-state={panelProps["data-state"]}
              >
                <div className="racc-panel-inner">{item.content}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  },
);
