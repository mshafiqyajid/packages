import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DropdownMenuStyled } from "./DropdownMenuStyled";

async function openMenu(trigger: HTMLElement) {
  await act(async () => {
    fireEvent.click(trigger);
    await new Promise((r) => setTimeout(r, 20));
  });
}

describe("DropdownMenuStyled — checkbox and radio items", () => {
  it("renders a checkbox item with role=menuitemcheckbox", async () => {
    render(
      <DropdownMenuStyled
        trigger={<button>Open</button>}
        items={[{ label: "Bold", kind: "checkbox", checked: false, onClick: vi.fn() }]}
      />,
    );
    await openMenu(screen.getByRole("button", { name: "Open" }));
    await waitFor(() => {
      const item = screen.getByRole("menuitemcheckbox", { name: /Bold/i });
      expect(item).toBeInTheDocument();
      expect(item).toHaveAttribute("aria-checked", "false");
    });
  });

  it("shows check indicator when checkbox is checked", async () => {
    render(
      <DropdownMenuStyled
        trigger={<button>Open</button>}
        items={[{ label: "Italic", kind: "checkbox", checked: true, onClick: vi.fn() }]}
      />,
    );
    await openMenu(screen.getByRole("button", { name: "Open" }));
    await waitFor(() => {
      const item = screen.getByRole("menuitemcheckbox", { name: /Italic/i });
      expect(item).toHaveAttribute("aria-checked", "true");
    });
  });

  it("renders radio items with role=menuitemradio inside role=group", async () => {
    render(
      <DropdownMenuStyled
        trigger={<button>Open</button>}
        items={[
          { label: "Small", kind: "radio", group: "Size", checked: true, onClick: vi.fn() },
          { label: "Medium", kind: "radio", group: "Size", checked: false, onClick: vi.fn() },
          { label: "Large", kind: "radio", group: "Size", checked: false, onClick: vi.fn() },
        ]}
      />,
    );
    await openMenu(screen.getByRole("button", { name: "Open" }));
    await waitFor(() => {
      const group = screen.getByRole("group", { name: "Size" });
      expect(group).toBeInTheDocument();
      const radios = screen.getAllByRole("menuitemradio");
      expect(radios).toHaveLength(3);
      expect(radios[0]).toHaveAttribute("aria-checked", "true");
      expect(radios[1]).toHaveAttribute("aria-checked", "false");
    });
  });

  it("renders shortcut as a kbd element in the item row", async () => {
    render(
      <DropdownMenuStyled
        trigger={<button>Open</button>}
        items={[{ label: "Save", shortcut: "⌘S", onClick: vi.fn() }]}
      />,
    );
    await openMenu(screen.getByRole("button", { name: "Open" }));
    await waitFor(() => {
      expect(screen.getByText("⌘S").tagName.toLowerCase()).toBe("kbd");
    });
  });

  it("calls onClick when a checkbox item is clicked", async () => {
    const onClick = vi.fn();
    render(
      <DropdownMenuStyled
        trigger={<button>Open</button>}
        items={[{ label: "Wrap", kind: "checkbox", checked: false, onClick }]}
      />,
    );
    await openMenu(screen.getByRole("button", { name: "Open" }));
    await waitFor(() => screen.getByRole("menuitemcheckbox", { name: /Wrap/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole("menuitemcheckbox", { name: /Wrap/i }));
    });
    expect(onClick).toHaveBeenCalledOnce();
  });
});
