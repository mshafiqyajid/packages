import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { CopyButtonStyled } from "./CopyButtonStyled";

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

describe("<CopyButtonStyled />", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders with sensible defaults", () => {
    installClipboard();
    render(<CopyButtonStyled text="hi" />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("rcb-button");
    expect(button).toHaveAttribute("data-variant", "solid");
    expect(button).toHaveAttribute("data-size", "md");
    expect(button).toHaveAttribute("data-tone", "neutral");
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveTextContent("Copy");
  });

  test("merges user-provided className", () => {
    installClipboard();
    render(<CopyButtonStyled text="hi" className="extra" />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("rcb-button");
    expect(button).toHaveClass("extra");
  });

  test("forwards variant, size, tone to data-attrs", () => {
    installClipboard();
    render(
      <CopyButtonStyled
        text="hi"
        variant="outline"
        size="lg"
        tone="primary"
      />,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-variant", "outline");
    expect(button).toHaveAttribute("data-size", "lg");
    expect(button).toHaveAttribute("data-tone", "primary");
  });

  test("fullWidth and iconPosition data-attrs", () => {
    installClipboard();
    render(
      <CopyButtonStyled text="hi" fullWidth iconPosition="right" />,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-full-width", "true");
    expect(button).toHaveAttribute("data-icon-position", "right");
  });

  test("copies and toggles copied label", async () => {
    const writeText = installClipboard();
    render(<CopyButtonStyled text="abc" />);
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Copy");
    await user.click(button);
    expect(writeText).toHaveBeenCalledWith("abc");
    expect(button).toHaveAttribute("data-copied", "true");
    expect(button).toHaveTextContent("Copied");
  });

  test("custom labels", async () => {
    installClipboard();
    render(
      <CopyButtonStyled
        text="abc"
        label="Copy code"
        copiedLabel="✓ Copied!"
      />,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Copy code");
    await user.click(button);
    expect(button).toHaveTextContent("✓ Copied!");
  });

  test("icon=false hides icon container", () => {
    installClipboard();
    render(<CopyButtonStyled text="abc" icon={false} />);
    const button = screen.getByRole("button");
    expect(button.querySelector(".rcb-button__icon")).toBeNull();
  });

  test("icon=true (default) renders icon container", () => {
    installClipboard();
    render(<CopyButtonStyled text="abc" />);
    const button = screen.getByRole("button");
    expect(button.querySelector(".rcb-button__icon")).not.toBeNull();
  });

  test("size=icon hides label even when label is provided", () => {
    installClipboard();
    render(
      <CopyButtonStyled
        text="x"
        size="icon"
        label="should not show"
        aria-label="Copy"
      />,
    );
    const button = screen.getByRole("button", { name: "Copy" });
    expect(button.textContent).not.toContain("should not show");
  });

  test("loading=true shows the spinner", () => {
    installClipboard();
    render(<CopyButtonStyled text="x" loading={true} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-loading", "true");
    expect(button.querySelector(".rcb-button__spinner")).not.toBeNull();
  });

  test("loading=auto turns on while async text resolves", async () => {
    installClipboard();
    let resolve!: (value: string) => void;
    const asyncText = () =>
      new Promise<string>((r) => {
        resolve = r;
      });

    render(<CopyButtonStyled text={asyncText} />);
    const button = screen.getByRole("button");

    const click = user.click(button);
    await waitFor(() =>
      expect(button).toHaveAttribute("data-loading", "true"),
    );

    resolve("done");
    await click;
    await waitFor(() =>
      expect(button).not.toHaveAttribute("data-loading"),
    );
  });

  test("tooltip wraps the button and shows the tooltip text", () => {
    installClipboard();
    const { container } = render(
      <CopyButtonStyled text="x" tooltip="Copy to clipboard" />,
    );
    const wrapper = container.querySelector(".rcb-tooltip-wrapper");
    expect(wrapper).not.toBeNull();
    const tooltip = container.querySelector(".rcb-tooltip");
    expect(tooltip).toHaveTextContent("Copy to clipboard");
  });

  test("custom icon override is rendered", () => {
    installClipboard();
    render(
      <CopyButtonStyled
        text="x"
        icon={{
          copy: <span data-testid="custom-copy">C</span>,
          check: <span data-testid="custom-check">✓</span>,
        }}
      />,
    );
    expect(screen.getByTestId("custom-copy")).toBeInTheDocument();
    expect(screen.getByTestId("custom-check")).toBeInTheDocument();
  });

  test("a11y live region announces copy", async () => {
    installClipboard();
    const { container } = render(
      <CopyButtonStyled text="hi" announceOnCopy="Token copied!" />,
    );
    const button = screen.getByRole("button");
    await user.click(button);
    await waitFor(() => {
      const live = container.querySelector('[aria-live="polite"]');
      expect(live?.textContent).toBe("Token copied!");
    });
  });

  test("announceOnCopy=false omits the live region", () => {
    installClipboard();
    const { container } = render(
      <CopyButtonStyled text="hi" announceOnCopy={false} />,
    );
    expect(container.querySelector('[aria-live="polite"]')).toBeNull();
  });

  test("forwards ref", () => {
    installClipboard();
    let captured: HTMLButtonElement | null = null;
    render(
      <CopyButtonStyled
        text="x"
        ref={(node) => {
          captured = node;
        }}
      />,
    );
    expect(captured).toBeInstanceOf(HTMLButtonElement);
  });

  test("disabled prop is forwarded", () => {
    installClipboard();
    render(<CopyButtonStyled text="x" disabled aria-label="copy-x" />);
    const button = screen.getByRole("button", { name: "copy-x" });
    expect(button).toBeDisabled();
  });
});
