import {
  type CSSProperties,
  type ReactNode,
  forwardRef,
} from "react";
import { useNavbar } from "../useNavbar";

export type NavbarVariant = "default" | "bordered" | "filled" | "transparent";
export type NavbarSize = "sm" | "md" | "lg";

export interface NavbarItem {
  label: string;
  href: string;
  active?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface NavbarStyledProps {
  brand?: ReactNode;
  items?: NavbarItem[];
  actions?: ReactNode;
  variant?: NavbarVariant;
  size?: NavbarSize;
  sticky?: boolean;
  transparentOnTop?: boolean;
  scrollThreshold?: number;
  mobileBreakpoint?: number;
  onMenuToggle?: (open: boolean) => void;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

// ============================================================================
// Sub-components
// ============================================================================

function NavbarBrand({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={`rnav-brand${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}

function NavbarItems({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={`rnav-items${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}

function NavbarItem({
  children,
  href,
  active,
  disabled,
  className,
}: {
  children?: ReactNode;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <a
      href={disabled ? undefined : href}
      className={`rnav-item${className ? ` ${className}` : ""}`}
      data-active={active ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      aria-disabled={disabled ? true : undefined}
      tabIndex={disabled ? -1 : undefined}
    >
      {children}
    </a>
  );
}

function NavbarActions({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={`rnav-actions${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}

// ============================================================================
// Hamburger icon
// ============================================================================

function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className="rnav-hamburger-icon"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      {isOpen ? (
        <>
          <line
            x1="4" y1="4" x2="16" y2="16"
            stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
          />
          <line
            x1="16" y1="4" x2="4" y2="16"
            stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <line
            x1="3" y1="6" x2="17" y2="6"
            stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
          />
          <line
            x1="3" y1="10" x2="17" y2="10"
            stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
          />
          <line
            x1="3" y1="14" x2="17" y2="14"
            stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

// ============================================================================
// Main component
// ============================================================================

const NavbarStyledInner = forwardRef<HTMLElement, NavbarStyledProps>(
  function NavbarStyledInner(
    {
      brand,
      items,
      actions,
      variant = "default",
      size = "md",
      sticky = false,
      transparentOnTop = false,
      scrollThreshold = 16,
      mobileBreakpoint = 768,
      onMenuToggle,
      children,
      className,
      style,
    },
    ref,
  ) {
    const { navProps, menuProps, toggleProps, isMenuOpen, isScrolled } =
      useNavbar({ scrollThreshold, onMenuToggle });

    const effectiveVariant =
      transparentOnTop && !isScrolled ? "transparent" : variant;

    return (
      <nav
        ref={ref}
        {...navProps}
        className={`rnav-root${className ? ` ${className}` : ""}`}
        data-variant={effectiveVariant}
        data-size={size}
        data-sticky={sticky ? "" : undefined}
        data-scrolled={isScrolled ? "" : undefined}
        data-menu-open={isMenuOpen ? "" : undefined}
        style={
          {
            "--rnav-mobile-breakpoint": `${mobileBreakpoint}px`,
            ...style,
          } as CSSProperties
        }
      >
        <div className="rnav-bar">
          {brand !== undefined && (
            <div className="rnav-brand-slot">{brand}</div>
          )}

          {items && items.length > 0 && (
            <div className="rnav-items-slot rnav-desktop-only">
              {items.map((item) => (
                <a
                  key={item.href}
                  href={item.disabled ? undefined : item.href}
                  className="rnav-item"
                  data-active={item.active ? "" : undefined}
                  data-disabled={item.disabled ? "" : undefined}
                  aria-disabled={item.disabled ? true : undefined}
                  aria-current={item.active ? "page" : undefined}
                  tabIndex={item.disabled ? -1 : undefined}
                >
                  {item.icon && (
                    <span className="rnav-item-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </a>
              ))}
            </div>
          )}

          <div className="rnav-spacer" />

          {actions && (
            <div className="rnav-actions-slot rnav-desktop-only">
              {actions}
            </div>
          )}

          {(items && items.length > 0) || children ? (
            <button
              type="button"
              className="rnav-toggle rnav-mobile-only"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              {...toggleProps}
            >
              <HamburgerIcon isOpen={isMenuOpen} />
            </button>
          ) : null}

          {children}
        </div>

        {((items && items.length > 0) || actions) && (
          <div
            {...menuProps}
            className="rnav-mobile-menu rnav-mobile-only"
            aria-hidden={!isMenuOpen}
          >
            {items && items.length > 0 && (
              <div className="rnav-mobile-items">
                {items.map((item) => (
                  <a
                    key={item.href}
                    href={item.disabled ? undefined : item.href}
                    className="rnav-item rnav-mobile-item"
                    data-active={item.active ? "" : undefined}
                    data-disabled={item.disabled ? "" : undefined}
                    aria-disabled={item.disabled ? true : undefined}
                    aria-current={item.active ? "page" : undefined}
                    tabIndex={item.disabled ? -1 : undefined}
                  >
                    {item.icon && (
                      <span className="rnav-item-icon" aria-hidden="true">
                        {item.icon}
                      </span>
                    )}
                    {item.label}
                  </a>
                ))}
              </div>
            )}

            {actions && (
              <div className="rnav-mobile-actions">{actions}</div>
            )}
          </div>
        )}
      </nav>
    );
  },
);

export const NavbarStyled = Object.assign(NavbarStyledInner, {
  Brand: NavbarBrand,
  Items: NavbarItems,
  Item: NavbarItem,
  Actions: NavbarActions,
});
