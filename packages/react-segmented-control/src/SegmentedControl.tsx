import {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
} from "react";
import {
  type SegmentedControlOptionState,
  type UseSegmentedControlOptions,
  useSegmentedControl,
} from "./useSegmentedControl";

export interface SegmentedControlRenderProps<TValue> {
  options: SegmentedControlOptionState<TValue>[];
  value: TValue;
  setValue: (value: TValue) => void;
  indicatorStyle: React.CSSProperties;
}

type RootElementProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue" | "onChange" | "role"
>;

type ButtonExtraProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | "children"
  | "ref"
  | "type"
  | "role"
  | "onClick"
  | "onKeyDown"
  | "disabled"
  | "tabIndex"
  | "aria-checked"
  | "aria-disabled"
>;

export interface SegmentedControlProps<TValue>
  extends UseSegmentedControlOptions<TValue>,
    RootElementProps {
  /** Override the rendered button for a single option. */
  renderOption?: (state: SegmentedControlOptionState<TValue>) => ReactNode;
  /** Whether to render the sliding indicator (.rsc-indicator). Default: true. */
  showIndicator?: boolean;
  /** Extra props applied to every button (merged after the wired-up defaults). */
  optionProps?: ButtonExtraProps;
  /** Full render-prop escape hatch — replaces the default rendering entirely. */
  children?: (props: SegmentedControlRenderProps<TValue>) => ReactNode;
}

function SegmentedControlInner<TValue>(
  {
    options,
    value,
    defaultValue,
    onChange,
    disabled,
    equals,
    renderOption,
    showIndicator = true,
    optionProps,
    children,
    style,
    ...rootRest
  }: SegmentedControlProps<TValue>,
  ref: React.Ref<HTMLDivElement>,
) {
  const sc = useSegmentedControl<TValue>({
    options,
    value,
    defaultValue,
    onChange,
    disabled,
    equals,
  });

  const mergedStyle: React.CSSProperties = {
    ...sc.indicatorStyle,
    ...style,
  };

  if (children) {
    return (
      <div ref={ref} {...sc.rootProps} {...rootRest} style={mergedStyle}>
        {children({
          options: sc.options,
          value: sc.value,
          setValue: sc.setValue,
          indicatorStyle: sc.indicatorStyle,
        })}
      </div>
    );
  }

  return (
    <div ref={ref} {...sc.rootProps} {...rootRest} style={mergedStyle}>
      {showIndicator ? <span className="rsc-indicator" aria-hidden="true" /> : null}
      {sc.options.map((opt) => {
        if (renderOption) return <span key={opt.index}>{renderOption(opt)}</span>;
        const labelContent = (
          <>
            <span className="rsc-option-label">{opt.label}</span>
            {opt.badge !== undefined && (
              <span className="rsc-option-badge" aria-hidden="true">{opt.badge}</span>
            )}
          </>
        );
        // Link mode — render as <a>. Click still selects via the wired button onClick
        // semantics (we drop the aria-checked since <a> isn't role=radio).
        if (opt.href !== undefined) {
          return (
            <a
              key={opt.index}
              href={opt.href}
              data-active={opt.isSelected || undefined}
              data-disabled={opt.isDisabled || undefined}
              tabIndex={opt.buttonProps.tabIndex}
              onClick={(e) => {
                if (opt.isDisabled) { e.preventDefault(); return; }
                opt.buttonProps.onClick?.(e as unknown as React.MouseEvent<HTMLButtonElement>);
              }}
              onKeyDown={(e) => opt.buttonProps.onKeyDown?.(e as unknown as React.KeyboardEvent<HTMLButtonElement>)}
              className="rsc-option rsc-option--link"
            >
              {labelContent}
            </a>
          );
        }
        return (
          <button
            key={opt.index}
            {...opt.buttonProps}
            {...optionProps}
            // re-apply wired props AFTER user props so they can't clobber wiring
            ref={opt.buttonProps.ref}
            type="button"
            role="radio"
            aria-checked={opt.buttonProps["aria-checked"]}
            aria-disabled={opt.buttonProps["aria-disabled"]}
            disabled={opt.buttonProps.disabled}
            tabIndex={opt.buttonProps.tabIndex}
            onClick={opt.buttonProps.onClick}
            onKeyDown={opt.buttonProps.onKeyDown}
          >
            {labelContent}
          </button>
        );
      })}
    </div>
  );
}

// forwardRef + generics requires a small cast; consumers see the generic API.
export const SegmentedControl = forwardRef(SegmentedControlInner) as <TValue>(
  props: SegmentedControlProps<TValue> & { ref?: React.Ref<HTMLDivElement> },
) => ReturnType<typeof SegmentedControlInner>;
