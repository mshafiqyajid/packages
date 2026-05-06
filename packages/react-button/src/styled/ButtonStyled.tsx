import {
  forwardRef,
  useCallback,
  useState,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useButton } from "../useButton";

export type ButtonSize = "sm" | "md" | "lg";
export type ButtonTone = "neutral" | "primary" | "success" | "danger";
export type ButtonVariant = "solid" | "outline" | "ghost" | "link";
export type ButtonRadius = "default" | "pill" | "sharp";

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

export interface ButtonStyledProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "onClick" | "type" | "aria-disabled" | "aria-busy" | "disabled"
  > {
  /** Click handler. Return a Promise to drive the loading spinner automatically. */
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  radius?: ButtonRadius;
  /** Render full-width inside the parent flex/grid track. */
  block?: boolean;
  loading?: boolean;
  /** Replaces label while loading (prevents the layout-shift you'd get if you swapped children manually). */
  loadingText?: ReactNode;
  /** Subtle pulsing glow — use sparingly for primary CTAs. */
  pulse?: boolean;
  /** Material-style ripple on click. Default: true. */
  ripple?: boolean;
  disabled?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export const ButtonStyled = forwardRef<HTMLButtonElement, ButtonStyledProps>(
  function ButtonStyled(
    {
      onClick,
      variant = "solid",
      tone = "primary",
      size = "md",
      radius = "default",
      block = false,
      loading = false,
      loadingText,
      pulse = false,
      ripple = true,
      disabled = false,
      iconLeft,
      iconRight,
      children,
      className,
      ...rest
    },
    ref,
  ) {
    const [ripples, setRipples] = useState<Ripple[]>([]);

    const handleRipple = useCallback(
      (e: MouseEvent<HTMLButtonElement>) => {
        if (!ripple || disabled) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const id = Date.now() + Math.random();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setRipples((prev) => [...prev, { id, x, y, size }]);
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 600);
      },
      [ripple, disabled],
    );

    const wrappedOnClick = useCallback(
      (e: MouseEvent<HTMLButtonElement>) => {
        handleRipple(e);
        return onClick?.(e);
      },
      [handleRipple, onClick],
    );

    const { buttonProps, isPending } = useButton({
      onClick: wrappedOnClick,
      disabled,
      loading,
    });

    const rootClass = ["rbtn-root", className].filter(Boolean).join(" ");

    return (
      <button
        {...rest}
        {...buttonProps}
        ref={ref}
        className={rootClass}
        data-variant={variant}
        data-tone={tone}
        data-size={size}
        data-radius={radius}
        data-block={block ? "true" : undefined}
        data-loading={isPending ? "true" : undefined}
        data-pulse={pulse && !isPending && !disabled ? "true" : undefined}
      >
        {isPending && <span className="rbtn-spinner" aria-hidden="true" />}
        {iconLeft && !isPending && <span className="rbtn-icon rbtn-icon--left">{iconLeft}</span>}
        <span className="rbtn-label">{isPending && loadingText !== undefined ? loadingText : children}</span>
        {iconRight && !isPending && <span className="rbtn-icon rbtn-icon--right">{iconRight}</span>}
        {ripples.map((r) => (
          <span
            key={r.id}
            className="rbtn-ripple"
            style={{
              left: r.x - r.size / 2,
              top: r.y - r.size / 2,
              width: r.size,
              height: r.size,
            }}
            aria-hidden="true"
          />
        ))}
      </button>
    );
  },
);
