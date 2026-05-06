---
"@mshafiqyajid/react-toast": patch
"@mshafiqyajid/react-tabs": patch
"@mshafiqyajid/react-modal": patch
"@mshafiqyajid/react-popover": patch
"@mshafiqyajid/react-tooltip": patch
"@mshafiqyajid/react-slider": patch
"@mshafiqyajid/react-segmented-control": patch
"@mshafiqyajid/react-tag-input": patch
"@mshafiqyajid/react-dropdown-menu": patch
---

docs: republish to land "What's new" sections on npm.

Each of these packages shipped new features in their last release but the npm-bundled README didn't yet mention them — that left the package pages on npm describing the older API. This patch re-publishes them with a "What's new in vX.Y.Z" section appended so the npm pages match the current docs site.

What each section covers:

- **react-toast 0.3.0** — swipe-to-dismiss, undo countdown ring, pause-on-hover, `action.variant`, draggable region.
- **react-tabs 0.3.0** — closeable tabs (×), scrollable overflow, sortable drag-to-reorder, keyboard typeahead, `scrollActiveIntoView`.
- **react-modal 0.3.0** — stacked modals, `transition` variants, `confirm()` utility, `swipeToDismiss`, `closeOnSubmit`.
- **react-popover 0.3.0** — virtual element anchoring, `--rpv-arrow-bg`, `returnFocus`, `closeWhenAnchorHidden`, `modal` (focus trap).
- **react-tooltip 0.3.0** — `sticky`, `--rtt-arrow-bg`, group keyboard nav, `header`/`footer` slots, `longPressDelay`.
- **react-slider 0.3.0** — `showValueOnInteraction`, `formatValue`, labelled `marks`, `orientation`, `onCommit`.
- **react-segmented-control 0.3.0** — per-segment `badge`, `scrollable`, `equalize`, `href` per option. **Plus a CSS fix:** badged segments now get extra horizontal padding and the track widens its inter-segment gap to 6 px when any segment has a badge — fixes the "Pending 12Archived" cramped look from the original 0.3.0 release.
- **react-tag-input 1.2.0** — async `loadOptions`, `colorize`, `tagActions`, `onReorder`, spreadsheet TSV paste.
- **react-dropdown-menu 0.3.x** — nested submenus + 0.3.1 submenu padding fix.

No code changes — README-only.
