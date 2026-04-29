---
"@mshafiqyajid/react-color-input": major
---

Align with cross-package form-control standard.

**Breaking:**
- Field heights bumped: sm 30→32px, md 36→40px, lg 42→48px. Override with `--rci-h-sm/md/lg`.
- Inner swatch sized up to keep proportion: sm 22 (unchanged), md 26→28, lg 30→34. Override with `--rci-swatch-sm/md/lg`.
- Default sm font-size now 13px (was 12px). md (14) and lg (16) unchanged.
- Border-radius now scales with size: 6 / 8 / 10 px (was a flat 6 px). Override with `--rci-radius-sm/md/lg`.
- Disabled opacity changed from 0.7 to 0.55 (matches other form inputs).

**Added:**
- New props: `readOnly`, `required`, `invalid`, `id`, `name`, `autoFocus`, `placeholder`, `style` passthrough.
- Root now exposes `data-size`, `data-tone`, `data-disabled`, `data-readonly`, `data-invalid` attributes for CSS targeting.
- Hover border darkens to `--rci-border-hover` when not disabled / readonly / focused.
- New CSS variables: `--rci-radius-sm/md/lg`, `--rci-border-hover`, `--rci-bg-readonly`, `--rci-shadow-focus`, `--rci-error-border`, `--rci-error-shadow`, `--rci-popover-radius`.
- `aria-required` is now emitted when `required` is set.
