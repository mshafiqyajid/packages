---
"@mshafiqyajid/react-command-palette": minor
"@mshafiqyajid/react-stepper": minor
"@mshafiqyajid/react-tree": minor
---

Initial release of three new packages — bringing the published lineup to 32.

**`@mshafiqyajid/react-command-palette`** — ⌘K command palette. Headless `useCommandPalette` hook + styled component. Fuzzy match against `label` / `hint` / `keywords[]`, item grouping by section, recent-items section (localStorage-persisted), full keyboard navigation (Up/Down/Home/End/Enter/Esc), configurable global hotkey (⌘K / Ctrl+K). Portalled to body, modal-dialog-styled, animated pop-in. Zero dependencies.

**`@mshafiqyajid/react-stepper`** — multi-step wizard. Headless `useStepper` hook + styled component. Linear (`mode: "linear"`, default) or `"non-linear"` progression, validation gates (sync or async — `validate: () => boolean | string | Promise<...>`), horizontal or vertical layout, custom step indicator + content slots, controlled or uncontrolled active-step state. Built-in Back / Next / Finish footer with `isPending` awareness. Zero dependencies.

**`@mshafiqyajid/react-tree`** — headless tree view. `useTree` hook + styled component. Expand / collapse (controlled or uncontrolled), single or multi-select (`selectionMode`), async children loader (`loadChildren(node) => Promise<TreeNode[]>` triggers on first expand of nodes with `children: undefined`), full ARIA tree pattern (`role="tree"` / `treeitem`, `aria-expanded`, `aria-selected`, `aria-level`), keyboard navigation (← → ↑ ↓ Home End Enter), indent guide lines. Zero dependencies.

All three follow the existing project conventions:
- Headless hook + styled component split.
- `forwardRef` on the styled component.
- Data-attribute styling, package-prefixed CSS variables (`--rcmd-*`, `--rstep-*`, `--rtree-*`).
- Dark mode via `[data-theme="dark"]` ancestor only.
- `prefers-reduced-motion` disables transitions / animations.
- Tests next to source (Vitest + Testing Library), `forwardRef`-tested, ARIA-tested.
- Package exports: `.`, `./styled`, `./styles.css`, `./package.json`.
- Zero runtime dependencies.

Bundle sizes: command-palette ~5 KB, stepper ~4 KB, tree ~5 KB (gzipped). 21 tests pass across the three packages (6 + 8 + 7).

Docs site picks up sidebar entries, per-package docs pages, and interactive demos. See:

- https://docs.shafiqyajid.com/react/command-palette/
- https://docs.shafiqyajid.com/react/stepper/
- https://docs.shafiqyajid.com/react/tree/
