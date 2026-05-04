# @mshafiqyajid/react-table

**[Full docs →](https://docs.shafiqyajid.com/react/table/)**

Headless table hook and styled component for React. Sortable, filterable, paginated, selectable — fully typed, zero runtime dependencies.

## Install

```bash
npm install @mshafiqyajid/react-table
```

## Headless hook

```tsx
import { useTable } from "@mshafiqyajid/react-table";

const { rows, toggleSort, page, pageCount, setPage, aggregates, filteredRows } = useTable({
  data,
  columns,
  pageSize: 10,
  storageKey: "users",        // persists sort/filter/page
  manualPagination: true,     // server-driven; pageCount uses totalCount
  totalCount: 4218,
});
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
| `align` / `sticky` / `width` / `render` | — | Existing |

## Styled component

```tsx
import { TableStyled } from "@mshafiqyajid/react-table/styled";
import "@mshafiqyajid/react-table/styles.css";

<TableStyled
  data={users}
  columns={columns}
  pageSizeOptions={[10, 25, 50]}
  showFooter
  stickyFooter
  showDensityToggle
  highlightMatches
  storageKey="users-table"
  renderEmpty={() => <CustomEmpty />}
  getRowProps={(row) => ({ "data-row-id": row.id })}
/>
```

### Selected new props

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
| `storageKey` / `storage` | `string` / `Storage` | Persist sort/filter/page |

## License

MIT
