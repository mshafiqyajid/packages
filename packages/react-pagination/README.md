# @mshafiqyajid/react-pagination

Pagination control with ellipsis, page size selector, and full keyboard support.

**[Full docs →](https://docs.shafiqyajid.com/react/pagination/)**

## Install

```bash
npm install @mshafiqyajid/react-pagination
```

## Quick start

```tsx
import { PaginationStyled } from "@mshafiqyajid/react-pagination/styled";
import "@mshafiqyajid/react-pagination/styles.css";

function App() {
  const [page, setPage] = useState(1);
  return (
    <PaginationStyled
      page={page}
      onChange={setPage}
      total={200}
      pageSize={10}
    />
  );
}
```

## Headless

```tsx
import { usePagination } from "@mshafiqyajid/react-pagination";

function MyPagination() {
  const { page, pages, hasPrev, hasNext, prev, next, getPageProps } = usePagination({
    total: 200,
    pageSize: 10,
  });

  return (
    <nav role="navigation" aria-label="Pagination">
      <button onClick={prev} disabled={!hasPrev}>Previous</button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e-${i}`}>…</span>
        ) : (
          <button key={p} {...getPageProps(p)}>{p}</button>
        )
      )}
      <button onClick={next} disabled={!hasNext}>Next</button>
    </nav>
  );
}
```

## License

MIT
