# @mshafiqyajid/react-breadcrumb

Breadcrumb navigation with collapsible items and customizable separators.

**[Full docs →](https://docs.shafiqyajid.com/react/breadcrumb/)**

## Install

```bash
npm install @mshafiqyajid/react-breadcrumb
```

## Quick start

```tsx
import { BreadcrumbStyled } from "@mshafiqyajid/react-breadcrumb/styled";
import "@mshafiqyajid/react-breadcrumb/styles.css";

const items = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Smartphones" },
];

<BreadcrumbStyled items={items} />
<BreadcrumbStyled items={items} separator="slash" />
<BreadcrumbStyled items={items} maxItems={2} />
```

## Headless

```tsx
import { useBreadcrumb } from "@mshafiqyajid/react-breadcrumb";

function MyBreadcrumb({ items }) {
  const { navProps, visibleItems, expand, isCollapsed, getItemProps } = useBreadcrumb({
    items,
    maxItems: 3,
  });

  return (
    <nav {...navProps}>
      <ol>
        {visibleItems.map(({ item, originalIndex, isEllipsis }, i) =>
          isEllipsis ? (
            <li key="e"><button onClick={expand}>…</button></li>
          ) : (
            <li key={originalIndex}>
              {item.href ? <a href={item.href}>{item.label}</a> : <span>{item.label}</span>}
            </li>
          )
        )}
      </ol>
    </nav>
  );
}
```

## License

MIT
