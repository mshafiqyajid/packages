import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TableStyled } from "./TableStyled";
import type { ColumnDef } from "../useTable";

type Row = Record<string, unknown> & {
  id: number;
  name: string;
  amount: number;
};

const rows: Row[] = [
  { id: 1, name: "Alice", amount: 50 },
  { id: 2, name: "Bob", amount: 30 },
  { id: 3, name: "Charlie", amount: 80 },
];

const baseCols: ColumnDef<Row>[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "amount", header: "Amount", sortable: true },
];

describe("TableStyled new behavior", () => {
  it("renders empty render slot when no rows", () => {
    render(
      <TableStyled
        data={[]}
        columns={baseCols}
        renderEmpty={() => <span>Custom empty</span>}
      />,
    );
    expect(screen.getByText("Custom empty")).toBeInTheDocument();
  });

  it("renders error slot with retry callback", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <TableStyled
        data={rows}
        columns={baseCols}
        error
        onRetry={onRetry}
        renderError={(retry) => (
          <button type="button" onClick={retry}>
            Retry now
          </button>
        )}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Retry now" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("renders footer row using ColumnDef.footer + aggregate", () => {
    const cols: ColumnDef<Row>[] = [
      { key: "name", header: "Name", footer: "Total" },
      { key: "amount", header: "Amount", aggregate: "sum" },
    ];
    const { container } = render(
      <TableStyled data={rows} columns={cols} showFooter />,
    );
    const tfoot = container.querySelector(".rtbl-tfoot");
    expect(tfoot).not.toBeNull();
    expect(within(tfoot as HTMLElement).getByText("Total")).toBeInTheDocument();
    expect(within(tfoot as HTMLElement).getByText("160")).toBeInTheDocument();
  });

  it("page-size selector switches pageSize", async () => {
    const user = userEvent.setup();
    const big: Row[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      name: `R${i}`,
      amount: i,
    }));
    const { container } = render(
      <TableStyled data={big} columns={baseCols} pageSize={10} pageSizeOptions={[10, 25]} />,
    );
    const select = container.querySelector(".rtbl-page-size-select") as HTMLSelectElement;
    expect(select).not.toBeNull();
    expect(container.querySelectorAll(".rtbl-tbody .rtbl-tr").length).toBe(10);
    await user.selectOptions(select, "25");
    expect(container.querySelectorAll(".rtbl-tbody .rtbl-tr").length).toBe(25);
  });

  it("density toggle switches data-size", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TableStyled data={rows} columns={baseCols} showDensityToggle />,
    );
    const root = container.querySelector(".rtbl-root");
    expect(root?.getAttribute("data-size")).toBe("md");
    await user.click(screen.getByRole("button", { name: "SM" }));
    expect(root?.getAttribute("data-size")).toBe("sm");
  });

  it("highlightMatches wraps matching text in <mark>", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TableStyled data={rows} columns={baseCols} highlightMatches />,
    );
    const filter = container.querySelector(".rtbl-filter") as HTMLInputElement;
    await user.type(filter, "ali");
    const marks = container.querySelectorAll(".rtbl-mark");
    expect(marks.length).toBeGreaterThan(0);
    expect((marks[0] as HTMLElement).textContent?.toLowerCase()).toBe("ali");
  });

  it("getRowProps merges custom attributes onto <tr>", () => {
    const { container } = render(
      <TableStyled
        data={rows}
        columns={baseCols}
        getRowProps={(row) => ({
          "data-row-name": String((row as Row).name),
        })}
      />,
    );
    const tr = container.querySelector("tbody tr[data-row-name='Alice']");
    expect(tr).not.toBeNull();
  });

  it("getCellProps merges custom attributes onto <td>", () => {
    const { container } = render(
      <TableStyled
        data={rows}
        columns={baseCols}
        getCellProps={(_row, col) => ({
          "data-col-key": col.key,
        })}
      />,
    );
    const cells = container.querySelectorAll("td[data-col-key]");
    expect(cells.length).toBeGreaterThan(0);
  });

  it("accessor displays computed value in cell", () => {
    type Nested = Record<string, unknown> & { user: { name: string } };
    const data: Nested[] = [{ user: { name: "Z" } }];
    const cols: ColumnDef<Nested>[] = [
      {
        key: "userName",
        header: "User",
        accessor: (r) => r.user.name,
      },
    ];
    render(<TableStyled data={data} columns={cols} />);
    expect(screen.getByText("Z")).toBeInTheDocument();
  });
});

describe("TableStyled existing behavior still works", () => {
  it("toggles sort when clicking a sortable header", async () => {
    const user = userEvent.setup();
    const { container } = render(<TableStyled data={rows} columns={baseCols} />);
    fireEvent.click(screen.getByText("Amount"));
    const cells = Array.from(
      container.querySelectorAll("tbody tr td:nth-child(2)"),
    ).map((el) => el.textContent);
    expect(cells).toEqual(["30", "50", "80"]);
    await user.click(screen.getByText("Amount"));
    const cellsDesc = Array.from(
      container.querySelectorAll("tbody tr td:nth-child(2)"),
    ).map((el) => el.textContent);
    expect(cellsDesc).toEqual(["80", "50", "30"]);
  });
});
