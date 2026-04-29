---
"@mshafiqyajid/react-otp-input": major
---

Align with cross-package form-control standard.

**Breaking:**
- Slot heights bumped to match the form-control scale: sm 36→32px, md 44→40px, lg 52→48px. Override with `--rotp-slot-size-sm/md/lg`.
- Slot font-sizes adjusted for proportion: sm 16→15px, md 18→17px, lg 22.4→20px. Override with `--rotp-slot-font-size-sm/md/lg`.
- Border-radius scale unchanged (already 6/8/10) but is now exposed via `--rotp-radius-sm/md/lg` tokens.

**Added:**
- New props: `invalid` (mark invalid without inline error text), `required` (sets `aria-required` on the group), `style` passthrough on the root.
- Group element now exposes `data-invalid="true"` when `aria-invalid` is set.
- New CSS variables: `--rotp-slot-size-sm/md/lg`, `--rotp-radius-sm/md/lg`, `--rotp-slot-font-size-sm/md/lg`, `--rotp-gap-sm/md/lg`, `--rotp-error-border`, `--rotp-error-ring`.
- Invalid state now shows error border + error focus ring (driven by `data-invalid="true"`).
