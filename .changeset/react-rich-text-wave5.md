---
"@mshafiqyajid/react-rich-text": minor
---

Wave 5 additive features for `react-rich-text` — no breaking changes.

- **Undo/redo shortcuts and toolbar items.** `"undo"` and `"redo"` added to the `ToolbarItem` union and to `DEFAULT_SHORTCUTS` (`Mod+Z` / `Mod+Shift+Z`). Wire them via `toolbarItems={["undo","redo"]}` or rely on the keyboard shortcut map.

- **`renderToolbar` slot.** `renderToolbar?: (args: RenderToolbarArgs) => ReactNode` replaces the built-in toolbar when set. Receives `execCommand`, `queryCommandState`, format flags (`isBold`, `isItalic`, `isUnderline`, `isStrikethrough`), the current `html`, and `disabled`. Existing `showToolbar` / `toolbarItems` keep working when `renderToolbar` is omitted.

- **`renderFooter` slot.** `renderFooter?: (counts: { words: number; chars: number }) => ReactNode` replaces the word-count footer row when set. The existing `wordCount` prop keeps working when `renderFooter` is omitted.

- **`code` toolbar item.** `"code"` added to the `ToolbarItem` union. Wraps the current selection in `<code class="rrt2-inline-code">`. New CSS class `.rrt2-inline-code` styles the element in a monospace font with a subtle background. New CSS class `.rrt2-toolbar__btn[data-cmd="code"]` adjusts the button font. Trigger via `toolbarItems={["code"]}`.

- **`placeholderEachLine` prop.** When set, shows the placeholder text on every empty `<p>` or `<div>` block via `:empty::before` CSS. Uses the `--rrt2-placeholder-fg` variable and sets a CSS custom property (`--rrt2-each-line-placeholder`) on the editor wrap so the selector can pull the value without an attribute on each child.

- **`onSelectionChange` callback and `getSelection` on the hook.** `onSelectionChange?: (sel: { range: Range | null; text: string }) => void` fires on every `selectionchange` event inside the editor. `useRichText` now returns `getSelection: () => { range: Range | null; text: string }`. Both are JSDOM-safe (guarded against undefined `window`/`document`).
