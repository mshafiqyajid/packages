# @mshafiqyajid/react-date-picker

## 0.2.0

### Minor Changes

- 26f7c8f: Major feature pass on react-date-picker (non-breaking):

  - **`numberOfMonths` (1 | 2 | 3)** — multi-month grid in the popover. Pair with `pagedBy="all"` to advance the chevrons by `numberOfMonths`.
  - **`renderDay(ctx)`** — replace day cell content. `ctx` includes `date`, `isToday`, `isSelected`, `isInRange`, `isDisabled`, `isOutsideMonth`, `modifiers`. The button shell + a11y stay owned by the component.
  - **`captionLayout`** (`"label" | "dropdown" | "dropdown-months" | "dropdown-years"`) plus **`fromYear` / `toYear`** for fast year jumps. Native `<select>` (zero deps).
  - **`inline`** — render the calendar always-visible without a trigger. Skips the portal.
  - **Controlled-open API**: `open` / `defaultOpen` / `onOpenChange`.
  - **Floating-UI parity**: `placement` accepts `bottom-start | bottom-end | top-start | top-end`; new `offset`, `collisionPadding`, `flip`, `shift`, `strategy`. The popover lands `data-placement` reflecting the resolved (post-flip) side.
  - **`modifiers`** — tag arbitrary date sets. Each match emits `data-mod-<name>="true"` + `data-modifiers="..."` on the cell. Hook gains `getModifiers(date)` and `DayProps["data-modifiers"]`.
  - **`fixedWeeks` / `showOutsideDays`** — pad to 6 rows or trim trailing all-outside rows; hide outside-month cells entirely.
  - **`closeOnSelect` / `clearOnReselect`** — change auto-close behavior; click a selected day again to clear.
  - **`skipDisabledOnArrowKey`** (default true) — arrow keys skip disabled cells. Fixes a latent UX bug where focus could land on disabled cells.
  - **`monthChangeAnnouncement`** + offscreen live region announce the visible month to screen readers when the chevrons fire.
  - **`onDayMouseEnter` / `onDayMouseLeave` / `onDayFocus`** — wire hover tooltips and per-day analytics.
  - **`month` / `defaultMonth`** — controlled or initial visible month.
  - Hook gains `getDaysFor(offset)`, `getMonthYearAt(offset)`, `shiftMonth(delta)`, `getModifiers(date)`, `getWeekNumber(date)`. Existing `setMonth` / `setYear` now use functional state updates so chained calls in the same tick compose correctly.
  - New CSS classes: `.rdp-months`, `.rdp-month`, `.rdp-month-select`, `.rdp-year-select`, `.rdp-day-empty`, `.rdp-sr-only`, `.rdp-calendar-inline`, `.rdp-nav-spacer`. New exported types: `MonthYear`, `DateModifiers`, `DatePickerPlacement`, `DatePickerStrategy`, `DatePickerCaptionLayout`, `RenderDayContext`.

## 0.1.3

### Patch Changes

- 949c5f6: Retry publish after npm rate limit resolved.

## 0.1.2

### Patch Changes

- ebce144: Retry publish — npm rate-limited on two previous attempts.

## 0.1.1

### Patch Changes

- 1df254b: Initial release (republish after npm rate limit during first attempt).

## 0.1.0

### Minor Changes

- 0aecafe: Initial release of 10 new packages: date-picker (single/range calendar), file-upload (drag-and-drop), number-input (decimal/currency/percent), phone-input (country selector + dial code), color-input (hex/rgb/hsl picker), tag-input (chips + autocomplete), rich-text (contentEditable WYSIWYG), table (sort/filter/paginate), chart (SVG bar/line/pie), kanban (HTML5 DnD board).
