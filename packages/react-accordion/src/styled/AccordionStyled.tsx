import { forwardRef, useId, type ReactNode } from "react";
import { useAccordion, type AccordionType } from "../useAccordion";

export type AccordionSize = "sm" | "md" | "lg";
export type AccordionTone = "neutral" | "primary";

export interface AccordionItem {
  title: ReactNode;
  content: ReactNode;
}

export interface AccordionStyledProps {
  items: AccordionItem[];
  type?: AccordionType;
  size?: AccordionSize;
  tone?: AccordionTone;
  /** Index or array of indices that should be open initially */
  defaultOpen?: number | number[];
  /** Enable smooth height animation. Default: true */
  animated?: boolean;
  className?: string;
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
      animated = true,
      className,
    },
    ref,
  ) {
    const baseId = useId();
    const itemIds = items.map((_, i) => `${baseId}-item-${i}`);

    const resolvedDefaultOpen = normalizeDefaultOpenIndices(
      defaultOpen,
      itemIds,
      type,
    );

    const accordion = useAccordion({
      items: itemIds,
      type,
      defaultOpen: resolvedDefaultOpen,
    });

    return (
      <div
        ref={ref}
        className={["racc-root", className].filter(Boolean).join(" ")}
        data-size={size}
        data-tone={tone}
        data-animated={animated ? "true" : undefined}
      >
        {items.map((item, index) => {
          const id = itemIds[index] as string;
          const { triggerProps, panelProps, isOpen } = accordion.getItemProps(id);

          return (
            <div
              key={id}
              className="racc-item"
              data-open={isOpen ? "true" : undefined}
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
