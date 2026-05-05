import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { useSwitch } from "./useSwitch";

function BasicSwitch({
  defaultChecked,
  onChange,
  disabled,
}: {
  defaultChecked?: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}) {
  const { switchProps, isChecked } = useSwitch({ defaultChecked, onChange, disabled });
  return (
    <button {...switchProps} data-testid="switch">
      {isChecked ? "on" : "off"}
    </button>
  );
}

function ControlledSwitch({ onChange }: { onChange?: (v: boolean) => void }) {
  const [checked, setChecked] = useState(false);
  const { switchProps } = useSwitch({
    checked,
    onChange: (v) => {
      setChecked(v);
      onChange?.(v);
    },
  });
  return <button {...switchProps} data-testid="switch" />;
}

describe("useSwitch", () => {
  it("renders with role=switch and aria-checked=false by default", () => {
    render(<BasicSwitch />);
    const el = screen.getByTestId("switch");
    expect(el).toHaveAttribute("role", "switch");
    expect(el).toHaveAttribute("aria-checked", "false");
  });

  it("toggles state when clicked", async () => {
    const user = userEvent.setup();
    render(<BasicSwitch />);
    const el = screen.getByTestId("switch");
    expect(el).toHaveAttribute("aria-checked", "false");
    await user.click(el);
    expect(el).toHaveAttribute("aria-checked", "true");
    await user.click(el);
    expect(el).toHaveAttribute("aria-checked", "false");
  });

  it("calls onChange with the new value on toggle", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<BasicSwitch onChange={onChange} />);
    await user.click(screen.getByTestId("switch"));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("does not toggle when disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<BasicSwitch disabled onChange={onChange} />);
    const el = screen.getByTestId("switch");
    await user.click(el);
    expect(onChange).not.toHaveBeenCalled();
    expect(el).toHaveAttribute("aria-checked", "false");
    expect(el).toHaveAttribute("aria-disabled", "true");
  });

  it("toggles on Space key press", async () => {
    const user = userEvent.setup();
    render(<BasicSwitch />);
    const el = screen.getByTestId("switch");
    el.focus();
    await user.keyboard(" ");
    expect(el).toHaveAttribute("aria-checked", "true");
  });

  it("toggles on Enter key press", async () => {
    const user = userEvent.setup();
    render(<BasicSwitch />);
    const el = screen.getByTestId("switch");
    el.focus();
    await user.keyboard("{Enter}");
    expect(el).toHaveAttribute("aria-checked", "true");
  });

  it("respects defaultChecked=true", () => {
    render(<BasicSwitch defaultChecked />);
    expect(screen.getByTestId("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("works in controlled mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledSwitch onChange={onChange} />);
    const el = screen.getByTestId("switch");
    expect(el).toHaveAttribute("aria-checked", "false");
    await user.click(el);
    expect(el).toHaveAttribute("aria-checked", "true");
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("has tabIndex=0 when enabled and tabIndex=-1 when disabled", () => {
    const { rerender } = render(<BasicSwitch />);
    expect(screen.getByTestId("switch")).toHaveAttribute("tabindex", "0");
    rerender(<BasicSwitch disabled />);
    expect(screen.getByTestId("switch")).toHaveAttribute("tabindex", "-1");
  });
});

describe("useSwitch — async onChange", () => {
  function AsyncSwitch({
    onChange,
    defaultChecked,
  }: {
    onChange: (v: boolean) => Promise<void>;
    defaultChecked?: boolean;
  }) {
    const { switchProps, isChecked, isPending } = useSwitch({
      defaultChecked,
      onChange,
    });
    return (
      <button
        {...switchProps}
        data-testid="switch"
        data-pending={isPending ? "true" : undefined}
      >
        {isChecked ? "on" : "off"}
      </button>
    );
  }

  it("sets aria-busy + isPending while the promise is in flight", async () => {
    const user = userEvent.setup();
    let resolve!: () => void;
    const onChange = vi.fn(
      () =>
        new Promise<void>((r) => {
          resolve = r;
        }),
    );
    render(<AsyncSwitch onChange={onChange} />);
    const el = screen.getByTestId("switch");
    await user.click(el);
    expect(el).toHaveAttribute("aria-checked", "true");
    expect(el).toHaveAttribute("aria-busy", "true");
    expect(el).toHaveAttribute("data-pending", "true");

    await new Promise<void>((done) => {
      resolve();
      setTimeout(done, 0);
    });

    // After resolve: pending cleared
    expect(el).not.toHaveAttribute("aria-busy");
  });

  it("reverts the optimistic value when the promise rejects", async () => {
    const user = userEvent.setup();
    let reject!: (e: Error) => void;
    const onChange = vi.fn(
      () =>
        new Promise<void>((_, r) => {
          reject = r;
        }),
    );
    render(<AsyncSwitch onChange={onChange} />);
    const el = screen.getByTestId("switch");
    await user.click(el);
    expect(el).toHaveAttribute("aria-checked", "true");

    await new Promise<void>((done) => {
      reject(new Error("nope"));
      setTimeout(done, 0);
    });

    expect(el).toHaveAttribute("aria-checked", "false");
  });

  it("ignores clicks while pending", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn(() => new Promise<void>(() => {}));
    render(<AsyncSwitch onChange={onChange} />);
    const el = screen.getByTestId("switch");
    await user.click(el);
    await user.click(el);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
