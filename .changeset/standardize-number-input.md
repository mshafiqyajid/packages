---
"@mshafiqyajid/react-number-input": major
---

Align with cross-package form-control standard.

**Breaking:**
- Default md font-size is now 14px (was 15px); lg is 16px (was 17px). sm unchanged at 13px.
- Heights unchanged at 32 / 40 / 48 px.
- Border-radius now scales with size: 6 / 8 / 10 px (was a flat 8 px). Override via `--rni-radius-sm/md/lg`.
- The root data-attribute for invalid state is now `data-invalid="true"` (was `data-error="true"`). Custom CSS targeting the old attribute must be updated.

**Added:**
- New props: `invalid`, `required`, `name`, `autoFocus`, `style` passthrough.
- `aria-required` is now emitted when `required` is set.
- New CSS variables: `--rni-radius-sm`, `--rni-radius-md`, `--rni-radius-lg`, `--rni-border-hover`, `--rni-bg-readonly`. The old single `--rni-radius` still works as a fallback.
- Hover border darkens to `--rni-border-hover` when not disabled / readonly / focused.
