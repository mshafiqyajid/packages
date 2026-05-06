import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { useCheckbox, type CheckboxState } from "./useCheckbox";

function Cb({
  defaultChecked,
  checked,
  onChange,
  disabled,
}: {
  defaultChecked?: CheckboxState;
  checked?: CheckboxState;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}) {
  const { checkboxProps, isChecked, isIndeterminate } = useCheckbox({
    defaultChecked,
    checked,
    onChange,
    disabled,
  });
  return (
    <button
      {...checkboxProps}
      data-testid="cb"
      data-checked={isChecked ? "true" : undefined}
      data-indeterminate={isIndeterminate ? "true" : undefined}
    >
      box
    </button>
  );
}

describe("useCheckbox", () => {
  it("renders with role=checkbox + aria-checked=false by default", () => {
    render(<Cb />);
    const el = screen.getByTestId("cb");
    expect(el).toHaveAttribute("role", "checkbox");
    expect(el).toHaveAttribute("aria-checked", "false");
  });

  it("toggles when clicked", async () => {
    const user = userEvent.setup();
    render(<Cb />);
    const el = screen.getByTestId("cb");
    await user.click(el);
    expect(el).toHaveAttribute("aria-checked", "true");
    await user.click(el);
    expect(el).toHaveAttribute("aria-checked", "false");
  });

  it("calls onChange with the new value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Cb onChange={onChange} />);
    await user.click(screen.getByTestId("cb"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("supports indeterminate state", () => {
    render(<Cb defaultChecked="indeterminate" />);
    const el = screen.getByTestId("cb");
    expect(el).toHaveAttribute("aria-checked", "mixed");
  });

  it("indeterminate → checked on toggle", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Cb defaultChecked="indeterminate" onChange={onChange} />);
    const el = screen.getByTestId("cb");
    await user.click(el);
    expect(el).toHaveAttribute("aria-checked", "true");
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("does not toggle when disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Cb disabled onChange={onChange} />);
    await user.click(screen.getByTestId("cb"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("toggles on Space", async () => {
    const user = userEvent.setup();
    render(<Cb />);
    const el = screen.getByTestId("cb");
    el.focus();
    await user.keyboard(" ");
    expect(el).toHaveAttribute("aria-checked", "true");
  });

  it("respects controlled mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Cb checked={false} onChange={onChange} />);
    const el = screen.getByTestId("cb");
    await user.click(el);
    expect(el).toHaveAttribute("aria-checked", "false");
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
