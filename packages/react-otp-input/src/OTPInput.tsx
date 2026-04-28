import {
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  forwardRef,
} from "react";
import { type OTPSlot, type UseOTPOptions, useOTP } from "./useOTP";

export interface OTPInputRenderProps {
  slots: OTPSlot[];
  value: string;
  isComplete: boolean;
  clear: () => void;
}

type ContainerProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue" | "onChange"
>;

export interface OTPInputProps extends UseOTPOptions, ContainerProps {
  /** Override per-slot input rendering. */
  renderSlot?: (slot: OTPSlot) => ReactNode;
  /**
   * Full custom render — overrides everything. Container wrapper is still
   * applied unless `asChild` is true (future).
   */
  children?: (props: OTPInputRenderProps) => ReactNode;
  /** Extra props applied to every slot input (merged after slot's defaults). */
  inputProps?: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "ref" | "type"
  >;
}

export const OTPInput = forwardRef<HTMLDivElement, OTPInputProps>(
  function OTPInput(
    {
      length,
      value,
      defaultValue,
      onChange,
      onComplete,
      pattern,
      uppercase,
      autoFocus,
      disabled,
      readOnly,
      renderSlot,
      children,
      inputProps,
      ...containerProps
    },
    ref,
  ) {
    const otp = useOTP({
      length,
      value,
      defaultValue,
      onChange,
      onComplete,
      pattern,
      uppercase,
      autoFocus,
      disabled,
      readOnly,
    });

    if (children) {
      return (
        <div ref={ref} {...containerProps}>
          {children({
            slots: otp.slots,
            value: otp.value,
            isComplete: otp.isComplete,
            clear: otp.clear,
          })}
        </div>
      );
    }

    return (
      <div ref={ref} role="group" {...containerProps}>
        {otp.slots.map((slot) =>
          renderSlot ? (
            <SlotWrapper key={slot.index}>{renderSlot(slot)}</SlotWrapper>
          ) : (
            <input
              key={slot.index}
              {...slot.inputProps}
              {...inputProps}
              // Re-apply slot's handlers/value AFTER inputProps so user props
              // can't accidentally clobber the wiring.
              value={slot.inputProps.value}
              onChange={slot.inputProps.onChange}
              onKeyDown={slot.inputProps.onKeyDown}
              onPaste={slot.inputProps.onPaste}
              onFocus={slot.inputProps.onFocus}
              onBlur={slot.inputProps.onBlur}
              ref={slot.inputProps.ref as Ref<HTMLInputElement>}
            />
          ),
        )}
      </div>
    );
  },
);

function SlotWrapper({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
