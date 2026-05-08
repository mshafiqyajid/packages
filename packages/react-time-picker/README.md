# @mshafiqyajid/react-time-picker

Headless time picker hook and styled time input for React.

**[Full docs →](https://docs.shafiqyajid.com/react/time-picker/)**

## Install

```bash
npm install @mshafiqyajid/react-time-picker
```

## Quick start

```tsx
import { TimePickerStyled } from "@mshafiqyajid/react-time-picker/styled";
import "@mshafiqyajid/react-time-picker/styles.css";

const [time, setTime] = useState("09:00");
<TimePickerStyled value={time} onChange={setTime} label="Meeting time" />

// 12h format with seconds
<TimePickerStyled
  value={time}
  onChange={setTime}
  format="12h"
  showSeconds
  label="Alarm time"
/>
```

## Headless usage

```tsx
import { useTimePicker } from "@mshafiqyajid/react-time-picker";

const { inputProps, hours, minutes, isOpen, open, close } = useTimePicker({
  defaultValue: "14:30",
  onChange: (v) => console.log(v),
});
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | — | Controlled value "HH:mm" or "HH:mm:ss" |
| defaultValue | string | — | Uncontrolled initial value |
| onChange | (v: string) => void | — | Called on change |
| format | "12h" \| "24h" | "24h" | Time format |
| showSeconds | boolean | false | Show seconds column |
| min | string | — | Minimum time "HH:mm" |
| max | string | — | Maximum time "HH:mm" |
| step | number | 1 | Minute step |
| size | "sm" \| "md" \| "lg" | "md" | Size variant |
| tone | "neutral" \| "primary" \| "success" \| "danger" | "neutral" | Tone variant |
| disabled | boolean | false | Disabled state |
| readOnly | boolean | false | Read-only state |
| required | boolean | false | Required field |
| invalid | boolean | false | Invalid/error state |
| label | string | — | Field label |
| hint | string | — | Hint text |
| error | string | — | Error message |
| placeholder | string | format-dependent | Input placeholder |

## License

MIT
