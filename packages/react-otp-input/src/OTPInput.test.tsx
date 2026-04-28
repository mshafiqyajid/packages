import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, test, vi } from "vitest";
import { OTPInput } from "./OTPInput";

describe("<OTPInput />", () => {
  test("renders the configured number of input slots", () => {
    render(<OTPInput length={4} />);
    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(4);
  });

  test("typing fills slots one by one and advances focus", async () => {
    const user = userEvent.setup();
    render(<OTPInput length={4} />);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[0]!.focus();
    await user.keyboard("1234");
    expect(inputs[0]!.value).toBe("1");
    expect(inputs[1]!.value).toBe("2");
    expect(inputs[2]!.value).toBe("3");
    expect(inputs[3]!.value).toBe("4");
  });

  test("calls onComplete with the final value", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<OTPInput length={4} onComplete={onComplete} />);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[0]!.focus();
    await user.keyboard("9876");
    await waitFor(() => expect(onComplete).toHaveBeenCalledWith("9876"));
  });

  test("backspace clears current slot then moves left", async () => {
    const user = userEvent.setup();
    render(<OTPInput length={4} defaultValue="123" />);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[3]!.focus();
    await user.keyboard("{Backspace}");
    expect(inputs[2]!.value).toBe("");
  });

  test("paste fills multiple slots from one input", async () => {
    const user = userEvent.setup();
    render(<OTPInput length={6} />);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[0]!.focus();
    await user.paste("123456");
    expect(inputs.map((i) => i.value).join("")).toBe("123456");
  });

  test("paste filters non-matching characters", async () => {
    const user = userEvent.setup();
    render(<OTPInput length={6} />);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[0]!.focus();
    await user.paste("12-34-56");
    expect(inputs.map((i) => i.value).join("")).toBe("123456");
  });

  test("ArrowLeft / ArrowRight move focus", async () => {
    const user = userEvent.setup();
    render(<OTPInput length={4} defaultValue="12" />);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[1]!.focus();
    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(inputs[0]);
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(document.activeElement).toBe(inputs[2]);
  });

  test("autoFocus focuses the first empty slot", () => {
    render(<OTPInput length={6} autoFocus />);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    expect(document.activeElement).toBe(inputs[0]);
  });

  test("controlled value reflects updates from parent", async () => {
    const user = userEvent.setup();
    function Wrapper() {
      const [v, setV] = useState("");
      return <OTPInput length={4} value={v} onChange={setV} />;
    }
    render(<Wrapper />);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[0]!.focus();
    await user.keyboard("99");
    await waitFor(() => expect(inputs[0]!.value).toBe("9"));
    expect(inputs[1]!.value).toBe("9");
  });

  test("disabled prop disables every slot", () => {
    render(<OTPInput length={4} disabled />);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs.forEach((i) => expect(i).toBeDisabled());
  });

  test("alphanumeric uppercase pattern", async () => {
    const user = userEvent.setup();
    render(<OTPInput length={4} pattern="alphanumeric" />);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[0]!.focus();
    await user.keyboard("ab12");
    expect(inputs.map((i) => i.value).join("")).toBe("AB12");
  });

  test("render-prop child receives slots and value", () => {
    render(
      <OTPInput length={3} defaultValue="12">
        {({ slots, value }) => (
          <div data-testid="custom">
            <span data-testid="value">{value}</span>
            {slots.map((s) => (
              <input key={s.index} {...s.inputProps} data-testid={`slot-${s.index}`} />
            ))}
          </div>
        )}
      </OTPInput>,
    );
    expect(screen.getByTestId("value")).toHaveTextContent("12");
    expect(screen.getAllByRole("textbox")).toHaveLength(3);
  });
});
