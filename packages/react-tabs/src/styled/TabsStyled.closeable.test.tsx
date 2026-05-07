import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { TabsStyled } from "./TabsStyled";

const tabs = [
  { value: "a", label: "Alpha", content: <div>Panel A</div>, closeable: true },
  { value: "b", label: "Beta",  content: <div>Panel B</div>, closeable: true },
  { value: "c", label: "Gamma", content: <div>Panel C</div> },
];

describe("TabsStyled — closeable tabs", () => {
  test("renders × button for tabs with closeable=true", () => {
    render(<TabsStyled tabs={tabs} defaultValue="a" />);
    const closeButtons = screen.getAllByRole("button", { name: /^Close /i });
    expect(closeButtons).toHaveLength(2);
  });

  test("× button has correct aria-label", () => {
    render(<TabsStyled tabs={tabs} defaultValue="a" />);
    expect(screen.getByRole("button", { name: "Close Alpha" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close Beta" })).toBeInTheDocument();
  });

  test("does not render × for tabs without closeable", () => {
    render(<TabsStyled tabs={tabs} defaultValue="a" />);
    expect(screen.queryByRole("button", { name: "Close Gamma" })).not.toBeInTheDocument();
  });

  test("clicking × fires onClose with the tab value", async () => {
    const onClose = vi.fn();
    render(<TabsStyled tabs={tabs} defaultValue="a" onClose={onClose} />);
    const closeAlpha = screen.getByRole("button", { name: "Close Alpha" });
    fireEvent.click(closeAlpha);
    await waitFor(() => expect(onClose).toHaveBeenCalledWith("a"), { timeout: 400 });
  });

  test("clicking × fires onTabClose (legacy alias) with the tab value", async () => {
    const onTabClose = vi.fn();
    render(<TabsStyled tabs={tabs} defaultValue="a" onTabClose={onTabClose} />);
    const closeBeta = screen.getByRole("button", { name: "Close Beta" });
    fireEvent.click(closeBeta);
    await waitFor(() => expect(onTabClose).toHaveBeenCalledWith("b"), { timeout: 400 });
  });

  test("closable (legacy) also renders a × button", () => {
    const legacyTabs = [
      { value: "x", label: "X", content: <div>X</div>, closable: true },
    ];
    render(<TabsStyled tabs={legacyTabs} defaultValue="x" />);
    expect(screen.getByRole("button", { name: "Close X" })).toBeInTheDocument();
  });

  test("clicking × button does not propagate to tab (does not switch to a different tab)", () => {
    const onChange = vi.fn();
    const threeClose = tabs.map((t) => ({ ...t, closeable: true }));
    render(<TabsStyled tabs={threeClose} defaultValue="a" onChange={onChange} />);
    const closeAlpha = screen.getByRole("button", { name: "Close Alpha" });
    fireEvent.click(closeAlpha);
    expect(onChange).not.toHaveBeenCalled();
  });

  test("× button has class rtab-close", () => {
    render(<TabsStyled tabs={tabs} defaultValue="a" />);
    const closeBtn = screen.getByRole("button", { name: "Close Alpha" });
    expect(closeBtn.className).toContain("rtab-close");
  });
});
