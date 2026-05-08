# @mshafiqyajid/react-calendar

Headless calendar hook and styled date-picker calendar for React.

**[Full docs →](https://docs.shafiqyajid.com/react/calendar/)**

## Install

```bash
npm install @mshafiqyajid/react-calendar
```

## Quick start

```tsx
import { CalendarStyled } from "@mshafiqyajid/react-calendar/styled";
import "@mshafiqyajid/react-calendar/styles.css";
import { useState } from "react";

export function Example() {
  const [value, setValue] = useState<Date | null>(null);

  return (
    <CalendarStyled
      value={value}
      onChange={setValue}
    />
  );
}
```

## Range mode

```tsx
import { CalendarStyled } from "@mshafiqyajid/react-calendar/styled";
import "@mshafiqyajid/react-calendar/styles.css";
import { useState } from "react";

export function RangeExample() {
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);

  return (
    <CalendarStyled
      mode="range"
      value={range}
      onChange={setRange}
    />
  );
}
```

## Headless hook

```tsx
import { useCalendar } from "@mshafiqyajid/react-calendar";

const {
  monthProps,
  getDateProps,
  navProps,
  value,
  setValue,
  viewMonth,
  setViewMonth,
  goToPrev,
  goToNext,
  goToToday,
  view,
  setView,
  weeks,
  weekDayLabels,
} = useCalendar({ mode: "single" });
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | Date \| null \| [Date\|null, Date\|null] | — | Controlled value |
| defaultValue | same | — | Uncontrolled initial value |
| onChange | (value) => void | — | Called when selection changes |
| mode | "single" \| "range" \| "multiple" | "single" | Selection mode |
| view | "month" \| "year" \| "decade" | — | Controlled view |
| defaultView | same | "month" | Uncontrolled initial view |
| month | Date | — | Controlled viewport month |
| defaultMonth | Date | current month | Uncontrolled initial month |
| onMonthChange | (month: Date) => void | — | Called when viewport month changes |
| minDate | Date | — | Earliest selectable date |
| maxDate | Date | — | Latest selectable date |
| disabledDates | Date[] \| ((date: Date) => boolean) | — | Disabled dates |
| firstDayOfWeek | 0 \| 1 \| 6 | 0 | First day of week (0=Sun, 1=Mon, 6=Sat) |
| locale | string | browser locale | Locale for formatting |
| showOutsideDays | boolean | true | Show days from adjacent months |
| showWeekNumbers | boolean | false | Show week number column |
| fixedWeeks | boolean | false | Always show 6 rows |
| size | "sm" \| "md" \| "lg" | "md" | Calendar size |
| className | string | — | Extra CSS class |
| style | CSSProperties | — | Inline styles |

## License

MIT
