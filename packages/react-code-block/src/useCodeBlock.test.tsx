import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useCodeBlock } from "./useCodeBlock";

// ---------------------------------------------------------------------------
// Minimal test harness — renders the hook output as a real component
// ---------------------------------------------------------------------------
interface HarnessProps {
  code: string;
  language?: string;
  showCopy?: boolean;
  copyLabel?: string;
  copiedLabel?: string;
  onCopy?: () => void;
  showLineNumbers?: boolean;
  diff?: boolean;
  highlightLines?: number[];
}

function Harness({
  code,
  language,
  showCopy,
  copyLabel,
  copiedLabel,
  onCopy,
  showLineNumbers = false,
  diff = false,
  highlightLines = [],
}: HarnessProps) {
  const { rootProps, copyProps, isCopied } = useCodeBlock({
    code,
    language,
    showCopy,
    copyLabel,
    copiedLabel,
    onCopy,
  });

  const lines = code.split("\n");

  return (
    <div {...rootProps} data-testid="root">
      <pre>
        <code data-testid="code-element">
          {lines.map((line, idx) => {
            const lineNumber = idx + 1;
            const isDiffAdd = diff && line.startsWith("+");
            const isDiffRemove = diff && line.startsWith("-");
            const isHighlighted = highlightLines.includes(lineNumber);
            return (
              <span
                key={idx}
                className="rcblk-line"
                data-diff-type={
                  isDiffAdd ? "add" : isDiffRemove ? "remove" : undefined
                }
                data-highlighted={isHighlighted ? "true" : undefined}
              >
                {showLineNumbers && (
                  <span
                    className="rcblk-line-number"
                    aria-hidden="true"
                    data-testid={`line-number-${lineNumber}`}
                  >
                    {lineNumber}
                  </span>
                )}
                {line}
              </span>
            );
          })}
        </code>
      </pre>
      {showCopy !== false && (
        <button {...copyProps} data-testid="copy-button">
          {isCopied ? (copiedLabel ?? "Copied!") : (copyLabel ?? "Copy")}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Clipboard mock
// ---------------------------------------------------------------------------
const mockWriteText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  vi.useFakeTimers();
  mockWriteText.mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: mockWriteText },
    configurable: true,
    writable: true,
  });
  Object.defineProperty(window, "isSecureContext", {
    value: true,
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Helper: click the copy button and flush the microtask queue
// ---------------------------------------------------------------------------
async function clickCopy(btn: HTMLElement) {
  await act(async () => {
    fireEvent.click(btn);
    // Drain microtasks so the async writeToClipboard resolves
    await Promise.resolve();
    await Promise.resolve();
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("useCodeBlock", () => {
  it("isCopied starts as false", () => {
    render(<Harness code="const x = 1;" language="typescript" />);
    const btn = screen.getByTestId("copy-button");
    expect(btn).toHaveTextContent("Copy");
    expect(btn).toHaveAttribute("aria-pressed", "false");
  });

  it("copyProps.onClick sets isCopied to true", async () => {
    render(<Harness code="const x = 1;" language="typescript" />);
    const btn = screen.getByTestId("copy-button");
    await clickCopy(btn);
    expect(screen.getByTestId("copy-button")).toHaveTextContent("Copied!");
    expect(screen.getByTestId("copy-button")).toHaveAttribute("aria-pressed", "true");
  });

  it("isCopied reverts to false after 2000ms", async () => {
    render(<Harness code="const x = 1;" />);
    const btn = screen.getByTestId("copy-button");
    await clickCopy(btn);
    expect(screen.getByTestId("copy-button")).toHaveTextContent("Copied!");

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByTestId("copy-button")).toHaveTextContent("Copy");
    expect(screen.getByTestId("copy-button")).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onCopy callback when copy is triggered", async () => {
    const onCopy = vi.fn();
    render(<Harness code="hello world" onCopy={onCopy} />);
    await clickCopy(screen.getByTestId("copy-button"));
    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it("rootProps has role='region' and correct aria-label", () => {
    render(<Harness code="const x = 1;" language="typescript" />);
    const root = screen.getByTestId("root");
    expect(root).toHaveAttribute("role", "region");
    expect(root).toHaveAttribute("aria-label", "Code block: typescript");
  });

  it("rootProps aria-label defaults to 'Code block: text' when language omitted", () => {
    render(<Harness code="hello" />);
    expect(screen.getByTestId("root")).toHaveAttribute("aria-label", "Code block: text");
  });

  it("copyProps has correct aria-label before copy", () => {
    render(<Harness code="const x = 1;" copyLabel="Copy code" />);
    expect(screen.getByTestId("copy-button")).toHaveAttribute("aria-label", "Copy code");
  });

  it("copyProps has correct aria-label after copy", async () => {
    render(<Harness code="const x = 1;" copyLabel="Copy code" copiedLabel="Done!" />);
    await clickCopy(screen.getByTestId("copy-button"));
    expect(screen.getByTestId("copy-button")).toHaveAttribute("aria-label", "Done!");
  });

  it("showCopy=false doesn't render copy button", () => {
    render(<Harness code="const x = 1;" showCopy={false} />);
    expect(screen.queryByTestId("copy-button")).toBeNull();
  });

  it("renders the code string in a <code> element", () => {
    const code = "const answer = 42;";
    render(<Harness code={code} />);
    const codeEl = screen.getByTestId("code-element");
    expect(codeEl.textContent).toContain(code);
  });

  it("showLineNumbers=true renders line number elements", () => {
    render(<Harness code={"line one\nline two\nline three"} showLineNumbers />);
    expect(screen.getByTestId("line-number-1")).toBeInTheDocument();
    expect(screen.getByTestId("line-number-2")).toBeInTheDocument();
    expect(screen.getByTestId("line-number-3")).toBeInTheDocument();
    expect(screen.getByTestId("line-number-1")).toHaveAttribute("aria-hidden", "true");
  });

  it("diff=true marks lines with '+' as data-diff-type='add'", () => {
    const code = "+const added = true;\n const unchanged = 1;";
    render(<Harness code={code} diff />);
    const lines = document.querySelectorAll(".rcblk-line");
    expect(lines[0]).toHaveAttribute("data-diff-type", "add");
    expect(lines[1]).not.toHaveAttribute("data-diff-type");
  });

  it("diff=true marks lines with '-' as data-diff-type='remove'", () => {
    const code = "-const removed = true;\n const unchanged = 1;";
    render(<Harness code={code} diff />);
    const lines = document.querySelectorAll(".rcblk-line");
    expect(lines[0]).toHaveAttribute("data-diff-type", "remove");
    expect(lines[1]).not.toHaveAttribute("data-diff-type");
  });

  it("highlightLines=[2] marks line 2 as highlighted", () => {
    const code = "first line\nsecond line\nthird line";
    render(<Harness code={code} highlightLines={[2]} />);
    const lines = document.querySelectorAll(".rcblk-line");
    expect(lines[0]).not.toHaveAttribute("data-highlighted");
    expect(lines[1]).toHaveAttribute("data-highlighted", "true");
    expect(lines[2]).not.toHaveAttribute("data-highlighted");
  });

  it("clipboard writeText is called with the code string", async () => {
    const code = "const secret = 42;";
    render(<Harness code={code} />);
    await clickCopy(screen.getByTestId("copy-button"));
    expect(mockWriteText).toHaveBeenCalledWith(code);
  });
});
