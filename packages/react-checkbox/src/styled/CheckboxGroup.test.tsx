import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { CheckboxGroup } from "./CheckboxGroup";
import { CheckboxStyled } from "./CheckboxStyled";

function Group({
  value,
  defaultValue,
  onChange,
  disabled,
  invalid,
  error,
}: {
  value?: string[];
  defaultValue?: string[];
  onChange?: (v: string[]) => void;
  disabled?: boolean;
  invalid?: boolean;
  error?: string;
}) {
  return (
    <CheckboxGroup
      label="Options"
      hint="Pick at least one"
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      disabled={disabled}
      invalid={invalid}
      error={error}
    >
      <CheckboxStyled value="a" label="Option A" />
      <CheckboxStyled value="b" label="Option B" />
      <CheckboxStyled value="c" label="Option C" />
    </CheckboxGroup>
  );
}

describe("CheckboxGroup", () => {
  it("renders a fieldset with legend and hint", () => {
    render(<Group />);
    expect(screen.getByRole("group")).toBeInTheDocument();
    expect(screen.getByText("Options")).toBeInTheDocument();
    expect(screen.getByText("Pick at least one")).toBeInTheDocument();
  });

  it("renders child checkboxes", () => {
    render(<Group />);
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
    expect(screen.getByText("Option C")).toBeInTheDocument();
  });

  it("uncontrolled: toggles a value when clicked", async () => {
    const user = userEvent.setup();
    render(<Group />);
    const boxes = screen.getAllByRole("checkbox");
    expect(boxes[0]).toHaveAttribute("aria-checked", "false");
    await user.click(boxes[0]!);
    expect(boxes[0]).toHaveAttribute("aria-checked", "true");
  });

  it("controlled: calls onChange with updated values", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Group value={[]} onChange={onChange} />);
    const boxes = screen.getAllByRole("checkbox");
    await user.click(boxes[1]!);
    expect(onChange).toHaveBeenCalledWith(["b"]);
  });

  it("controlled: reflects value prop", () => {
    render(<Group value={["a", "c"]} />);
    const boxes = screen.getAllByRole("checkbox");
    expect(boxes[0]).toHaveAttribute("aria-checked", "true");
    expect(boxes[1]).toHaveAttribute("aria-checked", "false");
    expect(boxes[2]).toHaveAttribute("aria-checked", "true");
  });

  it("disabled: disables all child checkboxes", () => {
    render(<Group disabled />);
    const boxes = screen.getAllByRole("checkbox");
    for (const box of boxes) {
      expect(box).toHaveAttribute("aria-disabled");
    }
  });

  it("error: renders error message", () => {
    render(<Group error="Please select at least one option" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Please select at least one option");
  });

  it("invalid: propagates invalid to child checkboxes", () => {
    render(<Group invalid />);
    const boxes = screen.getAllByRole("checkbox");
    for (const box of boxes) {
      expect(box).toHaveAttribute("aria-invalid", "true");
    }
  });

  it("uncontrolled: deselects a value when clicked again", async () => {
    const user = userEvent.setup();
    render(<Group defaultValue={["a"]} />);
    const boxes = screen.getAllByRole("checkbox");
    expect(boxes[0]).toHaveAttribute("aria-checked", "true");
    await user.click(boxes[0]!);
    expect(boxes[0]).toHaveAttribute("aria-checked", "false");
  });
});
