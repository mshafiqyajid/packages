# @mshafiqyajid/react-table

Headless table hook and styled component for React. Sortable, filterable, paginated, selectable — fully typed with zero runtime dependencies.

## Install

```bash
npm install @mshafiqyajid/react-table
```

## Headless hook

```tsx
import { useTable } from "@mshafiqyajid/react-table";

const { rows, toggleSort, sortKey, sortDir, page, pageCount, setPage } = useTable({
  data,
  columns,
  pageSize: 10,
});
```

## Styled component

```tsx
import { TableStyled } from "@mshafiqyajid/react-table/styled";
import "@mshafiqyajid/react-table/styles.css";

<TableStyled
  data={data}
  columns={columns}
  size="md"
  tone="neutral"
  striped
  hoverable
  bordered
/>
```

## Links

- [Docs](https://docs.shafiqyajid.com/react/table/)
- [GitHub](https://github.com/mshafiqyajid/packages/tree/main/packages/react-table)

## License

MIT
