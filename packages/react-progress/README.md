# @mshafiqyajid/react-progress

Headless progress hook and styled progress bar and circle components for React. Accessible, animated, fully typed.

**[Full docs →](https://docs.shafiqyajid.com/react/progress/)**

## Installation

```bash
npm install @mshafiqyajid/react-progress
```

## Headless usage

```tsx
import { useProgress } from "@mshafiqyajid/react-progress";

function MyProgress() {
  const { progressProps, percent, isComplete } = useProgress({ value: 60 });

  return (
    <div {...progressProps}>
      {percent}% {isComplete && "Done!"}
    </div>
  );
}
```

## Styled usage

```tsx
import { ProgressBar, ProgressCircle } from "@mshafiqyajid/react-progress/styled";
import "@mshafiqyajid/react-progress/styles.css";

function App() {
  return (
    <>
      <ProgressBar value={75} tone="primary" size="md" showValue label="Uploading…" />
      <ProgressCircle value={75} tone="success" size="lg" showValue />

      {/* Segmented bar — N discrete cells */}
      <ProgressBar value={60} segments={5} tone="primary" />

      {/* Custom value renderer */}
      <ProgressBar
        value={42}
        showValue
        formatValue={(percent, value) => `${value}/100 (${percent}%)`}
      />
    </>
  );
}
```

## ProgressBar props (additions)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `segments` | `number` | — | When set, renders the bar as N discrete segments (`data-filled` lands on filled cells) |
| `formatValue` | `(percent, value) => ReactNode` | — | Custom renderer when `showValue` is on |

## License

MIT
