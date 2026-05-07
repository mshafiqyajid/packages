---
"@mshafiqyajid/react-tag-input": minor
---

Add drag-to-reorder (`reorderable`), edit-in-place (double-click), async `loadSuggestions`, and motion animations to `react-tag-input`.

- `reorderable?: boolean` — HTML5 drag-to-reorder with drop indicator and spring animation on settle. `onReorder` fires on drop. Legacy `sortable` prop preserved.
- Edit-in-place — double-click any tag to open an inline `<input>`. Enter commits, Escape cancels, blur commits. Blocked when `disabled` or `readOnly`. CSS class `rti-tag--editing`.
- `loadSuggestions?: (query: string) => Promise<string[]>` — async drop-in for static `suggestions`. Debounced 300 ms, cancellable via `AbortController`. Animated spinner while loading. Props `debounceMs` and `loadingText` apply.
- Motion — tags scale in (`0 → 1.08 → 1`) on add and scale + fade out on remove. All animations respect `prefers-reduced-motion`.
