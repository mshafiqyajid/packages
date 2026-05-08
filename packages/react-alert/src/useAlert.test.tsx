import { renderHook, act } from "@testing-library/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { useAlert } from "./useAlert";

describe("useAlert", () => {
  it("isDismissed starts false", () => {
    const { result } = renderHook(() => useAlert());
    expect(result.current.isDismissed).toBe(false);
  });

  it("dismiss() sets isDismissed to true", () => {
    const { result } = renderHook(() => useAlert());
    act(() => {
      result.current.dismiss();
    });
    expect(result.current.isDismissed).toBe(true);
  });

  it("onDismiss callback is called on dismiss", () => {
    const onDismiss = vi.fn();
    const { result } = renderHook(() => useAlert({ onDismiss }));
    act(() => {
      result.current.dismiss();
    });
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("Escape key dismisses when dismissible=true", async () => {
    const user = userEvent.setup();
    function TestComponent() {
      const { alertProps, isDismissed } = useAlert({ dismissible: true });
      return (
        <div {...alertProps} data-testid="alert" data-dismissed={String(isDismissed)}>
          Alert content
        </div>
      );
    }
    render(<TestComponent />);
    const el = screen.getByTestId("alert");
    el.focus();
    await user.keyboard("{Escape}");
    expect(el).toHaveAttribute("data-dismissed", "true");
  });

  it("Escape key does NOT dismiss when dismissible=false (default)", async () => {
    const user = userEvent.setup();
    function TestComponent() {
      const { alertProps, isDismissed } = useAlert({ dismissible: false });
      return (
        <div {...alertProps} data-testid="alert" data-dismissed={String(isDismissed)}>
          Alert content
        </div>
      );
    }
    render(<TestComponent />);
    const el = screen.getByTestId("alert");
    el.focus();
    await user.keyboard("{Escape}");
    expect(el).toHaveAttribute("data-dismissed", "false");
  });

  it('alertProps.role is "alert" for tone="danger"', () => {
    const { result } = renderHook(() => useAlert({ tone: "danger" }));
    expect(result.current.alertProps.role).toBe("alert");
  });

  it('alertProps.role is "status" for tone="success"', () => {
    const { result } = renderHook(() => useAlert({ tone: "success" }));
    expect(result.current.alertProps.role).toBe("status");
  });

  it('dismissProps has type="button" and aria-label="Dismiss"', () => {
    const { result } = renderHook(() => useAlert());
    expect(result.current.dismissProps.type).toBe("button");
    expect(result.current.dismissProps["aria-label"]).toBe("Dismiss");
  });
});
