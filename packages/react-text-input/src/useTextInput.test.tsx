import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { useTextInput } from "./useTextInput";

function Field({
  defaultValue,
  value,
  onChange,
  disabled,
}: {
  defaultValue?: string;
  value?: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
}) {
  const { inputProps } = useTextInput({ defaultValue, value, onChange, disabled });
  return <input {...inputProps} data-testid="input" />;
}

describe("useTextInput", () => {
  it("starts empty by default", () => {
    render(<Field />);
    expect(screen.getByTestId("input")).toHaveValue("");
  });

  it("respects defaultValue", () => {
    render(<Field defaultValue="hello" />);
    expect(screen.getByTestId("input")).toHaveValue("hello");
  });

  it("calls onChange with the new value as the user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Field onChange={onChange} />);
    await user.type(screen.getByTestId("input"), "abc");
    expect(onChange).toHaveBeenLastCalledWith("abc");
  });

  it("respects disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Field disabled onChange={onChange} />);
    const el = screen.getByTestId("input");
    expect(el).toBeDisabled();
    expect(el).toHaveAttribute("aria-disabled", "true");
    await user.type(el, "x");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("works in controlled mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Field value="abc" onChange={onChange} />);
    const el = screen.getByTestId("input");
    expect(el).toHaveValue("abc");
    await user.clear(el);
    await user.type(el, "z");
    expect(onChange).toHaveBeenCalled();
  });
});
