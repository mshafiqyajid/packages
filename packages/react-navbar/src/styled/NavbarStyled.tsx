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
  href?: string;
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
        data-sticky={sticky ? "true" : undefined}
        data-scrolled={isScrolled ? "true" : undefined}
        data-menu-open={isMenuOpen ? "true" : undefined}
        style={style}
      >
        <div className="rnav-bar">
          <div className="rnav-inner">
            {/* Brand */}
            {brand && <div className="rnav-brand">{brand}</div>}

            {/* Desktop nav items */}
            {items && items.length > 0 && (
              <ul className="rnav-items">
                {items.map((item) => (
                  <li key={item.href ?? item.label} className="rnav-item">
                    {item.href ? (
                      <a
                        href={item.href}
                        className="rnav-item-link"
                        data-active={item.active ? "true" : undefined}
                        data-disabled={item.disabled ? "true" : undefined}
                        aria-current={item.active ? "page" : undefined}
                        aria-disabled={item.disabled ? true : undefined}
                        tabIndex={item.disabled ? -1 : undefined}
                      >
                        {item.icon && (
                          <span className="rnav-item-icon" aria-hidden="true">
                            {item.icon}
                          </span>
                        )}
                        {item.label}
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="rnav-item-link"
                        data-active={item.active ? "true" : undefined}
                        data-disabled={item.disabled ? "true" : undefined}
                        aria-disabled={item.disabled ? true : undefined}
                        tabIndex={item.disabled ? -1 : undefined}
                      >
                        {item.icon && (
                          <span className="rnav-item-icon" aria-hidden="true">
                            {item.icon}
                          </span>
                        )}
                        {item.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* Actions */}
            {actions && <div className="rnav-actions">{actions}</div>}

            {/* Mobile toggle */}
            {items && items.length > 0 && (
              <button
                type="button"
                className="rnav-mobile-toggle"
                {...toggleProps}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                <span
                  className="rnav-hamburger"
                  data-open={isMenuOpen ? "true" : undefined}
                  aria-hidden="true"
                >
                  <span className="rnav-hamburger-line" />
                  <span className="rnav-hamburger-line" />
                  <span className="rnav-hamburger-line" />
                </span>
              </button>
            )}

            {children}
          </div>
        </div>

        {/* Mobile menu */}
        {items && items.length > 0 && (
          <div
            {...menuProps}
            className="rnav-mobile-menu"
            data-open={isMenuOpen ? "true" : undefined}
            aria-hidden={!isMenuOpen}
          >
            {items.map((item) =>
              item.href ? (
                <a
                  key={item.href ?? item.label}
                  href={item.href}
                  className="rnav-mobile-item"
                  data-active={item.active ? "true" : undefined}
                  data-disabled={item.disabled ? "true" : undefined}
                  aria-current={item.active ? "page" : undefined}
                  aria-disabled={item.disabled ? true : undefined}
                  tabIndex={item.disabled ? -1 : undefined}
                >
                  {item.icon && (
                    <span className="rnav-item-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </a>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  className="rnav-mobile-item"
                  data-active={item.active ? "true" : undefined}
                  data-disabled={item.disabled ? "true" : undefined}
                  aria-disabled={item.disabled ? true : undefined}
                  tabIndex={item.disabled ? -1 : undefined}
                >
                  {item.icon && (
                    <span className="rnav-item-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </button>
              ),
            )}
            {actions && (
              <div
                style={{
                  paddingTop: "0.5rem",
                  borderTop: "1px solid var(--rnav-border)",
                  marginTop: "0.5rem",
                }}
              >
                {actions}
              </div>
            )}
          </div>
        )}
      </nav>
    );
  },
);

export const NavbarStyled = NavbarStyledInner;
