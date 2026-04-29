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
      mode="single"
      placeholder="Pick a date"
      format="MMM D, YYYY"
    />
  );
}
```

## License

MIT
