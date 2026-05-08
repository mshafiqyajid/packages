import {
  forwardRef,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useSidebar, type SidebarItem, type SidebarSection } from "../useSidebar";

// ─── Prop types ───────────────────────────────────────────────────────────────

export type SidebarVariant = "default" | "bordered" | "filled" | "floating";
export type SidebarSize = "sm" | "md" | "lg";

export interface SidebarStyledProps {
  items: SidebarSection[];
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  showCollapseButton?: boolean;
  variant?: SidebarVariant;
  size?: SidebarSize;
  activeId?: string;
  onItemClick?: (id: string, item: SidebarItem) => void;
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

// ─── Icon helpers ─────────────────────────────────────────────────────────────

function ChevronLeftIcon() {
  return (
    <svg
      className="rsb-collapse-icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 12L6 8l4-4" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={["rsb-item-chevron", className].filter(Boolean).join(" ")}
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
      <path d="M3 4.5l3 3 3-3" />
    </svg>
  );
}

// ─── Recursive item renderer ──────────────────────────────────────────────────

interface ItemRendererProps {
  item: SidebarItem;
  depth: number;
  isCollapsed: boolean;
  activeId: string | undefined;
  isExpanded: (id: string) => boolean;
  getItemProps: ReturnType<typeof useSidebar>["getItemProps"];
  getSectionProps: ReturnType<typeof useSidebar>["getSectionProps"];
  registerItemRef: ReturnType<typeof useSidebar>["registerItemRef"];
}

function ItemRenderer({
  item,
  depth,
  isCollapsed,
  activeId,
  isExpanded,
  getItemProps,
  getSectionProps,
  registerItemRef,
}: ItemRendererProps) {
  const itemProps = getItemProps(item);
  const hasChildren = (item.children?.length ?? 0) > 0;
  const expanded = hasChildren ? isExpanded(item.id) : false;
  const isActive = activeId ? item.id === activeId : (item.active ?? false);

  const content = (
    <div
      ref={(el) => registerItemRef(item.id, el)}
      {...itemProps}
      className={[
        "rsb-item",
        isActive ? "rsb-item--active" : "",
        item.disabled ? "rsb-item--disabled" : "",
        hasChildren ? "rsb-item--parent" : "",
        depth > 0 ? "rsb-item--nested" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ ["--rsb-depth" as string]: String(depth) }}
      aria-current={isActive ? "page" : undefined}
      title={isCollapsed && depth === 0 ? item.label : undefined}
    >
      <span className="rsb-item-inner">
        {item.icon && (
          <span className="rsb-item-icon" aria-hidden="true">
            {item.icon}
          </span>
        )}
        <span className="rsb-item-label">{item.label}</span>
        {item.badge !== undefined && (
          <span className="rsb-item-badge">{item.badge}</span>
        )}
        {hasChildren && (
          <ChevronDownIcon className={expanded ? "rsb-item-chevron--open" : ""} />
        )}
      </span>
    </div>
  );

  if (!hasChildren) {
    return (
      <li role="none">
        {item.href && !item.disabled ? (
          <a
            href={item.href}
            className="rsb-item-link"
            tabIndex={-1}
            aria-hidden="true"
          >
            {content}
          </a>
        ) : (
          content
        )}
      </li>
    );
  }

  const sectionProps = getSectionProps(item.id, item.label);

  return (
    <li role="none">
      {content}
      {expanded && !isCollapsed && (
        <ul
          {...sectionProps}
          role="list"
          className="rsb-nested-list"
        >
          {item.children!.map((child) => (
            <ItemRenderer
              key={child.id}
              item={child}
              depth={depth + 1}
              isCollapsed={isCollapsed}
              activeId={activeId}
              isExpanded={isExpanded}
              getItemProps={getItemProps}
              getSectionProps={getSectionProps}
              registerItemRef={registerItemRef}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// ─── Main styled component ────────────────────────────────────────────────────

export const SidebarStyled = forwardRef<HTMLElement, SidebarStyledProps>(
  function SidebarStyled(props, ref) {
    const {
      items: sections,
      collapsed,
      defaultCollapsed,
      onCollapse,
      showCollapseButton = true,
      variant = "default",
      size = "md",
      activeId,
      onItemClick,
      header,
      footer,
      children,
      className,
      style,
    } = props;

    const internalRef = useRef<HTMLElement>(null);

    const {
      isCollapsed,
      toggle,
      isExpanded,
      getItemProps,
      getSectionProps,
      registerItemRef,
      sidebarProps,
    } = useSidebar({
      collapsed,
      defaultCollapsed,
      onCollapse,
      activeId,
      onItemClick,
      sections,
    });

    // Forward external ref to the nav element
    const navRef = (el: HTMLElement | null) => {
      (internalRef as React.MutableRefObject<HTMLElement | null>).current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = el;
      (sidebarProps.ref as React.MutableRefObject<HTMLElement | null>).current = el;
    };

    return (
      <nav
        ref={navRef}
        role={sidebarProps.role}
        aria-label={sidebarProps["aria-label"]}
        className={["rsb-root", className].filter(Boolean).join(" ")}
        data-collapsed={isCollapsed ? "true" : undefined}
        data-variant={variant}
        data-size={size}
        style={style}
      >
        {header && (
          <div className="rsb-header">
            <span className="rsb-header-content">{header}</span>
          </div>
        )}

        <div className="rsb-content">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="rsb-section">
              {section.label && (
                <div className="rsb-section-label" aria-hidden="true">
                  {section.label}
                </div>
              )}
              <ul role="list" className="rsb-list">
                {section.items.map((item) => (
                  <ItemRenderer
                    key={item.id}
                    item={item}
                    depth={0}
                    isCollapsed={isCollapsed}
                    activeId={activeId}
                    isExpanded={isExpanded}
                    getItemProps={getItemProps}
                    getSectionProps={getSectionProps}
                    registerItemRef={registerItemRef}
                  />
                ))}
              </ul>
            </div>
          ))}
          {children}
        </div>

        {showCollapseButton && (
          <button
            type="button"
            className="rsb-collapse-btn"
            onClick={toggle}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
          >
            <ChevronLeftIcon />
          </button>
        )}

        {footer && <div className="rsb-footer">{footer}</div>}
      </nav>
    );
  },
);
