import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RichTextStyled } from "./RichTextStyled";

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

describe("RichTextStyled — form-input parity", () => {
  it("renders a <label> wired to the editor", () => {
    render(<RichTextStyled label="Bio" id="bio-editor" />);
    const editor = document.getElementById("bio-editor");
    expect(editor).not.toBeNull();
    const label = screen.getByText("Bio").closest("label");
    expect(label?.getAttribute("for")).toBe("bio-editor");
  });

  it("renders a hidden input mirroring the html when name is set", () => {
    render(
      <RichTextStyled
        name="body"
        defaultValue="<p>hi</p>"
      />,
    );
    const hidden = document.querySelector('input[type="hidden"][name="body"]') as HTMLInputElement | null;
    expect(hidden).not.toBeNull();
    // After mount the controlled-html effect should write defaultValue.
    expect(hidden!.value).toContain("hi");
  });

  it("sets data-invalid + aria-invalid when invalid is true", () => {
    render(<RichTextStyled invalid label="Bio" id="bio2" />);
    const editor = document.getElementById("bio2");
    expect(editor?.getAttribute("aria-invalid")).toBe("true");
    const root = editor?.closest(".rrt2-root");
    expect(root?.getAttribute("data-invalid")).toBe("true");
  });

  it("renders an error message in role=alert", () => {
    render(<RichTextStyled error="URL required" />);
    const msg = screen.getByRole("alert");
    expect(msg).toHaveTextContent("URL required");
  });

  it("renders a hint message when no error is present", () => {
    render(<RichTextStyled hint="Markdown supported" />);
    expect(screen.getByText("Markdown supported")).toBeInTheDocument();
  });
});

describe("RichTextStyled — link prompt", () => {
  it("opens the popover (default) when the Link toolbar button is pressed", () => {
    render(<RichTextStyled />);
    const linkBtn = screen.getByLabelText("Link");
    fireEvent.mouseDown(linkBtn);
    // The popover renders a dialog
    const dialog = screen.queryByRole("dialog", { name: /add link|edit link/i });
    expect(dialog).not.toBeNull();
  });

  it("falls back to window.prompt when defaultLinkPrompt='prompt'", () => {
    const promptSpy = vi.spyOn(window, "prompt").mockReturnValue(null);
    render(<RichTextStyled defaultLinkPrompt="prompt" />);
    fireEvent.mouseDown(screen.getByLabelText("Link"));
    expect(promptSpy).toHaveBeenCalled();
    promptSpy.mockRestore();
  });
});
