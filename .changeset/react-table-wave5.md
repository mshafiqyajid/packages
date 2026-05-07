---
"@mshafiqyajid/react-table": minor
---

Wave 5 additive features for `react-table` — no breaking changes.

- **`groupBy` row grouping.** `groupBy?: keyof T & string` on `useTable` and `TableStyled`. Groups rows by the distinct values of the chosen column; each group gets a collapsible header row. `groupExpanded?: Record<string, boolean>` (controlled) + `onGroupExpandedChange` manage expand/collapse state. The hook returns `groups: GroupEntry<T>[]` (each entry has `key`, `rows`, and optional `aggregate` map), `groupExpanded`, and `toggleGroupExpanded`. `TableStyled` renders sticky group-header rows with new CSS class `.rtbl-row--group-header`, `.rtbl-td--group-header`, `.rtbl-group-toggle`, `.rtbl-group-count`, and the var `--rtbl-group-header-bg` (dark-mode variant included).

- **Inline cell editing.** `ColumnDef.editable?: boolean` activates double-click / F2 / Enter to edit the cell in place. `ColumnDef.editor?: (row, value, onCommit, onCancel) => ReactNode` overrides the default `<input>`. The default editor commits on Enter/blur and cancels on Escape. `onCellEdit?: (rowId, columnKey, value) => void | Promise<void>` on `useTable` / `TableStyled` receives every commit; async variants set `data-pending="true"` on the cell while the promise is in flight. New CSS classes `.rtbl-cell-editable`, `.rtbl-cell-editor` (with focus ring). Columns without `editable` are unchanged.

- **Bulk action toolbar.** `bulkActions?: Array<{ label, icon?, onClick, tone? }>` on `TableStyled`. When ≥1 row is selected and `bulkActions` is provided, a contextual bar appears above the table with a count badge and the action buttons. `tone: "danger"` renders `.rtbl-bulk-btn--danger`. New CSS classes `.rtbl-bulk-bar`, `.rtbl-bulk-count`, `.rtbl-bulk-btn`, `.rtbl-bulk-btn-icon`, `.rtbl-bulk-btn--danger`. Tokens `--rtbl-bulk-bar-bg`, `--rtbl-bulk-bar-border`, `--rtbl-bulk-bar-fg`, `--rtbl-bulk-btn-danger-fg`, `--rtbl-bulk-btn-danger-bg` with dark-mode variants. Entry/exit animation respects `prefers-reduced-motion`.
