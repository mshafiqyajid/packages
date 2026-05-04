import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KanbanStyled } from "./KanbanStyled";
import type { KanbanColumn } from "../useKanban";

function ControlledBoard(props: {
  initial: KanbanColumn[];
  onColumns?: (cols: KanbanColumn[]) => void;
} & Record<string, unknown>) {
  const { initial, onColumns, ...rest } = props;
  const [columns, setColumns] = useState<KanbanColumn[]>(initial);
  return (
    <KanbanStyled
      columns={columns}
      onChange={(c) => {
        setColumns(c);
        onColumns?.(c);
      }}
      {...rest}
    />
  );
}

function baseColumns(): KanbanColumn[] {
  return [
    { id: "todo", title: "To Do", cards: [{ id: "c1", content: "Task one" }] },
    { id: "done", title: "Done", cards: [] },
  ];
}

describe("KanbanStyled", () => {
  it("renders columns and cards", () => {
    render(<ControlledBoard initial={baseColumns()} />);
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByText("Task one")).toBeInTheDocument();
  });

  it("clicking add-card affordance opens an input that adds a card on Enter", async () => {
    const user = userEvent.setup();
    const onCardAdd = vi.fn();
    render(
      <ControlledBoard
        initial={baseColumns()}
        addCardPlaceholder="+ Add card"
        onCardAdd={onCardAdd}
      />,
    );

    const buttons = screen.getAllByRole("button", { name: "+ Add card" });
    await user.click(buttons[0]!);

    const input = screen.getByLabelText("New card title") as HTMLInputElement;
    await user.type(input, "Brand new task{Enter}");

    expect(screen.getByText("Brand new task")).toBeInTheDocument();
    expect(onCardAdd).toHaveBeenCalledOnce();
    expect(onCardAdd.mock.calls[0]?.[0]?.content).toBe("Brand new task");
  });

  it("Escape cancels add-card without adding", async () => {
    const user = userEvent.setup();
    render(
      <ControlledBoard
        initial={baseColumns()}
        addCardPlaceholder="+ Add card"
      />,
    );

    const buttons = screen.getAllByRole("button", { name: "+ Add card" });
    await user.click(buttons[0]!);
    const input = screen.getByLabelText("New card title") as HTMLInputElement;
    await user.type(input, "Discarded{Escape}");

    expect(screen.queryByText("Discarded")).not.toBeInTheDocument();
  });

  it("add-column flow prompts for title and creates a column with that title", async () => {
    const user = userEvent.setup();
    const onColumnAdd = vi.fn();
    render(
      <ControlledBoard
        initial={baseColumns()}
        addColumnPlaceholder="+ Add column"
        onColumnAdd={onColumnAdd}
      />,
    );

    await user.click(screen.getByRole("button", { name: /\+ Add column/ }));
    const input = screen.getByLabelText("New column title") as HTMLInputElement;
    await user.type(input, "Backlog{Enter}");

    expect(screen.getByText("Backlog")).toBeInTheDocument();
    expect(onColumnAdd).toHaveBeenCalledOnce();
    expect(onColumnAdd.mock.calls[0]?.[0]?.title).toBe("Backlog");
  });

  it("showCardRemoveButton calls onCardRemove when × clicked", async () => {
    const user = userEvent.setup();
    const onCardRemove = vi.fn();
    render(
      <ControlledBoard
        initial={baseColumns()}
        showCardRemoveButton
        onCardRemove={onCardRemove}
      />,
    );

    const removeBtn = screen.getByRole("button", { name: /Remove Task one/ });
    await user.click(removeBtn);

    expect(onCardRemove).toHaveBeenCalledOnce();
    expect(onCardRemove.mock.calls[0]?.[0]?.id).toBe("c1");
    expect(screen.queryByText("Task one")).not.toBeInTheDocument();
  });

  it("cardActions invokes onAction with card and column id", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <ControlledBoard
        initial={baseColumns()}
        cardActions={[{ id: "edit", label: "Edit", onAction }]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(onAction).toHaveBeenCalledOnce();
    expect(onAction.mock.calls[0]?.[0]?.id).toBe("c1");
    expect(onAction.mock.calls[0]?.[1]).toBe("todo");
  });

  it("renameColumnInline allows editing on double-click and commits on Enter", async () => {
    const user = userEvent.setup();
    const onColumnRename = vi.fn();
    render(
      <ControlledBoard
        initial={baseColumns()}
        renameColumnInline
        onColumnRename={onColumnRename}
      />,
    );

    fireEvent.doubleClick(screen.getByText("To Do"));
    const input = screen.getByLabelText("Column title") as HTMLInputElement;
    await user.clear(input);
    await user.type(input, "Backlog{Enter}");

    expect(onColumnRename).toHaveBeenCalledWith("todo", "Backlog");
    expect(screen.getByText("Backlog")).toBeInTheDocument();
  });

  it("onColumnRemove × button removes the column", async () => {
    const user = userEvent.setup();
    const onColumnRemove = vi.fn();
    render(
      <ControlledBoard
        initial={baseColumns()}
        onColumnRemove={onColumnRemove}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Remove column To Do/ }));
    expect(onColumnRemove).toHaveBeenCalledOnce();
    expect(screen.queryByText("To Do")).not.toBeInTheDocument();
  });

  it("renders WIP badge with count / limit when showWipBadge and wipLimit set", () => {
    const cols: KanbanColumn[] = [
      {
        id: "todo",
        title: "To Do",
        cards: [
          { id: "c1", content: "A" },
          { id: "c2", content: "B" },
        ],
        wipLimit: 3,
      },
    ];
    const { container } = render(
      <ControlledBoard initial={cols} showWipBadge />,
    );
    expect(within(container).getByText("2 / 3")).toBeInTheDocument();
  });

  it("renders card priority via data-priority attribute", () => {
    const cols: KanbanColumn[] = [
      {
        id: "todo",
        title: "To Do",
        cards: [{ id: "c1", content: "Urgent task", priority: "urgent" }],
      },
    ];
    const { container } = render(<ControlledBoard initial={cols} />);
    const card = container.querySelector(".rkb-card[data-priority='urgent']");
    expect(card).not.toBeNull();
  });
});
