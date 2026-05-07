import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TableStyled } from "./TableStyled";
import { renderHook, act } from "@testing-library/react";
import { useTable } from "../useTable";
import type { ColumnDef } from "../useTable";

type Row = Record<string, unknown> & {
  id: number;
  name: string;
  dept: string;
  amount: number;
};

const rows: Row[] = [
  { id: 1, name: "Alice", dept: "Eng", amount: 50 },
  { id: 2, name: "Bob", dept: "Mktg", amount: 30 },
  { id: 3, name: "Charlie", dept: "Eng", amount: 80 },
  { id: 4, name: "Dana", dept: "Mktg", amount: 20 },
];

const baseCols: ColumnDef<Row>[] = [
  { key: "name", header: "Name" },
  { key: "dept", header: "Dept" },
  { key: "amount", header: "Amount" },
];

// ---------------------------------------------------------------------------
// 1. groupBy — hook
// ---------------------------------------------------------------------------
describe("useTable — groupBy", () => {
  it("returns groups when groupBy is set", () => {
    const { result } = renderHook(() =>
      useTable({ data: rows, columns: baseCols, groupBy: "dept" }),
    );
    expect(result.current.groups.length).toBe(2);
    const depts = result.current.groups.map((g) => g.key);
    expect(depts).toContain("Eng");
    expect(depts).toContain("Mktg");
  });

  it("each group contains the right rows", () => {
    const { result } = renderHook(() =>
      useTable({ data: rows, columns: baseCols, groupBy: "dept" }),
    );
    const eng = result.current.groups.find((g) => g.key === "Eng")!;
    expect(eng.rows).toHaveLength(2);
  });

  it("returns empty groups when groupBy is not set", () => {
    const { result } = renderHook(() =>
      useTable({ data: rows, columns: baseCols }),
    );
    expect(result.current.groups).toHaveLength(0);
  });

  it("toggleGroupExpanded flips expanded state", () => {
    const { result } = renderHook(() =>
      useTable({ data: rows, columns: baseCols, groupBy: "dept" }),
    );
    act(() => result.current.toggleGroupExpanded("Eng"));
    expect(result.current.groupExpanded["Eng"]).toBe(false);
    act(() => result.current.toggleGroupExpanded("Eng"));
    expect(result.current.groupExpanded["Eng"]).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. groupBy — TableStyled rendering
// ---------------------------------------------------------------------------
describe("TableStyled — groupBy rendering", () => {
  it("renders group header rows", () => {
    render(<TableStyled data={rows} columns={baseCols} groupBy="dept" />);
    const engEls = screen.getAllByText(/Eng/);
    const mktgEls = screen.getAllByText(/Mktg/);
    expect(engEls.length).toBeGreaterThan(0);
    expect(mktgEls.length).toBeGreaterThan(0);
  });

  it("collapses a group when the header is clicked", async () => {
    const user = userEvent.setup();
    render(<TableStyled data={rows} columns={baseCols} groupBy="dept" />);
    const engBtn = screen.getByRole("button", { name: /Eng/ });
    await user.click(engBtn);
    expect(screen.queryByText("Alice")).toBeNull();
  });

  it("shows group row count badge", () => {
    render(<TableStyled data={rows} columns={baseCols} groupBy="dept" />);
    const badges = screen.getAllByText("(2)");
    expect(badges.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 3. Inline cell editing
// ---------------------------------------------------------------------------
describe("TableStyled — inline cell editing", () => {
  const editCols: ColumnDef<Row>[] = [
    { key: "name", header: "Name", editable: true },
    { key: "amount", header: "Amount" },
  ];

  it("double-clicking an editable cell activates the editor", async () => {
    const user = userEvent.setup();
    render(
      <TableStyled
        data={rows}
        columns={editCols}
        onCellEdit={vi.fn()}
      />,
    );
    const cell = screen.getByText("Alice");
    await user.dblClick(cell);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect((input as HTMLInputElement).value).toBe("Alice");
  });

  it("pressing Escape cancels the edit", async () => {
    const user = userEvent.setup();
    render(
      <TableStyled data={rows} columns={editCols} onCellEdit={vi.fn()} />,
    );
    await user.dblClick(screen.getByText("Alice"));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("pressing Enter commits and calls onCellEdit", async () => {
    const user = userEvent.setup();
    const onCellEdit = vi.fn();
    render(
      <TableStyled data={rows} columns={editCols} onCellEdit={onCellEdit} />,
    );
    await user.dblClick(screen.getByText("Bob"));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "Robert");
    await user.keyboard("{Enter}");
    expect(onCellEdit).toHaveBeenCalledWith("2", "name", "Robert");
  });

  it("non-editable columns do not show an editable span", () => {
    render(
      <TableStyled data={rows} columns={editCols} onCellEdit={vi.fn()} />,
    );
    const amounts = screen.getAllByText("50");
    expect(amounts[0]).not.toHaveClass("rtbl-cell-editable");
  });

  it("calling onCellEdit with a sync function works without pending state", async () => {
    const user = userEvent.setup();
    const onCellEdit = vi.fn();
    render(
      <TableStyled data={rows} columns={editCols} onCellEdit={onCellEdit} />,
    );
    await user.dblClick(screen.getByText("Alice"));
    await user.keyboard("{Enter}");
    await waitFor(() => expect(onCellEdit).toHaveBeenCalled());
  });
});

// ---------------------------------------------------------------------------
// 4. Bulk action toolbar
// ---------------------------------------------------------------------------
describe("TableStyled — bulkActions", () => {
  const selCols: ColumnDef<Row>[] = [
    { key: "name", header: "Name" },
    { key: "amount", header: "Amount" },
  ];

  it("does not show bulk bar when no rows are selected", () => {
    render(
      <TableStyled
        data={rows}
        columns={selCols}
        selectable="multi"
        bulkActions={[{ label: "Delete", onClick: vi.fn() }]}
      />,
    );
    expect(screen.queryByRole("toolbar", { name: "Bulk actions" })).toBeNull();
  });

  it("shows bulk bar with count when a row is selected", async () => {
    const user = userEvent.setup();
    render(
      <TableStyled
        data={rows}
        columns={selCols}
        selectable="multi"
        bulkActions={[{ label: "Archive", onClick: vi.fn() }]}
      />,
    );
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[1]!);
    expect(screen.getByRole("toolbar", { name: "Bulk actions" })).toBeInTheDocument();
    expect(screen.getByText("1 selected")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Archive" })).toBeInTheDocument();
  });

  it("calls action.onClick with selected rows when bulk button is clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <TableStyled
        data={rows}
        columns={selCols}
        selectable="multi"
        bulkActions={[{ label: "Export", onClick }]}
      />,
    );
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[1]!);
    await user.click(screen.getByRole("button", { name: "Export" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("danger tone renders danger class on bulk button", async () => {
    const user = userEvent.setup();
    render(
      <TableStyled
        data={rows}
        columns={selCols}
        selectable="multi"
        bulkActions={[{ label: "Delete", onClick: vi.fn(), tone: "danger" }]}
      />,
    );
    await user.click(screen.getAllByRole("checkbox")[1]!);
    const btn = screen.getByRole("button", { name: "Delete" });
    expect(btn).toHaveClass("rtbl-bulk-btn--danger");
  });
});
