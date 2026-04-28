import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, test, vi } from "vitest";
import { SegmentedControl } from "./SegmentedControl";

describe("<SegmentedControl />", () => {
  test("renders one button per option with correct labels", () => {
    render(<SegmentedControl options={["Day", "Week", "Month"]} />);
    expect(screen.getByRole("radio", { name: "Day" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Week" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Month" })).toBeInTheDocument();
  });

  test("first option is selected by default", () => {
    render(<SegmentedControl options={["Day", "Week"]} />);
    expect(screen.getByRole("radio", { name: "Day" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "Week" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  test("clicking an option selects it and fires onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SegmentedControl options={["Day", "Week", "Month"]} onChange={onChange} />,
    );
    await user.click(screen.getByRole("radio", { name: "Week" }));
    expect(onChange).toHaveBeenCalledWith("Week");
    expect(screen.getByRole("radio", { name: "Week" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  test("ArrowRight moves to the next option", async () => {
    const user = userEvent.setup();
    render(<SegmentedControl options={["a", "b", "c"]} />);
    const a = screen.getByRole("radio", { name: "a" });
    a.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "b" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "b" }));
  });

  test("ArrowLeft wraps to the last option from the first", async () => {
    const user = userEvent.setup();
    render(<SegmentedControl options={["a", "b", "c"]} />);
    screen.getByRole("radio", { name: "a" }).focus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("radio", { name: "c" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  test("Home / End jump to first / last", async () => {
    const user = userEvent.setup();
    render(<SegmentedControl options={["a", "b", "c"]} defaultValue="b" />);
    screen.getByRole("radio", { name: "b" }).focus();
    await user.keyboard("{End}");
    expect(screen.getByRole("radio", { name: "c" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await user.keyboard("{Home}");
    expect(screen.getByRole("radio", { name: "a" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  test("disabled option is skipped by arrow nav and ignores clicks", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SegmentedControl
        options={["a", { value: "b", disabled: true }, "c"]}
        onChange={onChange}
      />,
    );
    const a = screen.getByRole("radio", { name: "a" });
    a.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "c" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(onChange).toHaveBeenCalledWith("c");
    onChange.mockClear();
    await user.click(screen.getByRole("radio", { name: "b" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  test("controlled value reflects updates from parent", async () => {
    const user = userEvent.setup();
    function Wrapper() {
      const [v, setV] = useState<"a" | "b">("a");
      return (
        <SegmentedControl<"a" | "b">
          options={["a", "b"]}
          value={v}
          onChange={setV}
        />
      );
    }
    render(<Wrapper />);
    await user.click(screen.getByRole("radio", { name: "b" }));
    expect(screen.getByRole("radio", { name: "b" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  test("renders the indicator span by default", () => {
    const { container } = render(<SegmentedControl options={["a", "b"]} />);
    expect(container.querySelector(".rsc-indicator")).not.toBeNull();
  });

  test("showIndicator=false hides the indicator", () => {
    const { container } = render(
      <SegmentedControl options={["a", "b"]} showIndicator={false} />,
    );
    expect(container.querySelector(".rsc-indicator")).toBeNull();
  });

  test("render-prop child overrides default rendering", () => {
    render(
      <SegmentedControl options={["a", "b"]}>
        {({ options }) => (
          <div data-testid="custom">
            {options.map((o) => (
              <button key={o.index} {...o.buttonProps}>
                custom-{String(o.value)}
              </button>
            ))}
          </div>
        )}
      </SegmentedControl>,
    );
    expect(screen.getByTestId("custom")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "custom-a" })).toBeInTheDocument();
  });
});
