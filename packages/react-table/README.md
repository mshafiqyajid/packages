# @mshafiqyajid/react-table

**[Full docs →](https://docs.shafiqyajid.com/react/table/)**

Headless table hook and styled component for React. Sortable, filterable, paginated, selectable — fully typed, zero runtime dependencies.

## Install

```bash
npm install @mshafiqyajid/react-table
```

## What's new in 0.5.0 (next)

All additive — every prior API is unchanged.

- **`groupBy` row grouping.** `groupBy?: keyof T & string` groups rows by column value; each group gets a collapsible sticky header row with a row count badge. Pair with `groupExpanded` (controlled) + `onGroupExpandedChange`, or let it manage state internally. The hook returns `groups: GroupEntry<T>[]`, `groupExpanded`, and `toggleGroupExpanded`. New CSS classes `.rtbl-row--group-header`, `.rtbl-td--group-header`, `.rtbl-group-toggle`, `.rtbl-group-count`; CSS variable `--rtbl-group-header-bg`.
- **Inline cell editing.** `ColumnDef.editable?: boolean` enables double-click / Enter / F2 to edit in place. `ColumnDef.editor` accepts a custom render factory. `onCellEdit?: (rowId, colKey, value) => void | Promise<void>` on `TableStyled` receives every commit; async variants set `data-pending="true"` on the cell. New CSS classes `.rtbl-cell-editable`, `.rtbl-cell-editor`.
- **Bulk action toolbar.** `bulkActions?: Array<{ label, icon?, onClick, tone? }>` — when ≥1 row is selected a contextual bar appears above the table with a count badge and action buttons. `tone: "danger"` applies `.rtbl-bulk-btn--danger`. New CSS classes `.rtbl-bulk-bar`, `.rtbl-bulk-count`, `.rtbl-bulk-btn`, `.rtbl-bulk-btn--danger`; tokens `--rtbl-bulk-bar-bg`, `--rtbl-bulk-bar-border`, `--rtbl-bulk-bar-fg`. Reduced-motion and dark-mode variants included.

## What's new in 0.4.0

All additive — every prior API is unchanged.

- **Multi-column sort.** `multiSort` plus shift-click on a header appends a sort entry. `useTable` returns `sorts: SortBy[]`; existing `sortKey` / `sortDir` mirror `sorts[0]`. `defaultSort` now also accepts `SortBy[]`. New callback `onSortChange(sorts)`.
- **Column visibility.** `ColumnDef.hidden` (always off) and `defaultHidden` (initial state). Controlled `columnVisibility` + `onColumnVisibilityChange`. Hook returns `visibleColumns` and `toggleColumnVisibility`. `TableStyled` adds a `showColumnMenu` button in the toolbar.
- **CSV / JSON export.** `exportTableCSV<T>(opts)` and `exportTableJSON<T>(opts)` — both honor `accessor`, escape risky cells, and trigger a Blob download when `download: true`. `TableStyled` exposes `exportable?: boolean | ("csv" | "json")[]`; the buttons export the current filter+sort.
- **Selectable variants.** `selectable` now accepts `"single" | "multi" | "range"` (`true` is still equivalent to `"multi"`). Single-mode uses radios; range supports shift-click between an anchor and a target. New controlled prop `selectedIds` + `onSelectChange`.
- **Keyboard nav + ARIA grid.** Opt-in `ariaGrid` adds `role="grid"`, `aria-rowindex`, `aria-colindex`, plus arrow / Home / End / PageUp / PageDown navigation. Pair with `ariaLabel` or `ariaLabelledBy`.

## Headless hook

```tsx
import { useTable } from "@mshafiqyajid/react-table";

const {
  rows, sorts, toggleSort, page, pageCount, setPage,
  visibleColumns, toggleColumnVisibility, filteredRows,
} = useTable({
  data,
  columns,
  pageSize: 10,
  multiSort: true,
  storageKey: "users",        // persists sort/filter/page/columnVisibility
  manualPagination: true,     // server-driven; pageCount uses totalCount
  totalCount: 4218,
});

// Multi-sort modifier on a custom header:
<th onClick={(e) => toggleSort("salary", { append: e.shiftKey })}>Salary</th>;
```

### `ColumnDef<T>`

| Field | Type | Notes |
|---|---|---|
| `key` / `header` | `string` | Required |
| `accessor` | `(row) => unknown` | Nested or computed values |
| `sortable` / `filterable` | `boolean` | Per-column flags |
| `sortFn` | `(a, b, dir) => number` | Custom comparator |
| `filterFn` | `(row, query) => boolean` | Custom predicate |
| `aggregate` | `"sum" \| "avg" \| "min" \| "max" \| "count" \| (rows) => unknown` | Computes against filtered rows |
| `footer` | `ReactNode \| (rows, agg) => ReactNode` | Footer cell content |
| `hidden` / `defaultHidden` | `boolean` | Always-hidden / initial-hidden for the visibility menu |
| `align` / `sticky` / `width` / `render` | — | Existing |

## Styled component

```tsx
import { TableStyled } from "@mshafiqyajid/react-table/styled";
import "@mshafiqyajid/react-table/styles.css";

<TableStyled
  data={users}
  columns={columns}
  multiSort
  showColumnMenu
  exportable={["csv", "json"]}
  selectable="range"
  ariaGrid
  ariaLabel="Users"
  pageSizeOptions={[10, 25, 50]}
  showFooter
  showDensityToggle
  highlightMatches
  storageKey="users-table"
  renderEmpty={() => <CustomEmpty />}
  getRowProps={(row) => ({ "data-row-id": row.id })}
/>
```

### Selected props (0.4.0)

| Prop | Type | Description |
|---|---|---|
| `multiSort` | `boolean` | Enable shift-click to append sort entries |
| `onSortChange` | `(sorts: SortBy[]) => void` | Latest sort array |
| `showColumnMenu` | `boolean` | Toolbar "Columns" button + checklist popover |
| `columnVisibility` / `onColumnVisibilityChange` | `Record<string,bool>` / fn | Controlled visibility |
| `exportable` | `boolean \| ("csv" \| "json")[]` | Export buttons in the toolbar |
| `exportFilename` | `string` | Filename without extension. Default `"table"` |
| `selectable` | `boolean \| "single" \| "multi" \| "range"` | `true` continues to mean `"multi"` |
| `selectedIds` / `onSelectChange` | `string[]` / `(ids) => void` | Controlled selection |
| `ariaGrid` | `boolean` | `role="grid"` + arrow / Home / End / PageUp / PageDown |
| `ariaLabel` / `ariaLabelledBy` | `string` | Accessible name for the grid |

### Other props

| Prop | Type | Description |
|---|---|---|
| `pageSizeOptions` | `number[]` | Show a row-size selector |
| `showFooter` / `stickyFooter` | `boolean` | Render `<tfoot>` from `ColumnDef.footer` + `aggregate` |
| `showDensityToggle` | `boolean` | SM/MD/LG toolbar group |
| `highlightMatches` | `boolean` | Wraps matching substrings in `<mark>` |
| `renderEmpty` / `renderLoading` / `renderError` | `() => ReactNode` | Replace state rows |
| `error` / `errorText` / `onRetry` | `boolean` / `ReactNode` / `() => void` | Error state + retry |
| `getRowProps` / `getCellProps` | `(...) => partial props` | Per-row/-cell escape hatches |
| `manualSorting` / `manualFiltering` / `manualPagination` | `boolean` | Server-driven mode |
| `totalCount` | `number` | Drives `pageCount` under `manualPagination` |
| `storageKey` / `storage` | `string` / `Storage` | Persist sort/filter/page/visibility |
| `expandable` | `{ renderExpanded: (row) => ReactNode }` | Adds a chevron column; clicking toggles a detail panel |
| `defaultExpandedRowIds` / `expandedRowIds` / `onExpandedRowsChange` | `string[]` / `(ids) => void` | Uncontrolled / controlled expansion |
| `defaultColumnWidths` | `Record<string, number>` | Initial per-column widths in px |

## CSV / JSON export

```tsx
import { exportTableCSV, exportTableJSON } from "@mshafiqyajid/react-table";

// Pure helpers — return the serialized string. Pass `download: true` in the
// browser to trigger a Blob download.
const csv  = exportTableCSV({ rows, columns, filename: "users.csv", download: true });
const json = exportTableJSON({ rows, columns });
```

Both helpers honor `column.accessor`, escape risky CSV cells, and skip columns flagged `hidden`. The styled `exportable` prop wires these to the current filter+sort (`filteredRows`).

## Expandable rows

```tsx
<TableStyled
  data={users}
  columns={cols}
  expandable={{
    renderExpanded: (user) => (
      <div>
        <strong>{user.name}</strong>
        <p>{user.bio}</p>
      </div>
    ),
  }}
  defaultExpandedRowIds={["3"]}
/>
```

## Column resize

Set `resizable: true` on a column to enable drag-to-resize on the right edge of its header. Optional `minWidth` / `maxWidth` clamp (default 60 / 800 px).

```tsx
const cols: ColumnDef<User>[] = [
  { key: "name",  header: "Name",  resizable: true, minWidth: 120 },
  { key: "email", header: "Email", resizable: true },
];
```

## License

MIT
