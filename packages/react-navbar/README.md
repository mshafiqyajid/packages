# @mshafiqyajid/react-navbar

Responsive navigation bar with sticky scroll, transparent-on-top, mobile menu, and full keyboard support.

**[Full docs →](https://docs.shafiqyajid.com/react/navbar/)**

## Install

```bash
npm install @mshafiqyajid/react-navbar
```

## Quick start

```tsx
import { NavbarStyled } from "@mshafiqyajid/react-navbar/styled";
import "@mshafiqyajid/react-navbar/styles.css";

const navItems = [
  { label: "Home", href: "/", active: true },
  { label: "Docs", href: "/docs" },
  { label: "Pricing", href: "/pricing" },
];

<NavbarStyled
  brand={<strong>Acme</strong>}
  items={navItems}
  actions={<button>Sign in</button>}
/>
```

## Sticky + transparent on top

```tsx
<NavbarStyled
  brand={<strong>Acme</strong>}
  items={navItems}
  sticky
  transparentOnTop
  scrollThreshold={16}
/>
```

## Variants

```tsx
<NavbarStyled items={navItems} variant="default" />    {/* default */}
<NavbarStyled items={navItems} variant="bordered" />
<NavbarStyled items={navItems} variant="filled" />
<NavbarStyled items={navItems} variant="transparent" />
```

## Sizes

```tsx
<NavbarStyled items={navItems} size="sm" />
<NavbarStyled items={navItems} size="md" />   {/* default */}
<NavbarStyled items={navItems} size="lg" />
```

## Headless hook

```tsx
import { useNavbar } from "@mshafiqyajid/react-navbar";

const { navProps, menuProps, toggleProps, isMenuOpen, isScrolled } = useNavbar({
  scrollThreshold: 16,
  onMenuToggle: (open) => console.log("menu:", open),
});

<nav {...navProps}>
  <div>
    <a href="/">Brand</a>
    <button {...toggleProps} aria-label="Toggle menu">☰</button>
  </div>
  <div {...menuProps} hidden={!isMenuOpen}>
    <a href="/docs">Docs</a>
  </div>
</nav>
```

## Sub-components (headless wrappers)

```tsx
import { NavbarStyled } from "@mshafiqyajid/react-navbar/styled";

<NavbarStyled brand={<NavbarStyled.Brand>Acme</NavbarStyled.Brand>}>
  <NavbarStyled.Items>
    <NavbarStyled.Item href="/docs">Docs</NavbarStyled.Item>
    <NavbarStyled.Item href="/pricing" active>Pricing</NavbarStyled.Item>
    <NavbarStyled.Item href="/old" disabled>Disabled</NavbarStyled.Item>
  </NavbarStyled.Items>
  <NavbarStyled.Actions>
    <button>Sign in</button>
  </NavbarStyled.Actions>
</NavbarStyled>
```

## API

### NavbarItem shape

| Field | Type | Description |
|-------|------|-------------|
| `label` | `string` | Link text |
| `href` | `string` | Link target |
| `active?` | `boolean` | Highlight as current page |
| `disabled?` | `boolean` | Prevent interaction |
| `icon?` | `ReactNode` | Optional icon before label |

### NavbarStyled props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `brand` | `ReactNode` | — | Brand logo / wordmark |
| `items` | `NavbarItem[]` | — | Navigation links |
| `actions` | `ReactNode` | — | Right-side actions (buttons, avatar) |
| `variant` | `"default" \| "bordered" \| "filled" \| "transparent"` | `"default"` | Visual style |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Height scale |
| `sticky` | `boolean` | `false` | Stick to top of viewport while scrolling |
| `transparentOnTop` | `boolean` | `false` | Transparent background when at top of page |
| `scrollThreshold` | `number` | `16` | px scrolled before `isScrolled` becomes true |
| `mobileBreakpoint` | `number` | `768` | px width at which mobile menu appears |
| `onMenuToggle` | `(open: boolean) => void` | — | Called when mobile menu opens or closes |
| `className` | `string` | — | Extra class on `<nav>` |
| `style` | `CSSProperties` | — | Inline style on `<nav>` |
| `ref` | `Ref<HTMLElement>` | — | Forwarded to `<nav>` |

### useNavbar options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `scrollThreshold` | `number` | `16` | px before `isScrolled` triggers |
| `onMenuToggle` | `(open: boolean) => void` | — | Menu open/close callback |

### useNavbar return value

| Key | Type | Description |
|-----|------|-------------|
| `navProps` | `object` | Spread onto `<nav>` (role, aria-label) |
| `menuProps` | `object` | Spread onto the menu container (id) |
| `toggleProps` | `object` | Spread onto the hamburger button |
| `isMenuOpen` | `boolean` | Current mobile menu state |
| `isScrolled` | `boolean` | Whether page is scrolled past threshold |

## Keyboard support

| Key | Behaviour |
|-----|-----------|
| `Tab` | Standard focus order through all nav items |
| `Escape` | Closes mobile menu when open |

## Accessibility

- `<nav role="navigation" aria-label="Main navigation">`
- Hamburger button: `aria-expanded`, `aria-controls`
- Disabled items: `aria-disabled="true"`, `tabindex="-1"`
- Active items: `aria-current="page"`
