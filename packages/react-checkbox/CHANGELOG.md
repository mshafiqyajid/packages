# @mshafiqyajid/react-checkbox

## 0.2.0

### Minor Changes

- 0802cf5: Three new foundational form primitives:

  - **`@mshafiqyajid/react-button`** — Headless button hook (`useButton`) + styled component. Variants: `solid` / `outline` / `ghost` / `link`. Tones: `neutral` / `primary` / `success` / `danger`. Three sizes. Async `onClick` (Promise drives the loading spinner, blocks further clicks). Icon slots (`iconLeft`, `iconRight`). Full-width `block` mode. ARIA + keyboard.
  - **`@mshafiqyajid/react-checkbox`** — Headless checkbox hook (`useCheckbox`) + styled component. Tri-state with `"indeterminate"` support (clicking from indeterminate → checked). Three sizes, four tones, label position, animated check + indeterminate icons. ARIA `aria-checked="mixed"` for indeterminate.
  - **`@mshafiqyajid/react-text-input`** — Headless text input hook (`useTextInput`) + styled component. Supports `text` / `email` / `password` / `url` / `search` / `tel`. Size + tone variants, prefix/suffix slots, optional clear (✕) button, hint + error messages, controlled or uncontrolled.

  All three follow the project's standard conventions: headless+styled split, motion polish (transitions on every interactive cue, `prefers-reduced-motion` respect), dark mode via `[data-theme="dark"]` ancestor only, fully tested with vitest.
