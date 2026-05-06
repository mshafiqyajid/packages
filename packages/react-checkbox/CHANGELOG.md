# @mshafiqyajid/react-checkbox

## 0.3.0

### Minor Changes

- 07f4c47: Expanded API + motion across six packages, plus the command-palette hover-specificity fix and a docs sweep.

  **react-button**

  - New: `radius` (`"default" | "pill" | "sharp"`), `loadingText` (label swap during async), `pulse` (soft glow ring for CTAs), `ripple` (Material-style click ripple, default true).
  - Motion: ripple + pulse animation, `prefers-reduced-motion` respected.

  **react-checkbox**

  - New: `description` (helper text below label), `error` (renders message + danger tone), `card` (whole-row clickable bordered card), `required` (red asterisk on label).
  - Improved label-block layout. Error message + card variant get smooth fade-in / state transition.

  **react-text-input**

  - New: `label` (rendered above the input), `required`, `passwordToggle` (eye icon for `type="password"`), `loading` (spinner suffix), `success` (green border + check), `maxLength` + `showCount` (character counter), proper aria-labelledby/describedby wiring.
  - Motion: success check spring-in, error message fade-in, reveal button hover.

  **react-command-palette**

  - New: `placeholder`, `loading` + `loadingText`, `emptyState(query)` slot, `highlightMatches` (bolden matched chars in labels — default true).
  - Fix: hover state on a keyboard-active item no longer wins over the active style (white text on light hover bg → invisible). Specificity rebalanced.

  **react-stepper**

  - New: `clickableSteps` (allow jumping to visited / earlier steps), `progressBar` (thin bar at top showing completed / total), `optional` per step (renders "(optional)" next to label), `error` per step (danger ring + shake animation), `labels.optional`.
  - Connector + progress bar both animate smoothly on completion.

  **react-tree**

  - New: `searchQuery` (filter by case-insensitive label match — auto-expands matching branches), `highlightMatches` (bolden matched chars), `checkboxes` (render a checkbox per node alongside selection), `renderBadge`, `emptyState`.
  - All consumers can now wire a TextInput as a search filter and watch the tree narrow live.

  Docs:

  - Every Playground demo now uses our `PropPlayground` standard (was ad-hoc inline state for the new packages).
  - Every README + docs page props table updated to include the new props.

## 0.2.0

### Minor Changes

- 0802cf5: Three new foundational form primitives:

  - **`@mshafiqyajid/react-button`** — Headless button hook (`useButton`) + styled component. Variants: `solid` / `outline` / `ghost` / `link`. Tones: `neutral` / `primary` / `success` / `danger`. Three sizes. Async `onClick` (Promise drives the loading spinner, blocks further clicks). Icon slots (`iconLeft`, `iconRight`). Full-width `block` mode. ARIA + keyboard.
  - **`@mshafiqyajid/react-checkbox`** — Headless checkbox hook (`useCheckbox`) + styled component. Tri-state with `"indeterminate"` support (clicking from indeterminate → checked). Three sizes, four tones, label position, animated check + indeterminate icons. ARIA `aria-checked="mixed"` for indeterminate.
  - **`@mshafiqyajid/react-text-input`** — Headless text input hook (`useTextInput`) + styled component. Supports `text` / `email` / `password` / `url` / `search` / `tel`. Size + tone variants, prefix/suffix slots, optional clear (✕) button, hint + error messages, controlled or uncontrolled.

  All three follow the project's standard conventions: headless+styled split, motion polish (transitions on every interactive cue, `prefers-reduced-motion` respect), dark mode via `[data-theme="dark"]` ancestor only, fully tested with vitest.
