import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { CopyButton } from "./CopyButton";

function installClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  Object.defineProperty(window, "isSecureContext", {
    value: true,
    configurable: true,
  });
  return writeText;
}

describe("<CopyButton />", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders default label and copies text on click", async () => {
    const writeText = installClipboard();
    const onCopy = vi.fn();

    render(<CopyButton text="hello world" onCopy={onCopy} />);

    const button = screen.getByRole("button", { name: /copy/i });
    expect(button).toHaveAttribute("type", "button");

    await user.click(button);

    expect(writeText).toHaveBeenCalledWith("hello world");
    expect(onCopy).toHaveBeenCalledWith("hello world");
    expect(button).toHaveAttribute("data-copied", "true");
  });

  test("swaps to copiedLabel after a successful copy", async () => {
    installClipboard();

    render(
      <CopyButton text="hi" copiedLabel="Copied!">
        Copy code
      </CopyButton>,
    );

    const button = screen.getByRole("button", { name: "Copy code" });
    await user.click(button);

    expect(screen.getByRole("button", { name: "Copied!" })).toBeInTheDocument();
  });

  test("supports a render-prop child", async () => {
    const writeText = installClipboard();

    render(
      <CopyButton text="value">
        {({ copied, copy }) => (
          <button type="button" onClick={copy}>
            {copied ? "Done" : "Click"}
          </button>
        )}
      </CopyButton>,
    );

    const button = screen.getByRole("button", { name: "Click" });
    await user.click(button);

    expect(writeText).toHaveBeenCalledWith("value");
    expect(
      await screen.findByRole("button", { name: "Done" }),
    ).toBeInTheDocument();
  });

  test("forwards ref to the underlying button", () => {
    installClipboard();
    let captured: HTMLButtonElement | null = null;
    render(
      <CopyButton
        text="x"
        ref={(node) => {
          captured = node;
        }}
      />,
    );
    expect(captured).toBeInstanceOf(HTMLButtonElement);
  });

  test("forwards extra HTML attributes", () => {
    installClipboard();
    render(
      <CopyButton text="x" className="my-btn" disabled aria-label="copy-x" />,
    );
    const button = screen.getByRole("button", { name: "copy-x" });
    expect(button).toHaveClass("my-btn");
    expect(button).toBeDisabled();
  });
});
