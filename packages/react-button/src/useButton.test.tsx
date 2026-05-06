import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { useButton } from "./useButton";

function Btn({
  onClick,
  disabled,
  loading,
}: {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
}) {
  const { buttonProps, isPending } = useButton({ onClick, disabled, loading });
  return (
    <button {...buttonProps} data-testid="btn" data-pending={isPending ? "true" : undefined}>
      click
    </button>
  );
}

describe("useButton", () => {
  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Btn onClick={onClick} />);
    await user.click(screen.getByTestId("btn"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Btn onClick={onClick} disabled />);
    await user.click(screen.getByTestId("btn"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("sets aria-disabled when disabled", () => {
    render(<Btn disabled />);
    expect(screen.getByTestId("btn")).toHaveAttribute("aria-disabled", "true");
  });

  it("sets aria-busy + isPending while async onClick is in flight", async () => {
    const user = userEvent.setup();
    let resolve!: () => void;
    const onClick = vi.fn(
      () =>
        new Promise<void>((r) => {
          resolve = r;
        }),
    );
    render(<Btn onClick={onClick} />);
    const btn = screen.getByTestId("btn");
    await user.click(btn);
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(btn).toHaveAttribute("data-pending", "true");

    await new Promise<void>((done) => {
      resolve();
      setTimeout(done, 0);
    });

    expect(btn).not.toHaveAttribute("aria-busy");
  });

  it("ignores clicks while pending", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn(() => new Promise<void>(() => {}));
    render(<Btn onClick={onClick} />);
    await user.click(screen.getByTestId("btn"));
    await user.click(screen.getByTestId("btn"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("treats loading=true like disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Btn onClick={onClick} loading />);
    const btn = screen.getByTestId("btn");
    expect(btn).toHaveAttribute("aria-busy", "true");
    await user.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });
});
