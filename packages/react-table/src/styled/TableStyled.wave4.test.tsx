import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TableStyled } from "./TableStyled";
import type { ColumnDef } from "../useTable";

type Row = Record<string, unknown> & {
  id: number;
  name: string;
  dept: string;
  salary: number;
};

const rows: Row[] = [
  { id: 1, name: "Alice", dept: "Eng", salary: 120 },
  { id: 2, name: "Bob", dept: "Eng", salary: 80 },
  { id: 3, name: "Carol", dept: "Sales", salary: 100 },
];

const cols: ColumnDef<Row>[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "dept", header: "Dept", sortable: true },
  { key: "salary", header: "Salary", sortable: true },
];

describe("TableStyled — column visibility menu", () => {
  it("opens a popover and toggles a column off", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TableStyled data={rows} columns={cols} showColumnMenu />,
    );
    const button = screen.getByRole("button", { name: "Columns" });
    await user.click(button);
    // Click Salary to hide it.
    await user.click(screen.getByLabelText("Salary"));
    const headers = Array.from(
      container.querySelectorAll(".rtbl-thead .rtbl-th-inner"),
    ).map((el) => el.textContent ?? "");
    expect(headers.some((h) => h.includes("Salary"))).toBe(false);
    expect(headers.some((h) => h.includes("Name"))).toBe(true);
    expect(headers.some((h) => h.includes("Dept"))).toBe(true);
  });
});

describe("TableStyled — multi-sort modifier", () => {
  it("shift-click on a header appends a sort entry when multiSort is true", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(
      <TableStyled
        data={rows}
        columns={cols}
        multiSort
        onSortChange={onSortChange}
      />,
    );
    await user.click(screen.getByText("Dept"));
    // Shift-click Salary -> appends.
    fireEvent.click(screen.getByText("Salary"), { shiftKey: true });
    const lastCall = onSortChange.mock.calls.at(-1)?.[0] as Array<{
      key: string;
      dir: string;
    }>;
    expect(lastCall).toEqual([
      { key: "dept", dir: "asc" },
      { key: "salary", dir: "asc" },
    ]);
  });
});

describe("TableStyled — exportable buttons", () => {
  beforeEach(() => {
    // jsdom doesn't fully implement URL.createObjectURL — stub the bits we use.
    Object.assign(URL, {
      createObjectURL: vi.fn(() => "blob:mock"),
      revokeObjectURL: vi.fn(),
    });
    // Suppress the JSDOM "navigation not implemented" noise from <a>.click().
    HTMLAnchorElement.prototype.click = vi.fn();
  });

  it("renders a CSV button when exportable={true}", () => {
    render(<TableStyled data={rows} columns={cols} exportable />);
    expect(screen.getByRole("button", { name: "Export as CSV" })).toBeInTheDocument();
  });

  it("renders both buttons when exportable={['csv','json']}", () => {
    render(
      <TableStyled data={rows} columns={cols} exportable={["csv", "json"]} />,
    );
    expect(screen.getByRole("button", { name: "Export as CSV" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export as JSON" })).toBeInTheDocument();
  });

  it("clicking the button invokes URL.createObjectURL (Blob download)", async () => {
    const user = userEvent.setup();
    render(<TableStyled data={rows} columns={cols} exportable />);
    await user.click(screen.getByRole("button", { name: "Export as CSV" }));
    expect(URL.createObjectURL).toHaveBeenCalled();
  });
});

describe("TableStyled — selectable single + range", () => {
  it("renders radio inputs in 'single' mode", () => {
    const { container } = render(
      <TableStyled data={rows} columns={cols} selectable="single" />,
    );
    const radios = container.querySelectorAll<HTMLInputElement>(
      'tbody input[type="radio"]',
    );
    expect(radios.length).toBe(rows.length);
  });
});

describe("TableStyled — ariaGrid", () => {
  it('adds role="grid" + aria-rowindex + aria-colindex when ariaGrid is true', () => {
    const { container } = render(
      <TableStyled data={rows} columns={cols} ariaGrid ariaLabel="Employees" />,
    );
    const table = container.querySelector("table") as HTMLTableElement;
    expect(table.getAttribute("role")).toBe("grid");
    expect(table.getAttribute("aria-label")).toBe("Employees");
    const headerRow = container.querySelector(".rtbl-thead .rtbl-tr");
    expect(headerRow?.getAttribute("aria-rowindex")).toBe("1");
    const dataRows = container.querySelectorAll(".rtbl-tbody .rtbl-tr-data");
    expect(dataRows[0]?.getAttribute("aria-rowindex")).toBe("2");
    const firstDataCell = dataRows[0]?.querySelector(".rtbl-td-data");
    expect(firstDataCell?.getAttribute("aria-colindex")).toBe("1");
  });

  it("ArrowDown moves focus to the next row's first cell", () => {
    const { container } = render(
      <TableStyled data={rows} columns={cols} ariaGrid />,
    );
    const firstCell = container.querySelector(
      ".rtbl-tbody .rtbl-tr-data .rtbl-td-data",
    ) as HTMLTableCellElement;
    firstCell.focus();
    fireEvent.keyDown(firstCell, { key: "ArrowDown" });
    // After the keydown we update internal state — the second-row cell now has data-focused.
    const secondRow = container.querySelectorAll(
      ".rtbl-tbody .rtbl-tr-data",
    )[1] as HTMLTableRowElement;
    const secondCell = secondRow.querySelector(
      ".rtbl-td-data",
    ) as HTMLTableCellElement;
    expect(secondCell.getAttribute("data-focused")).toBe("true");
  });
});
