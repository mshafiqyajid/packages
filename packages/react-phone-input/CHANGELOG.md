# @mshafiqyajid/react-phone-input

## 1.0.0

### Major Changes

- 873a373: Align with cross-package form-control standard.

  **Breaking:**

  - Default sm font-size is now 13px (was 12.8px). md (14px) and lg (16px) unchanged.
  - Border-radius now scales with size: 6 / 8 / 10 px (was a flat 8 px). Override via `--rphi-radius-sm/md/lg`.
  - Heights unchanged at 32 / 40 / 48 px.

  **Added:**

  - New props: `invalid`, `required`, `readOnly`, `id`, `name`, `autoFocus`, `placeholder`, `style` passthrough.
  - Root now exposes `data-invalid` and `data-readonly` attributes.
  - New CSS variables: `--rphi-radius-sm/md/lg`, `--rphi-border-hover`, `--rphi-bg-readonly`, `--rphi-shadow-focus`, `--rphi-error-border`, `--rphi-error-shadow`, `--rphi-ease`. Old `--rphi-radius` continues to work as a fallback.
  - Hover border darkens to `--rphi-border-hover` when not disabled / readonly / focused.
  - `aria-required` is now emitted when `required` is set.

## 0.1.0

### Minor Changes

- 0aecafe: Initial release of 10 new packages: date-picker (single/range calendar), file-upload (drag-and-drop), number-input (decimal/currency/percent), phone-input (country selector + dial code), color-input (hex/rgb/hsl picker), tag-input (chips + autocomplete), rich-text (contentEditable WYSIWYG), table (sort/filter/paginate), chart (SVG bar/line/pie), kanban (HTML5 DnD board).
