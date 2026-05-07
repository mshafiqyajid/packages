import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { SwitchStyled } from "./SwitchStyled";

describe("SwitchStyled — confirm guard", () => {
  it("toggles immediately when confirm returns true synchronously", async () => {
    const user = userEvent.setup();
    const confirm = vi.fn(() => true);
    render(<SwitchStyled confirm={confirm} />);
    const btn = screen.getByRole("switch");
    await user.click(btn);
    expect(confirm).toHaveBeenCalledWith(true);
    expect(btn).toHaveAttribute("aria-checked", "true");
  });

  it("blocks toggle when confirm returns false synchronously", async () => {
    const user = userEvent.setup();
    const confirm = vi.fn(() => false);
    render(<SwitchStyled confirm={confirm} />);
    const btn = screen.getByRole("switch");
    await user.click(btn);
    expect(confirm).toHaveBeenCalledWith(true);
    expect(btn).toHaveAttribute("aria-checked", "false");
  });

  it("enters pending state while confirm promise is in flight", async () => {
    const user = userEvent.setup();
    let resolve!: (v: boolean) => void;
    const confirm = vi.fn(
      () =>
        new Promise<boolean>((r) => {
          resolve = r;
        }),
    );
    render(<SwitchStyled confirm={confirm} />);
    const btn = screen.getByRole("switch");
    await user.click(btn);
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(btn).toHaveAttribute("data-pending", "true");

    await new Promise<void>((done) => {
      resolve(true);
      setTimeout(done, 0);
    });

    expect(btn).not.toHaveAttribute("aria-busy");
    expect(btn).toHaveAttribute("aria-checked", "true");
  });

  it("reverts optimistic state when confirm promise resolves false", async () => {
    const user = userEvent.setup();
    let resolve!: (v: boolean) => void;
    const confirm = vi.fn(
      () =>
        new Promise<boolean>((r) => {
          resolve = r;
        }),
    );
    render(<SwitchStyled confirm={confirm} />);
    const btn = screen.getByRole("switch");
    await user.click(btn);

    await new Promise<void>((done) => {
      resolve(false);
      setTimeout(done, 0);
    });

    expect(btn).toHaveAttribute("aria-checked", "false");
    expect(btn).not.toHaveAttribute("aria-busy");
  });

  it("reverts optimistic state when confirm promise rejects", async () => {
    const user = userEvent.setup();
    let reject!: (e: Error) => void;
    const confirm = vi.fn(
      () =>
        new Promise<boolean>((_, r) => {
          reject = r;
        }),
    );
    render(<SwitchStyled confirm={confirm} />);
    const btn = screen.getByRole("switch");
    await user.click(btn);

    await new Promise<void>((done) => {
      reject(new Error("denied"));
      setTimeout(done, 0);
    });

    expect(btn).toHaveAttribute("aria-checked", "false");
    expect(btn).not.toHaveAttribute("aria-busy");
  });

  it("blocks clicks while confirm promise is pending", async () => {
    const user = userEvent.setup();
    const confirm = vi.fn(() => new Promise<boolean>(() => {}));
    render(<SwitchStyled confirm={confirm} />);
    const btn = screen.getByRole("switch");
    await user.click(btn);
    await user.click(btn);
    expect(confirm).toHaveBeenCalledTimes(1);
  });

  it("calls onChange after confirm resolves true", async () => {
    const user = userEvent.setup();
    let resolve!: (v: boolean) => void;
    const confirm = vi.fn(
      () =>
        new Promise<boolean>((r) => {
          resolve = r;
        }),
    );
    const onChange = vi.fn();
    render(<SwitchStyled confirm={confirm} onChange={onChange} />);
    const btn = screen.getByRole("switch");
    await user.click(btn);
    expect(onChange).not.toHaveBeenCalled();

    await new Promise<void>((done) => {
      resolve(true);
      setTimeout(done, 0);
    });

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("does not call onChange when confirm resolves false", async () => {
    const user = userEvent.setup();
    let resolve!: (v: boolean) => void;
    const confirm = vi.fn(
      () =>
        new Promise<boolean>((r) => {
          resolve = r;
        }),
    );
    const onChange = vi.fn();
    render(<SwitchStyled confirm={confirm} onChange={onChange} />);
    const btn = screen.getByRole("switch");
    await user.click(btn);

    await new Promise<void>((done) => {
      resolve(false);
      setTimeout(done, 0);
    });

    expect(onChange).not.toHaveBeenCalled();
  });
});
