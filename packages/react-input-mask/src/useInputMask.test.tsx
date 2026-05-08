import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { useInputMask } from "./useInputMask";

// ── Test harness component ───────────────────────────────────────────────────

interface FieldProps {
  mask: string;
  maskChar?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, rawValue: string) => void;
  onAccept?: (value: string, rawValue: string) => void;
  onComplete?: (value: string, rawValue: string) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  allowedChars?: RegExp;
  formatChars?: Record<string, RegExp>;
  lazy?: boolean;
  showMask?: boolean;
  autoUnmask?: boolean;
  disabled?: boolean;
  invalid?: boolean;
}

function Field({
  mask,
  maskChar,
  value,
  defaultValue,
  onChange,
  onAccept,
  onComplete,
  onFocus,
  onBlur,
  allowedChars,
  formatChars,
  lazy,
  showMask,
  autoUnmask,
  disabled,
  invalid,
}: FieldProps) {
  const { inputProps, rawValue, isComplete } = useInputMask({
    mask,
    maskChar,
    value,
    defaultValue,
    onChange,
    onAccept,
    onComplete,
    onFocus,
    onBlur,
    allowedChars,
    formatChars,
    lazy,
    showMask,
    autoUnmask,
    disabled,
  });

  const { ref, ...rest } = inputProps as typeof inputProps & {
    ref?: (el: HTMLInputElement | null) => void;
  };

  return (
    <>
      <input
        {...rest}
        ref={ref}
        data-testid="input"
        aria-invalid={invalid || undefined}
        disabled={disabled}
      />
      <span data-testid="raw">{rawValue}</span>
      <span data-testid="complete">{isComplete ? "yes" : "no"}</span>
    </>
  );
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("useInputMask", () => {
  // ── Eager mode (lazy=false) — full mask always visible ──────────────────────

  it("shows full mask in eager mode (lazy=false)", () => {
    render(<Field mask="__/__/____" lazy={false} />);
    expect(screen.getByTestId("input")).toHaveValue("__/__/____");
  });

  it("uses a custom maskChar in eager mode", () => {
    render(<Field mask="__/__/____" maskChar="-" lazy={false} />);
    expect(screen.getByTestId("input")).toHaveValue("--/--/----");
  });

  it("respects defaultValue", () => {
    render(<Field mask="__/__/____" defaultValue="12/03/2024" />);
    expect(screen.getByTestId("raw")).toHaveTextContent("12032024");
  });

  it("typing a digit fills the next digit slot (eager)", async () => {
    const user = userEvent.setup();
    render(<Field mask="__/__/____" lazy={false} />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("1");
    expect(screen.getByTestId("raw")).toHaveTextContent("1");
    expect(screen.getByTestId("input")).toHaveValue("1_/__/____");
  });

  it("skips over fixed chars automatically (eager)", async () => {
    const user = userEvent.setup();
    render(<Field mask="__/__/____" lazy={false} />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("12");
    expect(screen.getByTestId("raw")).toHaveTextContent("12");
    expect(screen.getByTestId("input")).toHaveValue("12/__/____");
  });

  it("backspace clears the last filled slot (eager)", async () => {
    const user = userEvent.setup();
    render(<Field mask="__/__/____" lazy={false} />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("12");
    expect(screen.getByTestId("raw")).toHaveTextContent("12");
    await user.keyboard("{Backspace}");
    expect(screen.getByTestId("raw")).toHaveTextContent("1");
    expect(screen.getByTestId("input")).toHaveValue("1_/__/____");
  });

  it("backspace on empty input does nothing (eager)", async () => {
    const user = userEvent.setup();
    render(<Field mask="__/__" lazy={false} />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("{Backspace}");
    expect(screen.getByTestId("raw")).toHaveTextContent("");
    expect(screen.getByTestId("input")).toHaveValue("__/__");
  });

  it("isComplete is false when slots are partially filled", async () => {
    const user = userEvent.setup();
    render(<Field mask="__/__" />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("1");
    expect(screen.getByTestId("complete")).toHaveTextContent("no");
  });

  it("isComplete is true only when all slots are filled", async () => {
    const user = userEvent.setup();
    render(<Field mask="__/__" />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("1234");
    expect(screen.getByTestId("complete")).toHaveTextContent("yes");
  });

  it("rawValue contains only user-entered chars, no mask chars", async () => {
    const user = userEvent.setup();
    render(<Field mask="(___) ___-____" />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("1234567890");
    expect(screen.getByTestId("raw")).toHaveTextContent("1234567890");
  });

  it("onChange is called with formatted value and rawValue", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Field mask="__/__" lazy={false} onChange={onChange} />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("1");
    expect(onChange).toHaveBeenCalledWith("1_/__", "1");
  });

  it("onAccept is called when a character is accepted", async () => {
    const user = userEvent.setup();
    const onAccept = vi.fn();
    render(<Field mask="__/__" lazy={false} onAccept={onAccept} />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("1");
    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(onAccept).toHaveBeenCalledWith("1_/__", "1");
  });

  it("onComplete is called when the last slot is filled", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Field mask="__/__" lazy={false} onComplete={onComplete} />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("1234");
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith("12/34", "1234");
  });

  it("paste fills slots greedily with valid chars", async () => {
    render(<Field mask="__/__/____" lazy={false} />);
    const input = screen.getByTestId("input");
    fireEvent.paste(input, {
      clipboardData: { getData: () => "12032024" },
    });
    expect(screen.getByTestId("raw")).toHaveTextContent("12032024");
    expect(screen.getByTestId("input")).toHaveValue("12/03/2024");
  });

  it("paste skips chars that don't match slot type", async () => {
    render(<Field mask="__/__" />);
    const input = screen.getByTestId("input");
    fireEvent.paste(input, {
      clipboardData: { getData: () => "1a2b" },
    });
    // Only digits accepted for _ slots
    expect(screen.getByTestId("raw")).toHaveTextContent("12");
  });

  it("disabled prevents input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Field mask="__/__" disabled onChange={onChange} />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("1");
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByTestId("raw")).toHaveTextContent("");
  });

  it("invalid sets aria-invalid", () => {
    render(<Field mask="__/__" invalid />);
    expect(screen.getByTestId("input")).toHaveAttribute("aria-invalid", "true");
  });

  it("alpha slot accepts only letters", async () => {
    const user = userEvent.setup();
    render(<Field mask="aa-__" />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("A");
    expect(screen.getByTestId("raw")).toHaveTextContent("A");
    await user.keyboard("1");
    expect(screen.getByTestId("raw")).toHaveTextContent("A");
    await user.keyboard("B");
    expect(screen.getByTestId("raw")).toHaveTextContent("AB");
  });

  it("any (*) slot accepts letters and digits", async () => {
    const user = userEvent.setup();
    render(<Field mask="**-**" />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("A1");
    expect(screen.getByTestId("raw")).toHaveTextContent("A1");
  });

  it("works in controlled mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Field mask="__/__" value="12/__" onChange={onChange} />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("3");
    expect(onChange).toHaveBeenCalled();
  });

  // ── Lazy mode (default) ─────────────────────────────────────────────────────

  it("lazy mode: shows only first slot when empty", () => {
    render(<Field mask="__/__/____" lazy={true} />);
    expect(screen.getByTestId("input")).toHaveValue("_");
  });

  it("lazy mode: expands mask as user types", async () => {
    const user = userEvent.setup();
    render(<Field mask="__/__/____" lazy={true} />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("1");
    // After '1': slot 0 filled, show next slot (slotIdx=1), no fixed yet
    expect(screen.getByTestId("input")).toHaveValue("1_");
  });

  it("lazy mode: includes fixed chars when slots around them are reached", async () => {
    const user = userEvent.setup();
    render(<Field mask="__/__/____" lazy={true} />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("12");
    // Slots 0 and 1 filled; next is slot 2 which is after '/', so show '/'
    expect(screen.getByTestId("input")).toHaveValue("12/_");
  });

  it("lazy=false (default) shows full mask immediately", () => {
    render(<Field mask="____ ____ ____ ____" />);
    expect(screen.getByTestId("input")).toHaveValue("____ ____ ____ ____");
  });

  // ── showMask ────────────────────────────────────────────────────────────────

  it("showMask=false hides maskChar — empty input shows empty string", () => {
    render(<Field mask="__/__/____" showMask={false} />);
    // fixed chars are also hidden until adjacent to filled content
    expect(screen.getByTestId("input")).toHaveValue("");
  });

  it("showMask=false still shows typed characters", async () => {
    const user = userEvent.setup();
    render(<Field mask="__/__/____" showMask={false} />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("12");
    expect(screen.getByTestId("input")).toHaveValue("12/");
  });

  // ── autoUnmask ──────────────────────────────────────────────────────────────

  it("autoUnmask=false: onChange receives formatted value (default)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Field mask="__/__" lazy={false} onChange={onChange} />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("1");
    expect(onChange).toHaveBeenCalledWith("1_/__", "1");
  });

  it("autoUnmask=true: onChange receives raw value as first arg", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Field mask="__/__" autoUnmask onChange={onChange} />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("1");
    // First arg is rawValue, second is also rawValue when autoUnmask=true
    expect(onChange).toHaveBeenCalledWith("1", "1");
  });

  it("autoUnmask=true: onComplete receives raw value", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Field mask="__/__" autoUnmask onComplete={onComplete} />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("1234");
    expect(onComplete).toHaveBeenCalledWith("1234", "1234");
  });

  // ── formatChars ─────────────────────────────────────────────────────────────

  it("formatChars: custom hex slot 'H' accepts hex chars", async () => {
    const user = userEvent.setup();
    render(<Field mask="HH:HH" formatChars={{ H: /[0-9A-Fa-f]/ }} />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("A");
    expect(screen.getByTestId("raw")).toHaveTextContent("A");
    // 'G' is not a valid hex char
    await user.keyboard("G");
    expect(screen.getByTestId("raw")).toHaveTextContent("A");
    await user.keyboard("f");
    expect(screen.getByTestId("raw")).toHaveTextContent("Af");
  });

  it("formatChars: user overrides default '_' char", async () => {
    const user = userEvent.setup();
    // Override _ to accept only uppercase letters
    render(<Field mask="__" formatChars={{ _: /[A-Z]/ }} />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("1");
    // digit should be rejected since _ now maps to [A-Z]
    expect(screen.getByTestId("raw")).toHaveTextContent("");
    await user.keyboard("A");
    expect(screen.getByTestId("raw")).toHaveTextContent("A");
  });

  it("formatChars: defaults still work when only partial override provided", async () => {
    const user = userEvent.setup();
    render(<Field mask="H_" formatChars={{ H: /[A-Fa-f0-9]/ }} />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("A");
    expect(screen.getByTestId("raw")).toHaveTextContent("A");
    await user.keyboard("5");
    expect(screen.getByTestId("raw")).toHaveTextContent("A5");
  });

  // ── onFocus / onBlur ────────────────────────────────────────────────────────

  it("onFocus is called when input is focused", async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    render(<Field mask="__/__" onFocus={onFocus} />);
    const input = screen.getByTestId("input");
    await user.click(input);
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it("onBlur is called when input loses focus", async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    render(<Field mask="__/__" onBlur={onBlur} />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
