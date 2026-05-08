# @mshafiqyajid/react-alert

Alert and notification banner component with tones, variants, and dismissal.

**[Full docs →](https://docs.shafiqyajid.com/react/alert/)**

## Install

```bash
npm install @mshafiqyajid/react-alert
```

## Quick start

```tsx
import { AlertStyled } from "@mshafiqyajid/react-alert/styled";
import "@mshafiqyajid/react-alert/styles.css";

<AlertStyled tone="success" title="Saved!" description="Your changes have been saved." />
<AlertStyled tone="danger" title="Error" description="Something went wrong." dismissible />
<AlertStyled tone="warning" variant="filled" title="Warning" description="Disk space is low." />
```

## Tones

`neutral` · `primary` · `success` · `warning` · `danger` · `info`

## Variants

- **soft** (default) — tinted background with border
- **filled** — solid colour background
- **outline** — transparent background with coloured border
- **banner** — full-width strip without border radius

## Headless

```tsx
import { useAlert } from "@mshafiqyajid/react-alert";

function MyAlert() {
  const { alertProps, dismissProps, isDismissed, dismiss } = useAlert({
    dismissible: true,
    tone: "danger",
    onDismiss: () => console.log("dismissed"),
  });

  if (isDismissed) return null;
  return (
    <div {...alertProps} className="my-alert">
      <span>Something went wrong.</span>
      <button {...dismissProps}>×</button>
    </div>
  );
}
```

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | "soft" \| "filled" \| "outline" \| "banner" | "soft" | Visual style |
| tone | "neutral" \| "primary" \| "success" \| "warning" \| "danger" \| "info" | "neutral" | Color tone |
| size | "sm" \| "md" \| "lg" | "md" | Size |
| title | ReactNode | — | Alert title |
| description | ReactNode | — | Alert body text |
| icon | ReactNode | — | Override default tone icon |
| showIcon | boolean | true | Show/hide the icon |
| dismissible | boolean | false | Show dismiss button; Escape also dismisses |
| onDismiss | () => void | — | Called when dismissed |
| action | ReactNode | — | Action button slot |
| children | ReactNode | — | Additional content |
| className | string | — | Extra class on root |
| style | CSSProperties | — | Inline style override |

## License

MIT © Shafiq Yajid
