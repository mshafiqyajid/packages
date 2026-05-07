import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { ModalStyled } from "./ModalStyled";

describe("ModalStyled — confirmVariant", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test("renders confirm and cancel buttons when confirmVariant=confirm", async () => {
    render(
      <ModalStyled
        open
        onClose={vi.fn()}
        title="Are you sure?"
        confirmVariant="confirm"
        confirmLabel="Delete"
        cancelLabel="Go back"
      >
        This action is irreversible.
      </ModalStyled>,
    );
    await act(async () => {
      vi.runAllTimers();
    });
    expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Go back" })).toBeTruthy();
  });

  test("onConfirm fires when confirm button is clicked", async () => {
    const onConfirm = vi.fn();
    render(
      <ModalStyled
        open
        onClose={vi.fn()}
        title="Confirm?"
        confirmVariant="confirm"
        onConfirm={onConfirm}
      >
        body
      </ModalStyled>,
    );
    await act(async () => {
      vi.runAllTimers();
    });
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test("onCancel fires and onClose fires when cancel button is clicked", async () => {
    const onClose = vi.fn();
    const onCancel = vi.fn();
    render(
      <ModalStyled
        open
        onClose={onClose}
        title="Confirm?"
        confirmVariant="confirm"
        onCancel={onCancel}
      >
        body
      </ModalStyled>,
    );
    await act(async () => {
      vi.runAllTimers();
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await act(async () => {
      await Promise.resolve();
      vi.runAllTimers();
    });
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalled();
  });

  test("confirm button gets rmod-btn--danger class when confirmTone=danger", async () => {
    render(
      <ModalStyled
        open
        onClose={vi.fn()}
        title="Delete?"
        confirmVariant="confirm"
        confirmLabel="Delete"
        confirmTone="danger"
      >
        body
      </ModalStyled>,
    );
    await act(async () => {
      vi.runAllTimers();
    });
    const btn = screen.getByRole("button", { name: "Delete" });
    expect(btn.classList.contains("rmod-btn--danger")).toBe(true);
  });

  test("confirm button does NOT have rmod-btn--danger class when confirmTone=neutral", async () => {
    render(
      <ModalStyled
        open
        onClose={vi.fn()}
        title="Confirm?"
        confirmVariant="confirm"
        confirmLabel="OK"
        confirmTone="neutral"
      >
        body
      </ModalStyled>,
    );
    await act(async () => {
      vi.runAllTimers();
    });
    const btn = screen.getByRole("button", { name: "OK" });
    expect(btn.classList.contains("rmod-btn--danger")).toBe(false);
  });

  test("custom footer is NOT rendered when confirmVariant=confirm", async () => {
    render(
      <ModalStyled
        open
        onClose={vi.fn()}
        title="Confirm?"
        confirmVariant="confirm"
        footer={<button>Custom footer button</button>}
      >
        body
      </ModalStyled>,
    );
    await act(async () => {
      vi.runAllTimers();
    });
    expect(screen.queryByRole("button", { name: "Custom footer button" })).toBeFalsy();
  });
});

describe("ModalStyled — preventClose async guard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test("close is blocked when preventClose returns true", async () => {
    const onClose = vi.fn();
    render(
      <ModalStyled
        open
        onClose={onClose}
        title="Guarded"
        preventClose={() => true}
      >
        body
      </ModalStyled>,
    );
    await act(async () => { vi.runAllTimers(); });
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await act(async () => {
      await Promise.resolve();
      vi.runAllTimers();
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  test("close proceeds when preventClose returns false", async () => {
    const onClose = vi.fn();
    render(
      <ModalStyled
        open
        onClose={onClose}
        title="Guarded"
        preventClose={() => false}
      >
        body
      </ModalStyled>,
    );
    await act(async () => { vi.runAllTimers(); });
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await act(async () => {
      await Promise.resolve();
      vi.runAllTimers();
    });
    expect(onClose).toHaveBeenCalled();
  });

  test("close proceeds when preventClose returns a Promise resolving false", async () => {
    const onClose = vi.fn();
    render(
      <ModalStyled
        open
        onClose={onClose}
        title="Async Guarded"
        preventClose={() => Promise.resolve(false)}
      >
        body
      </ModalStyled>,
    );
    await act(async () => { vi.runAllTimers(); });
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await act(async () => {
      await Promise.resolve();
      vi.runAllTimers();
    });
    expect(onClose).toHaveBeenCalled();
  });

  test("close is blocked when preventClose returns a Promise resolving true", async () => {
    const onClose = vi.fn();
    render(
      <ModalStyled
        open
        onClose={onClose}
        title="Async Guarded Block"
        preventClose={() => Promise.resolve(true)}
      >
        body
      </ModalStyled>,
    );
    await act(async () => { vi.runAllTimers(); });
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await act(async () => {
      await Promise.resolve();
      vi.runAllTimers();
    });
    expect(onClose).not.toHaveBeenCalled();
  });
});
