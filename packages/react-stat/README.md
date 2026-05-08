# @mshafiqyajid/react-stat

Statistic display with count-up animation, trend indicator, and loading skeleton.

**[Full docs →](https://docs.shafiqyajid.com/react/stat/)**

## Install

```bash
npm install @mshafiqyajid/react-stat
```

## Quick start

```tsx
import { StatStyled } from "@mshafiqyajid/react-stat/styled";
import "@mshafiqyajid/react-stat/styles.css";

<StatStyled
  value={12847}
  label="Total Users"
  trend={12.5}
  trendLabel="vs last month"
  prefix=""
/>
```

## Headless

```tsx
import { useStat } from "@mshafiqyajid/react-stat";

const { rootProps, valueProps, animatedValue, trendDirection } = useStat({
  value: 12847,
  label: "Total Users",
  trend: 12.5,
  countUp: true,
});

return (
  <figure {...rootProps}>
    <span {...valueProps}>{animatedValue}</span>
    {trendDirection === "up" && <span>↑</span>}
  </figure>
);
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| value | string \| number | — | The statistic value |
| label | string | — | Descriptive label |
| previousValue | number | — | Previous value to derive trend |
| trend | number | — | Explicit trend percentage |
| trendLabel | string | — | Label beside trend (e.g. "vs last month") |
| trendFormat | "percent" \| "absolute" | "percent" | How trend magnitude is shown |
| prefix | ReactNode | — | Content before value (e.g. "$") |
| suffix | ReactNode | — | Content after value (e.g. "%") |
| icon | ReactNode | — | Icon beside label |
| size | "sm" \| "md" \| "lg" | "md" | Card size |
| tone | "neutral" \| "primary" | "neutral" | Color tone |
| countUp | boolean | true | Animate value counting up |
| countUpDuration | number | 1000 | Count-up duration in ms |
| countUpDelay | number | 0 | Delay before count-up starts in ms |
| loading | boolean | false | Show skeleton placeholder |

## License

MIT
