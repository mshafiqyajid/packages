import {
  forwardRef,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useButton } from "../useButton";

export type ButtonSize = "sm" | "md" | "lg";
export type ButtonTone = "neutral" | "primary" | "success" | "danger";
export type ButtonVariant = "solid" | "outline" | "ghost" | "link";

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
  /** Render full-width inside the parent flex/grid track. */
  block?: boolean;
  loading?: boolean;
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
      block = false,
      loading = false,
      disabled = false,
      iconLeft,
      iconRight,
      children,
      className,
      ...rest
    },
    ref,
  ) {
    const { buttonProps, isPending } = useButton({ onClick, disabled, loading });

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
        data-block={block ? "true" : undefined}
        data-loading={isPending ? "true" : undefined}
      >
        {isPending && <span className="rbtn-spinner" aria-hidden="true" />}
        {iconLeft && !isPending && <span className="rbtn-icon rbtn-icon--left">{iconLeft}</span>}
        <span className="rbtn-label">{children}</span>
        {iconRight && <span className="rbtn-icon rbtn-icon--right">{iconRight}</span>}
      </button>
    );
  },
);
