import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ContextMenuStyled } from "./styled/ContextMenuStyled";
import type { ContextMenuItem } from "./styled/ContextMenuStyled";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultItems: ContextMenuItem[] = [
  { type: "item", label: "Cut", shortcut: "⌘X", onClick: vi.fn() },
  { type: "item", label: "Copy", shortcut: "⌘C", onClick: vi.fn() },
  { type: "separator" },
  { type: "item", label: "Paste", shortcut: "⌘V", onClick: vi.fn() },
  { type: "item", label: "Delete", disabled: true, onClick: vi.fn() },
];

function openContextMenu(element: HTMLElement, x = 100, y = 200) {
  fireEvent.contextMenu(element, { clientX: x, clientY: y });
}

function getMenu() {
  return document.querySelector<HTMLDivElement>('[role="menu"]');
}

function getMenuItems() {
  return document.querySelectorAll<HTMLLIElement>('[role="menuitem"]');
}

// ---------------------------------------------------------------------------
// Test component
// ---------------------------------------------------------------------------

function TestContextMenu({
  items = defaultItems,
  disabled = false,
  onOpenChange,
  open,
}: {
  items?: ContextMenuItem[];
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}) {
  return (
    <ContextMenuStyled
      items={items}
      disabled={disabled}
      onOpenChange={onOpenChange}
      open={open}
    >
      <div data-testid="trigger">Right-click here</div>
    </ContextMenuStyled>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ContextMenuStyled", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens on right-click (contextmenu event)", () => {
    render(<TestContextMenu />);
    const trigger = screen.getByTestId("trigger");

    expect(getMenu()).toBeNull();
    openContextMenu(trigger);
    expect(getMenu()).toBeInTheDocument();
  });

  it("does not open when disabled=true", () => {
    render(<TestContextMenu disabled />);
    openContextMenu(screen.getByTestId("trigger"));
    expect(getMenu()).toBeNull();
  });

  it("closes on Escape key", () => {
    render(<TestContextMenu />);
    openContextMenu(screen.getByTestId("trigger"));

    const menu = getMenu()!;
    expect(menu).toBeInTheDocument();

    fireEvent.keyDown(menu, { key: "Escape" });
    // Menu enters closed state; after animation it unmounts
    // We test data-state attribute instead to avoid relying on timer
    expect(menu).toHaveAttribute("data-state", "closed");
  });

  it("closes when an item is clicked", () => {
    render(<TestContextMenu />);
    openContextMenu(screen.getByTestId("trigger"));

    const items = getMenuItems();
    const cutItem = Array.from(items).find((el) => el.textContent?.includes("Cut"))!;
    fireEvent.click(cutItem);

    expect(getMenu()).toHaveAttribute("data-state", "closed");
  });

  it("calls item onClick when item is clicked", () => {
    const onClick = vi.fn();
    render(
      <TestContextMenu
        items={[{ type: "item", label: "Action", onClick }]}
      />,
    );
    openContextMenu(screen.getByTestId("trigger"));
    const item = getMenuItems()[0]!;
    fireEvent.click(item);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disabled item is not clickable and does not call onClick", () => {
    const onClick = vi.fn();
    render(
      <TestContextMenu
        items={[{ type: "item", label: "Disabled Action", disabled: true, onClick }]}
      />,
    );
    openContextMenu(screen.getByTestId("trigger"));
    const item = getMenuItems()[0]!;
    expect(item).toHaveAttribute("data-disabled", "true");
    expect(item).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(item);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("calls onOpenChange(true) when menu opens", () => {
    const onOpenChange = vi.fn();
    render(<TestContextMenu onOpenChange={onOpenChange} />);
    openContextMenu(screen.getByTestId("trigger"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("calls onOpenChange(false) when Escape is pressed", () => {
    const onOpenChange = vi.fn();
    render(<TestContextMenu onOpenChange={onOpenChange} />);
    openContextMenu(screen.getByTestId("trigger"));

    const menu = getMenu()!;
    fireEvent.keyDown(menu, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("controlled mode: renders open when open=true", () => {
    render(<TestContextMenu open={true} />);
    expect(getMenu()).toBeInTheDocument();
  });

  it("controlled mode: does not render when open=false", () => {
    render(<TestContextMenu open={false} />);
    expect(getMenu()).toBeNull();
  });

  it("ArrowDown navigates to the first non-disabled item", () => {
    render(<TestContextMenu />);
    openContextMenu(screen.getByTestId("trigger"));

    const menu = getMenu()!;
    fireEvent.keyDown(menu, { key: "ArrowDown" });

    const items = getMenuItems();
    // First navigable item should be focused (index 0 = Cut)
    const focusedItem = Array.from(items).find((el) => el.dataset.focused === "true");
    expect(focusedItem).not.toBeUndefined();
  });

  it("ArrowDown then ArrowUp returns to the same item", () => {
    render(
      <TestContextMenu
        items={[
          { type: "item", label: "Alpha", onClick: vi.fn() },
          { type: "item", label: "Beta", onClick: vi.fn() },
        ]}
      />,
    );
    openContextMenu(screen.getByTestId("trigger"));
    const menu = getMenu()!;

    fireEvent.keyDown(menu, { key: "ArrowDown" });
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    fireEvent.keyDown(menu, { key: "ArrowUp" });

    const items = getMenuItems();
    // Should be back to first item (Alpha)
    expect(items[0]).toHaveAttribute("data-focused", "true");
  });

  it("Enter key activates the focused item", () => {
    const onClick = vi.fn();
    render(
      <TestContextMenu
        items={[{ type: "item", label: "Go", onClick }]}
      />,
    );
    openContextMenu(screen.getByTestId("trigger"));
    const menu = getMenu()!;

    fireEvent.keyDown(menu, { key: "ArrowDown" });
    fireEvent.keyDown(menu, { key: "Enter" });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("Space key activates the focused item", () => {
    const onClick = vi.fn();
    render(
      <TestContextMenu
        items={[{ type: "item", label: "Go", onClick }]}
      />,
    );
    openContextMenu(screen.getByTestId("trigger"));
    const menu = getMenu()!;

    fireEvent.keyDown(menu, { key: "ArrowDown" });
    fireEvent.keyDown(menu, { key: " " });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("first-letter navigation jumps to matching item", () => {
    render(
      <TestContextMenu
        items={[
          { type: "item", label: "Apple", onClick: vi.fn() },
          { type: "item", label: "Banana", onClick: vi.fn() },
          { type: "item", label: "Cherry", onClick: vi.fn() },
        ]}
      />,
    );
    openContextMenu(screen.getByTestId("trigger"));
    const menu = getMenu()!;

    fireEvent.keyDown(menu, { key: "b" });

    const items = getMenuItems();
    // "Banana" is at index 1
    expect(items[1]).toHaveAttribute("data-focused", "true");
  });

  it("trigger has aria-haspopup=menu", () => {
    render(<TestContextMenu />);
    const trigger = screen.getByTestId("trigger").parentElement!;
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
  });

  it("menu has role=menu and aria-orientation=vertical", () => {
    render(<TestContextMenu />);
    openContextMenu(screen.getByTestId("trigger"));
    const menu = getMenu()!;
    expect(menu).toHaveAttribute("role", "menu");
    expect(menu).toHaveAttribute("aria-orientation", "vertical");
  });

  it("menu items have role=menuitem", () => {
    render(<TestContextMenu />);
    openContextMenu(screen.getByTestId("trigger"));
    const items = getMenuItems();
    expect(items.length).toBeGreaterThan(0);
    items.forEach((item) => {
      expect(item).toHaveAttribute("role", "menuitem");
    });
  });

  it("separator items are rendered with role=separator", () => {
    render(
      <TestContextMenu
        items={[
          { type: "item", label: "A", onClick: vi.fn() },
          { type: "separator" },
          { type: "item", label: "B", onClick: vi.fn() },
        ]}
      />,
    );
    openContextMenu(screen.getByTestId("trigger"));
    const separators = document.querySelectorAll('[role="separator"]');
    expect(separators.length).toBe(1);
  });

  it("label items are rendered and not interactive", () => {
    render(
      <TestContextMenu
        items={[
          { type: "label", label: "Section" },
          { type: "item", label: "Item", onClick: vi.fn() },
        ]}
      />,
    );
    openContextMenu(screen.getByTestId("trigger"));
    const label = document.querySelector(".rctx-label")!;
    expect(label).toBeInTheDocument();
    expect(label.textContent).toBe("Section");
  });

  it("skips separators/labels in ArrowDown navigation", () => {
    render(
      <TestContextMenu
        items={[
          { type: "label", label: "Group" },
          { type: "item", label: "Alpha", onClick: vi.fn() },
          { type: "separator" },
          { type: "item", label: "Beta", onClick: vi.fn() },
        ]}
      />,
    );
    openContextMenu(screen.getByTestId("trigger"));
    const menu = getMenu()!;

    fireEvent.keyDown(menu, { key: "ArrowDown" });
    fireEvent.keyDown(menu, { key: "ArrowDown" });

    // Second navigable item (Beta, navIndex=1) should be focused
    const items = getMenuItems();
    expect(items[1]).toHaveAttribute("data-focused", "true");
  });

  it("closes menu on outside pointer-down", () => {
    render(
      <div>
        <TestContextMenu />
        <button data-testid="outside">Outside</button>
      </div>,
    );
    openContextMenu(screen.getByTestId("trigger"));
    expect(getMenu()).toBeInTheDocument();

    fireEvent.pointerDown(screen.getByTestId("outside"));
    expect(getMenu()).toHaveAttribute("data-state", "closed");
  });

  it("item with sub-menu shows chevron icon", () => {
    render(
      <TestContextMenu
        items={[
          {
            type: "item",
            label: "Share",
            items: [
              { type: "item", label: "Email", onClick: vi.fn() },
            ],
          },
        ]}
      />,
    );
    openContextMenu(screen.getByTestId("trigger"));
    const chevron = document.querySelector(".rctx-item-chevron");
    expect(chevron).toBeInTheDocument();
  });

  it("ArrowRight opens sub-menu for focused item with sub-items", () => {
    render(
      <TestContextMenu
        items={[
          {
            type: "item",
            label: "Share",
            items: [
              { type: "item", label: "Email", onClick: vi.fn() },
              { type: "item", label: "Link", onClick: vi.fn() },
            ],
          },
        ]}
      />,
    );
    openContextMenu(screen.getByTestId("trigger"));
    const menu = getMenu()!;

    fireEvent.keyDown(menu, { key: "ArrowDown" });
    fireEvent.keyDown(menu, { key: "ArrowRight" });

    // Sub-menu should now be in DOM
    const subMenu = document.querySelector(".rctx-submenu");
    expect(subMenu).toBeInTheDocument();
  });

  it("shortcut text is displayed in the item", () => {
    render(
      <TestContextMenu
        items={[{ type: "item", label: "Save", shortcut: "⌘S", onClick: vi.fn() }]}
      />,
    );
    openContextMenu(screen.getByTestId("trigger"));
    const shortcut = document.querySelector(".rctx-item-shortcut");
    expect(shortcut).toBeInTheDocument();
    expect(shortcut?.textContent).toBe("⌘S");
  });
});
