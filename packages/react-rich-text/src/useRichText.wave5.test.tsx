import { renderHook, render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRichText } from "./useRichText";
import { RichTextStyled, type RenderToolbarArgs } from "./styled/RichTextStyled";

beforeEach(() => {
  Object.defineProperty(document, "execCommand", {
    value: vi.fn().mockReturnValue(true),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(document, "queryCommandState", {
    value: vi.fn().mockReturnValue(false),
    writable: true,
    configurable: true,
  });
});

// ---------------------------------------------------------------------------
// 1. getSelection on the hook
// ---------------------------------------------------------------------------
describe("useRichText — getSelection", () => {
  it("returns a getSelection function", () => {
    const { result } = renderHook(() => useRichText());
    expect(typeof result.current.getSelection).toBe("function");
  });

  it("getSelection returns null range when nothing is selected", () => {
    const { result } = renderHook(() => useRichText());
    const sel = result.current.getSelection();
    expect(sel.range).toBeNull();
    expect(sel.text).toBe("");
  });
});

// ---------------------------------------------------------------------------
// 2. onSelectionChange callback
// ---------------------------------------------------------------------------
describe("useRichText — onSelectionChange", () => {
  it("onSelectionChange is accepted without error", () => {
    const handler = vi.fn();
    expect(() =>
      renderHook(() => useRichText({ onSelectionChange: handler })),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// 3. undo/redo toolbar items in RichTextStyled
// ---------------------------------------------------------------------------
describe("RichTextStyled — undo/redo toolbar items", () => {
  it("renders undo button when 'undo' is in toolbarItems", () => {
    render(<RichTextStyled toolbarItems={["undo", "redo", "bold"]} />);
    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Redo" })).toBeInTheDocument();
  });

  it("does not render undo button when not in toolbarItems", () => {
    render(<RichTextStyled toolbarItems={["bold"]} />);
    expect(screen.queryByRole("button", { name: "Undo" })).toBeNull();
  });

  it("calls execCommand('undo') when undo button is mousedown'd", () => {
    render(<RichTextStyled toolbarItems={["undo"]} />);
    const btn = screen.getByRole("button", { name: "Undo" });
    fireEvent.mouseDown(btn);
    expect(document.execCommand).toHaveBeenCalledWith("undo", false, undefined);
  });

  it("calls execCommand('redo') when redo button is mousedown'd", () => {
    render(<RichTextStyled toolbarItems={["redo"]} />);
    const btn = screen.getByRole("button", { name: "Redo" });
    fireEvent.mouseDown(btn);
    expect(document.execCommand).toHaveBeenCalledWith("redo", false, undefined);
  });
});

// ---------------------------------------------------------------------------
// 4. code toolbar item
// ---------------------------------------------------------------------------
describe("RichTextStyled — code toolbar item", () => {
  it("renders code button when 'code' is in toolbarItems", () => {
    render(<RichTextStyled toolbarItems={["code"]} />);
    expect(screen.getByRole("button", { name: "Inline code" })).toBeInTheDocument();
  });

  it("code button has data-cmd='code'", () => {
    render(<RichTextStyled toolbarItems={["code"]} />);
    const btn = screen.getByRole("button", { name: "Inline code" });
    expect(btn).toHaveAttribute("data-cmd", "code");
  });
});

// ---------------------------------------------------------------------------
// 5. renderToolbar slot
// ---------------------------------------------------------------------------
describe("RichTextStyled — renderToolbar slot", () => {
  it("renders custom toolbar instead of default when renderToolbar is set", () => {
    const customToolbar = vi.fn(() => <div data-testid="custom-toolbar">My toolbar</div>);
    render(
      <RichTextStyled
        showToolbar
        renderToolbar={customToolbar}
      />,
    );
    expect(screen.getByTestId("custom-toolbar")).toBeInTheDocument();
    expect(screen.queryByRole("toolbar")).toBeNull();
  });

  it("passes execCommand and format flags to renderToolbar", () => {
    let capturedArgs: RenderToolbarArgs | null = null;
    const customToolbar = (args: RenderToolbarArgs) => {
      capturedArgs = args;
      return <div />;
    };
    render(<RichTextStyled showToolbar renderToolbar={customToolbar} />);
    expect(capturedArgs).not.toBeNull();
    expect(typeof capturedArgs!.execCommand).toBe("function");
    expect(typeof capturedArgs!.isBold).toBe("boolean");
  });
});

// ---------------------------------------------------------------------------
// 6. renderFooter slot
// ---------------------------------------------------------------------------
describe("RichTextStyled — renderFooter slot", () => {
  it("renders custom footer instead of word count when renderFooter is set", () => {
    render(
      <RichTextStyled
        wordCount
        renderFooter={({ words, chars }) => (
          <div data-testid="custom-footer">{words}w/{chars}c</div>
        )}
      />,
    );
    expect(screen.getByTestId("custom-footer")).toBeInTheDocument();
    expect(screen.queryByText(/words/)).toBeNull();
  });

  it("renderFooter receives word and char counts", () => {
    let capturedCounts: { words: number; chars: number } | null = null;
    render(
      <RichTextStyled
        renderFooter={(counts) => {
          capturedCounts = counts;
          return <div />;
        }}
      />,
    );
    expect(capturedCounts).not.toBeNull();
    expect(typeof capturedCounts!.words).toBe("number");
    expect(typeof capturedCounts!.chars).toBe("number");
  });
});

// ---------------------------------------------------------------------------
// 7. placeholderEachLine prop
// ---------------------------------------------------------------------------
describe("RichTextStyled — placeholderEachLine", () => {
  it("sets data-placeholder-each-line on the editor wrap", () => {
    const { container } = render(
      <RichTextStyled placeholderEachLine="Type something…" />,
    );
    const wrap = container.querySelector(".rrt2-editor-wrap");
    expect(wrap).toHaveAttribute("data-placeholder-each-line", "Type something…");
  });

  it("does not set data-placeholder-each-line when prop is omitted", () => {
    const { container } = render(<RichTextStyled />);
    const wrap = container.querySelector(".rrt2-editor-wrap");
    expect(wrap).not.toHaveAttribute("data-placeholder-each-line");
  });
});
