import {
  forwardRef,
  useRef,
  useState,
  useCallback,
  useEffect,
  useId,
  cloneElement,
  isValidElement,
  type ReactNode,
  type ReactElement,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";

export type DropdownMenuSide = "top" | "bottom" | "left" | "right";
export type DropdownMenuAlign = "start" | "center" | "end";
export type DropdownMenuPlacement =
  | DropdownMenuSide
  | `${DropdownMenuSide}-start`
  | `${DropdownMenuSide}-end`;
export type DropdownMenuSize = "sm" | "md" | "lg";
export type DropdownMenuStrategy = "absolute" | "fixed";
export type DropdownMenuItemKind = "item" | "checkbox" | "radio";

export interface DropdownMenuItem {
  label?: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  divider?: boolean;
  /** Nested submenu items. When set, the row becomes a parent (chevron, hover-flyout, →/← keyboard nav). */
  items?: DropdownMenuItem[];
  /** Item kind: "item" (default), "checkbox", or "radio". */
  kind?: DropdownMenuItemKind;
  /** Checked state for checkbox/radio items. */
  checked?: boolean;
  /** Radio group name. Items sharing a group get a role="group" wrapper. */
  group?: string;
  /** Keyboard shortcut label, e.g. "⌘K". Pure display — no hotkey wiring. */
  shortcut?: string;
}

export interface DropdownMenuStyledProps {
  /** The trigger element — any ReactElement (button, icon, etc.) */
  trigger: ReactElement;
  items?: DropdownMenuItem[];
  placement?: DropdownMenuPlacement;
  size?: DropdownMenuSize;
  className?: string;
  /** Gap in px between trigger and menu. Default: 4 */
  offset?: number;
  /** Viewport edge padding for flip / shift. Default: 8 */
  collisionPadding?: number;
  /** Auto-flip to the opposite side when there isn't room. Default: true */
  flip?: boolean;
  /** Push back into view along the cross-axis. Default: true */
  shift?: boolean;
  /** "absolute" or "fixed" positioning. Default: "absolute" */
  strategy?: DropdownMenuStrategy;
  /** Async loader. When set, fires on open. `items` prop is ignored until loaded. */
  loadItems?: () => Promise<DropdownMenuItem[]>;
  /** Text shown in the loading spinner row. Default: "Loading…" */
  loadingText?: string;
  /** Text shown when loadItems rejects. Default: "Failed to load" */
  errorText?: string;
}

function parsePlacement(p: DropdownMenuPlacement): {
  side: DropdownMenuSide;
  align: DropdownMenuAlign;
} {
  const dash = p.indexOf("-");
  if (dash === -1) {
    const side = p as DropdownMenuSide;
    return {
      side,
      align: side === "top" || side === "bottom" ? "start" : "center",
    };
  }
  return {
    side: p.slice(0, dash) as DropdownMenuSide,
    align: p.slice(dash + 1) as DropdownMenuAlign,
  };
}

function buildPlacement(
  side: DropdownMenuSide,
  align: DropdownMenuAlign,
): DropdownMenuPlacement {
  return (align === "center" ? side : `${side}-${align}`) as DropdownMenuPlacement;
}

function SubmenuChevron() {
  return (
    <svg
      className="rdrop-item-chevron"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3.5 2L6.5 5L3.5 8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="rdrop-item-indicator"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 6l3 3 5-5" />
    </svg>
  );
}

function RadioDot() {
  return (
    <svg
      className="rdrop-item-indicator"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="3" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="rdrop-spinner"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="5" strokeOpacity="0.25" />
      <path d="M7 2a5 5 0 0 1 5 5" />
    </svg>
  );
}

interface ComputeOpts {
  trigger: DOMRect;
  floating: DOMRect;
  placement: DropdownMenuPlacement;
  offset: number;
  collisionPadding: number;
  flip: boolean;
  shift: boolean;
  strategy: DropdownMenuStrategy;
}

function computePosition({
  trigger,
  floating,
  placement,
  offset,
  collisionPadding,
  flip,
  shift,
  strategy,
}: ComputeOpts): { top: number; left: number; placement: DropdownMenuPlacement } {
  const { side, align } = parsePlacement(placement);
  const sx = strategy === "absolute" ? window.scrollX : 0;
  const sy = strategy === "absolute" ? window.scrollY : 0;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let chosen: DropdownMenuSide = side;
  if (flip) {
    if (side === "top" && trigger.top < floating.height + offset + collisionPadding) {
      if (vh - trigger.bottom >= floating.height + offset + collisionPadding) chosen = "bottom";
    } else if (
      side === "bottom" &&
      vh - trigger.bottom < floating.height + offset + collisionPadding
    ) {
      if (trigger.top >= floating.height + offset + collisionPadding) chosen = "top";
    } else if (side === "left" && trigger.left < floating.width + offset + collisionPadding) {
      if (vw - trigger.right >= floating.width + offset + collisionPadding) chosen = "right";
    } else if (
      side === "right" &&
      vw - trigger.right < floating.width + offset + collisionPadding
    ) {
      if (trigger.left >= floating.width + offset + collisionPadding) chosen = "left";
    }
  }

  let top = 0;
  let left = 0;
  if (chosen === "top" || chosen === "bottom") {
    top = chosen === "top" ? trigger.top - floating.height - offset : trigger.bottom + offset;
    if (align === "start") left = trigger.left;
    else if (align === "end") left = trigger.right - floating.width;
    else left = trigger.left + (trigger.width - floating.width) / 2;
  } else {
    left = chosen === "left" ? trigger.left - floating.width - offset : trigger.right + offset;
    if (align === "start") top = trigger.top;
    else if (align === "end") top = trigger.bottom - floating.height;
    else top = trigger.top + (trigger.height - floating.height) / 2;
  }

  if (shift) {
    if (chosen === "top" || chosen === "bottom") {
      const min = collisionPadding;
      const max = vw - floating.width - collisionPadding;
      if (max >= min) left = Math.max(min, Math.min(left, max));
    } else {
      const min = collisionPadding;
      const max = vh - floating.height - collisionPadding;
      if (max >= min) top = Math.max(min, Math.min(top, max));
    }
  }

  return { top: top + sy, left: left + sx, placement: buildPlacement(chosen, align) };
}

// ---------------------------------------------------------------------------
// SubMenu — renders a hover/keyboard-driven flyout for nested items.
// Anchored to the parent <li> rect; uses the same compute-position helper.
// ---------------------------------------------------------------------------

interface SubMenuProps {
  parentRef: React.RefObject<HTMLLIElement>;
  items: DropdownMenuItem[];
  size: DropdownMenuSize;
  collisionPadding: number;
  flip: boolean;
  shift: boolean;
  strategy: DropdownMenuStrategy;
  onCloseAll: () => void;
  onCloseSelf: () => void;
}

function SubMenu({
  parentRef,
  items,
  size,
  collisionPadding,
  flip,
  shift,
  strategy,
  onCloseAll,
  onCloseSelf,
}: SubMenuProps) {
  const subId = useId();
  const subRef = useRef<HTMLUListElement>(null);
  const [resolvedPlacement, setResolvedPlacement] =
    useState<DropdownMenuPlacement>("right-start");
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: -9999, left: -9999 });
  const [activeIndex, setActiveIndex] = useState(0);

  const visibleItems = items.filter((it) => !it.divider);

  const reposition = useCallback(() => {
    if (!parentRef.current || !subRef.current) return;
    const pos = computePosition({
      trigger: parentRef.current.getBoundingClientRect(),
      floating: subRef.current.getBoundingClientRect(),
      placement: "right-start",
      offset: 4,
      collisionPadding,
      flip,
      shift,
      strategy,
    });
    setCoords({ top: pos.top, left: pos.left });
    setResolvedPlacement(pos.placement);
  }, [parentRef, collisionPadding, flip, shift, strategy]);

  useEffect(() => {
    requestAnimationFrame(() => reposition());
  }, [reposition]);

  useEffect(() => {
    const onScroll = () => reposition();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reposition]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLUListElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % visibleItems.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + visibleItems.length) % visibleItems.length);
      } else if (e.key === "ArrowLeft" || e.key === "Escape") {
        e.preventDefault();
        onCloseSelf();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const item = visibleItems[activeIndex];
        if (item && !item.disabled) {
          item.onClick?.();
          onCloseAll();
        }
      } else if (e.key === "Tab") {
        onCloseAll();
      }
    },
    [visibleItems, activeIndex, onCloseAll, onCloseSelf],
  );

  useEffect(() => {
    requestAnimationFrame(() => subRef.current?.focus());
  }, []);

  let visibleIndex = -1;
  return createPortal(
    <ul
      ref={subRef}
      id={subId}
      role="menu"
      className="rdrop-menu rdrop-submenu"
      data-placement={resolvedPlacement}
      data-size={size}
      data-open="true"
      tabIndex={-1}
      style={{ position: strategy, top: coords.top, left: coords.left, zIndex: 10000 }}
      onKeyDown={handleKeyDown}
    >
      {items.map((item, rawIndex) => {
        if (item.divider) {
          return <li key={rawIndex} role="separator" className="rdrop-divider" aria-hidden="true" />;
        }
        visibleIndex += 1;
        const curIdx = visibleIndex;
        const isActive = activeIndex === curIdx;
        return (
          <li
            key={rawIndex}
            role="menuitem"
            tabIndex={isActive ? 0 : -1}
            className="rdrop-item"
            data-active={isActive ? "true" : undefined}
            data-disabled={item.disabled ? "true" : undefined}
            aria-disabled={item.disabled}
            onMouseEnter={() => setActiveIndex(curIdx)}
            onClick={() => {
              if (item.disabled) return;
              item.onClick?.();
              onCloseAll();
            }}
          >
            {item.icon && <span className="rdrop-item-icon" aria-hidden="true">{item.icon}</span>}
            <span className="rdrop-item-label">{item.label}</span>
          </li>
        );
      })}
    </ul>,
    document.body,
  );
}

// ---------------------------------------------------------------------------
// Helpers for rendering checkbox / radio items
// ---------------------------------------------------------------------------

function itemRole(kind: DropdownMenuItemKind | undefined): "menuitem" | "menuitemcheckbox" | "menuitemradio" {
  if (kind === "checkbox") return "menuitemcheckbox";
  if (kind === "radio") return "menuitemradio";
  return "menuitem";
}

function itemClassName(kind: DropdownMenuItemKind | undefined, extraClasses: string[]): string {
  const base = "rdrop-item";
  const kindClass = kind === "checkbox" ? "rdrop-item-check" : kind === "radio" ? "rdrop-item-radio" : "";
  return [base, kindClass, ...extraClasses].filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------------
// Groups radio items with a role="group" wrapper
// ---------------------------------------------------------------------------

type GroupedItemsEntry =
  | { type: "item"; item: DropdownMenuItem; rawIndex: number }
  | { type: "divider"; rawIndex: number }
  | { type: "group"; groupName: string; items: Array<{ item: DropdownMenuItem; rawIndex: number }> };

function groupItems(items: DropdownMenuItem[]): GroupedItemsEntry[] {
  const result: GroupedItemsEntry[] = [];
  let i = 0;
  while (i < items.length) {
    const item = items[i]!;
    if (item.divider) {
      result.push({ type: "divider", rawIndex: i });
      i++;
      continue;
    }
    if (item.kind === "radio" && item.group) {
      const groupName = item.group;
      const groupEntries: Array<{ item: DropdownMenuItem; rawIndex: number }> = [];
      while (i < items.length && items[i]!.kind === "radio" && items[i]!.group === groupName) {
        groupEntries.push({ item: items[i]!, rawIndex: i });
        i++;
      }
      result.push({ type: "group", groupName, items: groupEntries });
    } else {
      result.push({ type: "item", item, rawIndex: i });
      i++;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Main styled component
// ---------------------------------------------------------------------------

export const DropdownMenuStyled = forwardRef<HTMLElement, DropdownMenuStyledProps>(
  function DropdownMenuStyled(
    {
      trigger,
      items: itemsProp = [],
      placement = "bottom-start",
      size = "md",
      className,
      offset = 4,
      collisionPadding = 8,
      flip = true,
      shift = true,
      strategy = "absolute",
      loadItems,
      loadingText = "Loading…",
      errorText = "Failed to load",
    },
    ref,
  ) {
    const [resolvedPlacement, setResolvedPlacement] =
      useState<DropdownMenuPlacement>(placement);
    const menuId = useId();
    const [isOpen, setIsOpen] = useState(false);
    const [rendered, setRendered] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [openSubmenuIndex, setOpenSubmenuIndex] = useState<number | null>(null);
    const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
    const [coords, setCoords] = useState<{ top: number; left: number }>({ top: -9999, left: -9999 });
    const [mounted, setMounted] = useState(false);

    // Async loadItems state
    const [loadedItems, setLoadedItems] = useState<DropdownMenuItem[] | null>(null);
    const [loadState, setLoadState] = useState<"idle" | "loading" | "error">("idle");

    const triggerRef = useRef<HTMLElement>(null);
    const menuRef = useRef<HTMLUListElement>(null);
    const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => { setMounted(true); }, []);

    const items = loadItems ? (loadedItems ?? []) : itemsProp;
    const visibleItems = items.filter((item) => !item.divider);

    const open = useCallback(() => {
      if (exitTimerRef.current) { clearTimeout(exitTimerRef.current); exitTimerRef.current = null; }
      setRendered(true);
      setIsOpen(false);
      setActiveIndex(0);
      requestAnimationFrame(() => requestAnimationFrame(() => setIsOpen(true)));
    }, []);

    const close = useCallback(() => {
      setIsOpen(false);
      setActiveIndex(-1);
      setOpenSubmenuIndex(null);
      exitTimerRef.current = setTimeout(() => setRendered(false), 150);
      triggerRef.current?.focus();
    }, []);

    // Fire loadItems once per open session
    useEffect(() => {
      if (!isOpen || !loadItems) return;
      if (loadedItems !== null) return; // already fetched this session
      setLoadState("loading");
      let cancelled = false;
      loadItems()
        .then((result) => {
          if (!cancelled) {
            setLoadedItems(result);
            setLoadState("idle");
          }
        })
        .catch(() => {
          if (!cancelled) setLoadState("error");
        });
      return () => { cancelled = true; };
    }, [isOpen, loadItems, loadedItems]);

    // Reset loaded items when menu closes (one fetch per open session)
    useEffect(() => {
      if (!isOpen && loadItems) {
        setLoadedItems(null);
        setLoadState("idle");
      }
    }, [isOpen, loadItems]);

    const updateCoords = useCallback(() => {
      if (!triggerRef.current || !menuRef.current) return;
      const pos = computePosition({
        trigger: triggerRef.current.getBoundingClientRect(),
        floating: menuRef.current.getBoundingClientRect(),
        placement,
        offset,
        collisionPadding,
        flip,
        shift,
        strategy,
      });
      setCoords({ top: pos.top, left: pos.left });
      setResolvedPlacement(pos.placement);
    }, [placement, offset, collisionPadding, flip, shift, strategy]);

    useEffect(() => {
      if (rendered) requestAnimationFrame(() => updateCoords());
    }, [rendered, updateCoords]);

    useEffect(() => {
      if (!rendered) return;
      const onScroll = () => updateCoords();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
    }, [rendered, updateCoords]);

    useEffect(() => {
      if (!rendered) return;
      const onPointerDown = (e: PointerEvent) => {
        if (!triggerRef.current?.contains(e.target as Node) && !menuRef.current?.contains(e.target as Node)) {
          close();
        }
      };
      document.addEventListener("pointerdown", onPointerDown);
      return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [rendered, close]);

    useEffect(() => () => { if (exitTimerRef.current) clearTimeout(exitTimerRef.current); }, []);

    const handleTriggerKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); isOpen ? close() : open(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); isOpen ? setActiveIndex((i) => (i + 1) % Math.max(visibleItems.length, 1)) : open(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); isOpen ? setActiveIndex((i) => (i - 1 + Math.max(visibleItems.length, 1)) % Math.max(visibleItems.length, 1)) : open(); }
      else if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "Tab") close();
    }, [isOpen, visibleItems.length, open, close]);

    const handleMenuKeyDown = useCallback((e: React.KeyboardEvent<HTMLUListElement>) => {
      if (openSubmenuIndex !== null) return;
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((i) => (i + 1) % Math.max(visibleItems.length, 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((i) => (i - 1 + Math.max(visibleItems.length, 1)) % Math.max(visibleItems.length, 1)); }
      else if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "Tab") close();
      else if (e.key === "ArrowRight") {
        const item = visibleItems[activeIndex];
        if (item && item.items && item.items.length > 0 && !item.disabled) {
          e.preventDefault();
          setOpenSubmenuIndex(activeIndex);
        }
      }
      else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const item = visibleItems[activeIndex];
        if (!item || item.disabled) return;
        if (item.items && item.items.length > 0) {
          setOpenSubmenuIndex(activeIndex);
          return;
        }
        item.onClick?.();
        close();
      }
    }, [visibleItems, activeIndex, openSubmenuIndex, close]);

    const triggerEl = isValidElement(trigger)
      ? cloneElement(trigger as ReactElement<Record<string, unknown>>, {
          ref: (el: HTMLElement | null) => {
            (triggerRef as React.MutableRefObject<HTMLElement | null>).current = el;
            if (typeof ref === "function") ref(el);
            else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = el;
            const childRef = (trigger as ReactElement & { ref?: React.Ref<unknown> }).ref;
            if (typeof childRef === "function") childRef(el);
            else if (childRef && typeof childRef === "object") (childRef as React.MutableRefObject<HTMLElement | null>).current = el;
          },
          "aria-haspopup": "menu",
          "aria-expanded": isOpen,
          "aria-controls": isOpen ? menuId : undefined,
          "data-open": isOpen ? "true" : undefined,
          onClick: (e: React.MouseEvent) => {
            isOpen ? close() : open();
            (trigger.props as { onClick?: (e: React.MouseEvent) => void }).onClick?.(e);
          },
          onKeyDown: (e: React.KeyboardEvent) => {
            handleTriggerKeyDown(e);
            (trigger.props as { onKeyDown?: (e: React.KeyboardEvent) => void }).onKeyDown?.(e);
          },
        })
      : trigger;

    const menuStyle: CSSProperties = { position: strategy, top: coords.top, left: coords.left, zIndex: 9999 };

    // Build grouped structure for radio support
    const grouped = groupItems(items);

    // Track visible index across groups for activeIndex alignment
    let visibleIndexCounter = -1;

    function renderItem(item: DropdownMenuItem, rawIndex: number, extraTabIndex?: number): ReactNode {
      visibleIndexCounter += 1;
      const curIdx = visibleIndexCounter;
      const isActive = activeIndex === curIdx;
      const hasChildren = !!item.items && item.items.length > 0;
      const isSubOpen = openSubmenuIndex === curIdx;
      const kind = item.kind ?? "item";
      const role = itemRole(kind);

      return (
        <li
          key={rawIndex}
          ref={(el) => { itemRefs.current[curIdx] = el; }}
          role={role}
          tabIndex={extraTabIndex !== undefined ? extraTabIndex : (isActive ? 0 : -1)}
          className={itemClassName(kind, [hasChildren ? "rdrop-item--has-submenu" : ""])}
          data-active={isActive ? "true" : undefined}
          data-disabled={item.disabled ? "true" : undefined}
          data-submenu-open={isSubOpen ? "true" : undefined}
          aria-checked={kind !== "item" ? (item.checked ?? false) : undefined}
          aria-haspopup={hasChildren ? "menu" : undefined}
          aria-expanded={hasChildren ? isSubOpen : undefined}
          aria-disabled={item.disabled}
          onMouseEnter={() => {
            setActiveIndex(curIdx);
            if (hasChildren && !item.disabled) setOpenSubmenuIndex(curIdx);
            else setOpenSubmenuIndex(null);
          }}
          onClick={(e) => {
            if (item.disabled) return;
            if (hasChildren) {
              e.stopPropagation();
              setOpenSubmenuIndex(curIdx);
              return;
            }
            item.onClick?.();
            close();
          }}
        >
          <span className="rdrop-item-indicator-slot" aria-hidden="true">
            {kind === "checkbox" && item.checked && <CheckIcon />}
            {kind === "radio" && item.checked && <RadioDot />}
          </span>
          {item.icon && <span className="rdrop-item-icon" aria-hidden="true">{item.icon}</span>}
          <span className="rdrop-item-label">{item.label}</span>
          {item.shortcut && <kbd className="rdrop-kbd">{item.shortcut}</kbd>}
          {hasChildren && <SubmenuChevron />}
          {hasChildren && isSubOpen && (
            <SubMenu
              parentRef={{ current: itemRefs.current[curIdx] ?? null }}
              items={item.items!}
              size={size}
              collisionPadding={collisionPadding}
              flip={flip}
              shift={shift}
              strategy={strategy}
              onCloseAll={close}
              onCloseSelf={() => setOpenSubmenuIndex(null)}
            />
          )}
        </li>
      );
    }

    return (
      <span className={["rdrop-root", className].filter(Boolean).join(" ")}>
        {triggerEl}
        {mounted && rendered && createPortal(
          <ul
            ref={menuRef}
            id={menuId}
            role="menu"
            className="rdrop-menu"
            data-placement={resolvedPlacement}
            data-size={size}
            data-open={isOpen ? "true" : undefined}
            tabIndex={-1}
            style={menuStyle}
            onKeyDown={handleMenuKeyDown}
          >
            {loadState === "loading" && (
              <li className="rdrop-loading" role="presentation" aria-live="polite">
                <SpinnerIcon />
                <span>{loadingText}</span>
              </li>
            )}
            {loadState === "error" && (
              <li className="rdrop-error" role="presentation" aria-live="assertive">
                {errorText}
              </li>
            )}
            {loadState === "idle" && grouped.map((entry) => {
              if (entry.type === "divider") {
                return <li key={entry.rawIndex} role="separator" className="rdrop-divider" aria-hidden="true" />;
              }
              if (entry.type === "group") {
                return (
                  <li key={entry.groupName} role="presentation">
                    <ul role="group" aria-label={entry.groupName} className="rdrop-radio-group">
                      {entry.items.map(({ item, rawIndex }) => renderItem(item, rawIndex))}
                    </ul>
                  </li>
                );
              }
              return renderItem(entry.item, entry.rawIndex);
            })}
          </ul>,
          document.body,
        )}
      </span>
    );
  },
);
