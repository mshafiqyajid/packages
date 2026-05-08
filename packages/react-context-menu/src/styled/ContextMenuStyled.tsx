import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
  type ReactNode,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ContextMenuItem {
  type?: "item" | "separator" | "label";
  label?: string;
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  onClick?: () => void;
  /** Nested sub-menu items */
  items?: ContextMenuItem[];
}

export interface ContextMenuStyledProps {
  /** Right-click target area */
  children: ReactNode;
  /** Menu items */
  items: ContextMenuItem[];
  /** Disable the entire context menu */
  disabled?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: CSSProperties;
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function ChevronRightIcon() {
  return (
    <svg
      className="rctx-item-chevron"
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

// ---------------------------------------------------------------------------
// Position helpers
// ---------------------------------------------------------------------------

interface MenuCoords {
  x: number;
  y: number;
}

function clampPosition(x: number, y: number, menuEl: HTMLDivElement | null): MenuCoords {
  if (!menuEl) return { x, y };
  const rect = menuEl.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = rect.width || 180;
  const h = rect.height || 300;
  return {
    x: Math.max(4, Math.min(x, vw - w - 4)),
    y: Math.max(4, Math.min(y, vh - h - 4)),
  };
}

// ---------------------------------------------------------------------------
// Sub-menu component (inline portal, anchored to parent item row)
// ---------------------------------------------------------------------------

interface SubMenuProps {
  parentRef: React.RefObject<HTMLLIElement>;
  items: ContextMenuItem[];
  onCloseAll: () => void;
  onCloseSelf: () => void;
}

function SubMenu({ parentRef, items, onCloseAll, onCloseSelf }: SubMenuProps) {
  const subId = useId();
  const subRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<MenuCoords>({ x: -9999, y: -9999 });
  const [focusedIndex, setFocusedIndex] = useState(0);

  const navigableItems = items.filter((it) => !it.type || it.type === "item");

  const reposition = useCallback(() => {
    if (!parentRef.current || !subRef.current) return;
    const rect = parentRef.current.getBoundingClientRect();
    const subRect = subRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = subRect.width || 180;
    const h = subRect.height || 200;

    let x = rect.right + 4;
    let y = rect.top;

    // Flip to left if would overflow right
    if (x + w > vw - 4) x = rect.left - w - 4;
    // Shift up if would overflow bottom
    if (y + h > vh - 4) y = Math.max(4, vh - h - 4);

    setCoords({ x, y });
  }, [parentRef]);

  useEffect(() => {
    requestAnimationFrame(() => {
      reposition();
      subRef.current?.focus();
    });
  }, [reposition]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((i) => (i + 1) % Math.max(navigableItems.length, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex(
          (i) => (i - 1 + Math.max(navigableItems.length, 1)) % Math.max(navigableItems.length, 1),
        );
      } else if (e.key === "ArrowLeft" || e.key === "Escape") {
        e.preventDefault();
        onCloseSelf();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const item = navigableItems[focusedIndex];
        if (item && !item.disabled) {
          item.onClick?.();
          onCloseAll();
        }
      } else if (e.key === "Tab") {
        onCloseAll();
      } else if (e.key.length === 1) {
        // First-letter jump
        const letter = e.key.toLowerCase();
        const start = focusedIndex + 1;
        const all = [...navigableItems.slice(start), ...navigableItems.slice(0, start)];
        const match = all.findIndex(
          (it) => !it.disabled && it.label?.toLowerCase().startsWith(letter),
        );
        if (match !== -1) {
          const realIndex = (start + match) % navigableItems.length;
          setFocusedIndex(realIndex);
        }
      }
    },
    [navigableItems, focusedIndex, onCloseAll, onCloseSelf],
  );

  let navIndex = -1;
  return createPortal(
    <div
      ref={subRef}
      id={subId}
      role="menu"
      aria-orientation="vertical"
      className="rctx-menu rctx-submenu"
      data-state="open"
      tabIndex={-1}
      style={{ position: "fixed", top: coords.y, left: coords.x, zIndex: 10000 }}
      onKeyDown={handleKeyDown}
    >
      <ul className="rctx-item-list" role="presentation">
        {items.map((item, rawIndex) => {
          const itemType = item.type ?? "item";

          if (itemType === "separator") {
            return (
              <li key={rawIndex} role="separator" className="rctx-separator" aria-hidden="true" />
            );
          }

          if (itemType === "label") {
            return (
              <li key={rawIndex} role="presentation" className="rctx-label">
                {item.label}
              </li>
            );
          }

          navIndex += 1;
          const curIdx = navIndex;
          const isFocused = focusedIndex === curIdx;

          return (
            <li
              key={rawIndex}
              role="menuitem"
              tabIndex={isFocused ? 0 : -1}
              className="rctx-item"
              data-focused={isFocused ? "true" : undefined}
              data-disabled={item.disabled ? "true" : undefined}
              aria-disabled={item.disabled}
              onMouseEnter={() => setFocusedIndex(curIdx)}
              onClick={() => {
                if (item.disabled) return;
                item.onClick?.();
                onCloseAll();
              }}
            >
              {item.icon && (
                <span className="rctx-item-icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className="rctx-item-label">{item.label}</span>
              {item.shortcut && <kbd className="rctx-item-shortcut">{item.shortcut}</kbd>}
            </li>
          );
        })}
      </ul>
    </div>,
    document.body,
  );
}

// ---------------------------------------------------------------------------
// Main styled component
// ---------------------------------------------------------------------------

export function ContextMenuStyled({
  children,
  items,
  disabled = false,
  open: controlledOpen,
  onOpenChange,
  className,
  style,
}: ContextMenuStyledProps) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const [position, setPosition] = useState<MenuCoords>({ x: 0, y: 0 });
  const [originPoint, setOriginPoint] = useState<MenuCoords>({ x: 0, y: 0 });
  const [rendered, setRendered] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [openSubmenuIndex, setOpenSubmenuIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => () => { if (exitTimerRef.current) clearTimeout(exitTimerRef.current); }, []);

  const isOpen = isControlled ? (controlledOpen ?? false) : internalOpen;

  const setOpenState = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const close = useCallback(() => {
    setAnimateIn(false);
    setOpenState(false);
    setFocusedIndex(-1);
    setOpenSubmenuIndex(null);
    exitTimerRef.current = setTimeout(() => setRendered(false), 130);
  }, [setOpenState]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      const rawX = e.clientX;
      const rawY = e.clientY;

      if (exitTimerRef.current) { clearTimeout(exitTimerRef.current); exitTimerRef.current = null; }

      setOriginPoint({ x: rawX, y: rawY });
      setPosition({ x: rawX, y: rawY });
      setRendered(true);
      setAnimateIn(false);
      setFocusedIndex(-1);
      setOpenSubmenuIndex(null);
      setOpenState(true);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (menuRef.current) {
            const clamped = clampPosition(rawX, rawY, menuRef.current);
            setPosition(clamped);
          }
          setAnimateIn(true);
          menuRef.current?.focus();
        });
      });
    },
    [disabled, setOpenState],
  );

  // Outside click
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, close]);

  // Scroll closes menu
  useEffect(() => {
    if (!isOpen) return;
    const onScroll = () => close();
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", onScroll, { capture: true });
  }, [isOpen, close]);

  // Build navigable items (skip separator + label for index tracking)
  const navigableItems = items.filter((it) => !it.type || it.type === "item");
  const navigableCount = Math.max(navigableItems.length, 1);

  const handleMenuKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (openSubmenuIndex !== null) return;

      if (e.key === "Escape") {
        e.preventDefault();
        close();
        triggerRef.current?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((i) => {
          let next = (i + 1) % navigableCount;
          // Find next non-disabled
          let attempts = 0;
          while (navigableItems[next]?.disabled && attempts < navigableCount) {
            next = (next + 1) % navigableCount;
            attempts++;
          }
          return next;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((i) => {
          let prev = (i - 1 + navigableCount) % navigableCount;
          let attempts = 0;
          while (navigableItems[prev]?.disabled && attempts < navigableCount) {
            prev = (prev - 1 + navigableCount) % navigableCount;
            attempts++;
          }
          return prev;
        });
      } else if (e.key === "ArrowRight") {
        const item = navigableItems[focusedIndex];
        if (item?.items && item.items.length > 0 && !item.disabled) {
          e.preventDefault();
          setOpenSubmenuIndex(focusedIndex);
        }
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const item = navigableItems[focusedIndex];
        if (!item || item.disabled) return;
        if (item.items && item.items.length > 0) {
          setOpenSubmenuIndex(focusedIndex);
          return;
        }
        item.onClick?.();
        close();
      } else if (e.key === "Tab") {
        close();
      } else if (e.key.length === 1) {
        // First-letter jump navigation
        const letter = e.key.toLowerCase();
        const start = focusedIndex + 1;
        const rotated = [
          ...navigableItems.slice(start),
          ...navigableItems.slice(0, start),
        ];
        const match = rotated.findIndex(
          (it) => !it.disabled && it.label?.toLowerCase().startsWith(letter),
        );
        if (match !== -1) {
          const realIndex = (start + match) % navigableItems.length;
          setFocusedIndex(realIndex);
        }
      }
    },
    [openSubmenuIndex, navigableItems, navigableCount, focusedIndex, close],
  );

  // Transform origin for scale animation from click point
  const transformOrigin = animateIn
    ? `${originPoint.x - position.x}px ${originPoint.y - position.y}px`
    : "0 0";

  let navIndex = -1;

  return (
    <div
      ref={triggerRef}
      className={["rctx-trigger", className].filter(Boolean).join(" ")}
      style={style}
      onContextMenu={handleContextMenu}
      aria-haspopup="menu"
      aria-disabled={disabled || undefined}
    >
      {children}
      {mounted && rendered && createPortal(
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          className="rctx-menu"
          data-state={animateIn && isOpen ? "open" : "closed"}
          tabIndex={-1}
          style={{
            position: "fixed",
            top: position.y,
            left: position.x,
            zIndex: 9999,
            transformOrigin,
          }}
          onKeyDown={handleMenuKeyDown}
        >
          <ul className="rctx-item-list" role="presentation">
            {items.map((item, rawIndex) => {
              const itemType = item.type ?? "item";

              if (itemType === "separator") {
                return (
                  <li
                    key={rawIndex}
                    role="separator"
                    className="rctx-separator"
                    aria-hidden="true"
                  />
                );
              }

              if (itemType === "label") {
                return (
                  <li key={rawIndex} role="presentation" className="rctx-label">
                    {item.label}
                  </li>
                );
              }

              navIndex += 1;
              const curIdx = navIndex;
              const isFocused = focusedIndex === curIdx;
              const hasSubmenu = !!item.items && item.items.length > 0;
              const isSubOpen = openSubmenuIndex === curIdx;

              return (
                <li
                  key={rawIndex}
                  ref={(el) => { itemRefs.current[curIdx] = el; }}
                  role="menuitem"
                  tabIndex={isFocused ? 0 : -1}
                  className={["rctx-item", hasSubmenu ? "rctx-item--has-submenu" : ""]
                    .filter(Boolean)
                    .join(" ")}
                  data-focused={isFocused ? "true" : undefined}
                  data-disabled={item.disabled ? "true" : undefined}
                  aria-disabled={item.disabled}
                  aria-haspopup={hasSubmenu ? "menu" : undefined}
                  aria-expanded={hasSubmenu ? isSubOpen : undefined}
                  onMouseEnter={() => {
                    setFocusedIndex(curIdx);
                    if (hasSubmenu && !item.disabled) {
                      setOpenSubmenuIndex(curIdx);
                    } else {
                      setOpenSubmenuIndex(null);
                    }
                  }}
                  onClick={(e) => {
                    if (item.disabled) return;
                    if (hasSubmenu) {
                      e.stopPropagation();
                      setOpenSubmenuIndex(curIdx);
                      return;
                    }
                    item.onClick?.();
                    close();
                  }}
                >
                  {item.icon && (
                    <span className="rctx-item-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  <span className="rctx-item-label">{item.label}</span>
                  {item.shortcut && (
                    <kbd className="rctx-item-shortcut">{item.shortcut}</kbd>
                  )}
                  {hasSubmenu && <ChevronRightIcon />}
                  {hasSubmenu && isSubOpen && (
                    <SubMenu
                      parentRef={{ current: itemRefs.current[curIdx] ?? null }}
                      items={item.items!}
                      onCloseAll={close}
                      onCloseSelf={() => setOpenSubmenuIndex(null)}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </div>,
        document.body,
      )}
    </div>
  );
}
