# @mshafiqyajid/react-command-palette

## 0.2.1

### Patch Changes

- aa09804: Smooth motion polish across all four packages:

  - Shared motion tokens (`--*-duration-fast` / `--*-duration` / `--*-duration-slow` / `--*-ease` / `--*-ease-spring`) for consistent timing across every interactive surface.
  - Every hover, active, focus, and selection cue now has a transition. Reduced-motion users still get instant state changes.

  Per-package highlights:

  - **react-command-palette**: animated overlay backdrop blur, slower spring panel reveal, item hover/active gain a subtle lift + glow ring, group + empty-state fade-in.
  - **react-stepper** (also fixes layout bug): horizontal trigger now top-aligns the indicator with the title (was centered against the 2-line label block, pushing the circle below the title). Connector now animates a coloured fill on completion. Active indicator gains a soft glow ring. Content panel + error message fade-in on transition.
  - **react-tree**: rows fade-in when parents expand. Hover/selection use a small `translateX` lift. Chevron rotation now uses a spring ease. Selection-state icon scales gently.
  - **react-date-picker**: calendar pop-in with translate + scale. Day cells scale on hover/active. Selected day gains a soft shadow. Quick-pick chips lift on hover, time inputs use shared focus ring transition.

## 0.2.0

### Minor Changes

- 993dbe1: Initial release of three new packages — bringing the published lineup to 32.

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
