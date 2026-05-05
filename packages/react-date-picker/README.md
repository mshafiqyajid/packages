# @mshafiqyajid/react-date-picker

Headless date picker hook and styled component for React. Single and range selection, keyboard navigation, accessible, SSR-safe, zero runtime dependencies.

**[Full docs →](https://docs.shafiqyajid.com/react/date-picker/)**

## Install

```bash
npm install @mshafiqyajid/react-date-picker
```

## Headless usage

```tsx
import { useDatePicker } from "@mshafiqyajid/react-date-picker";

function MyCalendar() {
  const {
    selected,
    month,
    year,
    getDayProps,
    nextMonth,
    prevMonth,
  } = useDatePicker({ mode: "single" });

  // build your own calendar UI using getDayProps(date)
}
```

## Styled usage

```tsx
import { DatePickerStyled } from "@mshafiqyajid/react-date-picker/styled";
import "@mshafiqyajid/react-date-picker/styles.css";

function App() {
  return (
    <DatePickerStyled
      mode="range"
      numberOfMonths={2}
      captionLayout="dropdown"
      fromYear={1990}
      toYear={2030}
      placeholder="Pick a date range"
      format="MMM D, YYYY"
      placement="bottom-start"
      offset={6}
      collisionPadding={8}
      shift
      flip
    />
  );
}
```

## What's new in 0.2.0

- **`numberOfMonths` (1 | 2 | 3)** — render multiple month grids side-by-side. Pair with `pagedBy="all"` to advance the chevrons by `numberOfMonths`.
- **`renderDay(ctx)`** — replace the day cell content (price tag, "has events" dot, etc.) while keeping the button shell + a11y owned by the component.
- **`captionLayout`** (`"label" | "dropdown" | "dropdown-months" | "dropdown-years"`) plus **`fromYear` / `toYear`** for fast year jumps.
- **`inline`** — render the calendar without a trigger (sidebar filters, booking flows). Skips the portal.
- **Floating-UI parity** — `placement` accepts `bottom-start | bottom-end | top-start | top-end`, plus `offset`, `collisionPadding`, `flip`, `shift`, `strategy`. The popover lands `data-placement` reflecting the resolved (post-flip) side.
- **`modifiers`** — tag arbitrary date sets (`weekend`, `holiday`, `hasEvents`, …); each match emits `data-mod-<name>="true"` + `data-modifiers="..."` on the cell.
- **`fixedWeeks` / `showOutsideDays`** — control whether the grid pads to 6 rows and whether outside-month cells render at all.
- **`closeOnSelect` / `clearOnReselect`** — change the auto-close behavior; click a selected day again to clear.
- **`skipDisabledOnArrowKey`** (default true) — arrow keys skip disabled cells instead of stopping on them.
- **`monthChangeAnnouncement`** + offscreen live region announce "March 2026" to screen readers when the visible month changes.
- **`onDayMouseEnter` / `onDayMouseLeave` / `onDayFocus`** — wire tooltips and hover UIs.
- **`month` / `defaultMonth`** — controlled or initial visible month.
- Hook gains `getDaysFor(offset)`, `getMonthYearAt(offset)`, `shiftMonth(delta)`, `getModifiers(date)`, `getWeekNumber(date)`.

## License

MIT
