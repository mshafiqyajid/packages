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
  allowedChars?: RegExp;
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
  allowedChars,
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
    allowedChars,
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
  it("shows mask with maskChar in empty slots by default", () => {
    render(<Field mask="__/__/____" />);
    expect(screen.getByTestId("input")).toHaveValue("__/__/____");
  });

  it("uses a custom maskChar", () => {
    render(<Field mask="__/__/____" maskChar="-" />);
    expect(screen.getByTestId("input")).toHaveValue("--/--/----");
  });

  it("respects defaultValue", () => {
    render(<Field mask="__/__/____" defaultValue="12/03/2024" />);
    expect(screen.getByTestId("raw")).toHaveTextContent("12032024");
  });

  it("typing a digit fills the next digit slot", async () => {
    const user = userEvent.setup();
    render(<Field mask="__/__/____" />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("1");
    expect(screen.getByTestId("raw")).toHaveTextContent("1");
    expect(screen.getByTestId("input")).toHaveValue("1_/__/____");
  });

  it("skips over fixed chars automatically", async () => {
    const user = userEvent.setup();
    render(<Field mask="__/__/____" />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("12");
    // After typing '1' and '2', rawValue should be '12' and display '12/__/____'
    expect(screen.getByTestId("raw")).toHaveTextContent("12");
    expect(screen.getByTestId("input")).toHaveValue("12/__/____");
  });

  it("backspace clears the last filled slot", async () => {
    const user = userEvent.setup();
    render(<Field mask="__/__/____" />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("12");
    expect(screen.getByTestId("raw")).toHaveTextContent("12");
    await user.keyboard("{Backspace}");
    expect(screen.getByTestId("raw")).toHaveTextContent("1");
    expect(screen.getByTestId("input")).toHaveValue("1_/__/____");
  });

  it("backspace on empty input does nothing", async () => {
    const user = userEvent.setup();
    render(<Field mask="__/__" />);
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
    render(<Field mask="__/__" onChange={onChange} />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("1");
    expect(onChange).toHaveBeenCalledWith("1_/__", "1");
  });

  it("onAccept is called when a character is accepted", async () => {
    const user = userEvent.setup();
    const onAccept = vi.fn();
    render(<Field mask="__/__" onAccept={onAccept} />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("1");
    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(onAccept).toHaveBeenCalledWith("1_/__", "1");
  });

  it("onComplete is called when the last slot is filled", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Field mask="__/__" onComplete={onComplete} />);
    const input = screen.getByTestId("input");
    await user.click(input);
    await user.keyboard("1234");
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith("12/34", "1234");
  });

  it("paste fills slots greedily with valid chars", async () => {
    render(<Field mask="__/__/____" />);
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
    // First two slots are alpha ('a'), last two are digit ('_')
    await user.keyboard("A");
    expect(screen.getByTestId("raw")).toHaveTextContent("A");
    // Digit should not be accepted in alpha slot
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
});
