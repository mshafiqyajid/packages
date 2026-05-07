import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DropdownMenuStyled } from "./DropdownMenuStyled";

async function openMenu(trigger: HTMLElement) {
  await act(async () => {
    fireEvent.click(trigger);
    // flush the double-rAF that sets isOpen=true
    await new Promise((r) => setTimeout(r, 20));
  });
}

describe("DropdownMenuStyled — async loadItems", () => {
  it("shows loading text while resolving", async () => {
    let resolve!: (v: { label: string }[]) => void;
    const loadItems = () =>
      new Promise<{ label: string }[]>((res) => { resolve = res; });

    render(
      <DropdownMenuStyled
        trigger={<button>Open</button>}
        loadItems={loadItems}
        loadingText="Fetching…"
      />,
    );

    await openMenu(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(screen.getByText("Fetching…")).toBeInTheDocument();
    });

    resolve([]);
  });

  it("renders items after loadItems resolves", async () => {
    const loadItems = vi.fn().mockResolvedValue([
      { label: "Option A" },
      { label: "Option B" },
    ]);

    render(
      <DropdownMenuStyled
        trigger={<button>Open</button>}
        loadItems={loadItems}
      />,
    );

    await openMenu(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(screen.getByRole("menuitem", { name: "Option A" })).toBeInTheDocument();
      expect(screen.getByRole("menuitem", { name: "Option B" })).toBeInTheDocument();
    });
  });

  it("shows errorText when loadItems rejects", async () => {
    const loadItems = vi.fn().mockRejectedValue(new Error("Network error"));

    render(
      <DropdownMenuStyled
        trigger={<button>Open</button>}
        loadItems={loadItems}
        errorText="Could not load"
      />,
    );

    await openMenu(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(screen.getByText("Could not load")).toBeInTheDocument();
    });
  });

  it("calls loadItems only once per open session", async () => {
    const loadItems = vi.fn().mockResolvedValue([{ label: "X" }]);

    render(
      <DropdownMenuStyled
        trigger={<button>Open</button>}
        loadItems={loadItems}
      />,
    );

    await openMenu(screen.getByRole("button", { name: "Open" }));
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "X" })).toBeInTheDocument());

    expect(loadItems).toHaveBeenCalledTimes(1);
  });
});
