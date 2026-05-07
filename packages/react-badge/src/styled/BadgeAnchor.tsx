import { type CSSProperties, type ReactNode } from "react";

export interface BadgeAnchorOffset {
  x?: number;
  y?: number;
}

export interface BadgeAnchorProps {
  /** The badge element to pin in the top-right corner. */
  badge: ReactNode;
  /** Offset in px from the corner. Default: -6px / -6px */
  offset?: BadgeAnchorOffset;
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
}

export function BadgeAnchor({
  badge,
  offset,
  className,
  children,
  style,
}: BadgeAnchorProps) {
  const x = offset?.x ?? -6;
  const y = offset?.y ?? -6;

  return (
    <span
      className={["rbadge-anchor", className].filter(Boolean).join(" ")}
      style={{ position: "relative", display: "inline-flex", ...style }}
    >
      {children}
      <span
        className="rbadge-anchor__badge"
        style={{
          position: "absolute",
          top: y,
          right: x,
          transform: "translate(50%, -50%)",
          lineHeight: 0,
        }}
      >
        {badge}
      </span>
    </span>
  );
}
