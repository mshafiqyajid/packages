import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { useDropdownMenu } from "./useDropdownMenu";

const items = ["Alpha", "Beta", "Gamma"];

function TestMenu({
  closeOnSelect = true,
  closeOnOutsideClick = true,
  closeOnEsc = true,
  onSelect,
}: {
  closeOnSelect?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnEsc?: boolean;
  onSelect?: (label: string) => void;
}) {
  const { triggerProps, menuProps, getItemProps, isOpen } = useDropdownMenu({
    closeOnSelect,
    closeOnOutsideClick,
    closeOnEsc,
    itemCount: items.length,
  });

  return (
    <div>
      <button {...triggerProps}>Open menu</button>
      {isOpen && (
        <ul {...menuProps} data-testid="menu">
          {items.map((item, i) => {
            const itemProps = getItemProps(i);
            return (
              <li
                key={item}
                {...itemProps}
                onClick={() => {
                  itemProps.onClick();
                  onSelect?.(item);
                }}
              >
                {item}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

describe("useDropdownMenu", () => {
  it("renders trigger and toggles menu open/closed on click", async () => {
    const user = userEvent.setup();
    render(<TestMenu />);

    expect(screen.queryByTestId("menu")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByTestId("menu")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.queryByTestId("menu")).not.toBeInTheDocument();
  });

  it("sets aria-expanded on the trigger to reflect open state", async () => {
    const user = userEvent.setup();
    render(<TestMenu />);

    const trigger = screen.getByRole("button", { name: "Open menu" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("closes on Escape when closeOnEsc is true", async () => {
    const user = userEvent.setup();
    render(<TestMenu closeOnEsc={true} />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByTestId("menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByTestId("menu")).not.toBeInTheDocument();
  });

  it("does not close on Escape when closeOnEsc is false", async () => {
    const user = userEvent.setup();
    render(<TestMenu closeOnEsc={false} />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByTestId("menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.getByTestId("menu")).toBeInTheDocument();
  });

  it("closes on item click when closeOnSelect is true and calls onSelect", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<TestMenu closeOnSelect={true} onSelect={onSelect} />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("menuitem", { name: "Beta" }));

    expect(onSelect).toHaveBeenCalledWith("Beta");
    expect(screen.queryByTestId("menu")).not.toBeInTheDocument();
  });

  it("stays open on item click when closeOnSelect is false", async () => {
    const user = userEvent.setup();
    render(<TestMenu closeOnSelect={false} />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("menuitem", { name: "Alpha" }));

    expect(screen.getByTestId("menu")).toBeInTheDocument();
  });

  it("opens with ArrowDown key and navigates items", async () => {
    const user = userEvent.setup();
    render(<TestMenu />);

    const trigger = screen.getByRole("button", { name: "Open menu" });
    trigger.focus();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByTestId("menu")).toBeInTheDocument();

    const menuItems = screen.getAllByRole("menuitem");
    expect(menuItems[0]).toHaveAttribute("data-active", "true");

    await user.keyboard("{ArrowDown}");
    expect(menuItems[1]).toHaveAttribute("data-active", "true");
  });

  it("closes on outside click when closeOnOutsideClick is true", () => {
    render(
      <div>
        <TestMenu closeOnOutsideClick={true} />
        <button>Outside</button>
      </div>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByTestId("menu")).toBeInTheDocument();

    fireEvent.pointerDown(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByTestId("menu")).not.toBeInTheDocument();
  });

  it("menu has correct ARIA roles and attributes", async () => {
    const user = userEvent.setup();
    render(<TestMenu />);

    const trigger = screen.getByRole("button", { name: "Open menu" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");

    await user.click(trigger);

    const menu = screen.getByTestId("menu");
    expect(menu).toHaveAttribute("role", "menu");

    const menuItems = screen.getAllByRole("menuitem");
    expect(menuItems).toHaveLength(3);
  });
});
