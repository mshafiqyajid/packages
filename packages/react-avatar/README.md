# @mshafiqyajid/react-avatar

Headless avatar hook and styled component for React. Supports image loading with automatic fallback to initials, status indicators, and grouped avatars.

**[Full docs →](https://docs.shafiqyajid.com/react/avatar/)**

## Installation

```bash
npm install @mshafiqyajid/react-avatar
```

## Headless usage

```tsx
import { useAvatar } from "@mshafiqyajid/react-avatar";

function MyAvatar() {
  const { imgProps, fallbackProps, status, initials } = useAvatar({
    src: "https://example.com/photo.jpg",
    name: "Jane Doe",
  });

  return (
    <div>
      {status !== "error" && <img {...imgProps} />}
      {status === "error" && <span {...fallbackProps}>{initials}</span>}
    </div>
  );
}
```

## Styled usage

```tsx
import { AvatarStyled } from "@mshafiqyajid/react-avatar/styled";
import "@mshafiqyajid/react-avatar/styles.css";

function App() {
  return (
    <AvatarStyled
      src="https://example.com/photo.jpg"
      name="Jane Doe"
      size="md"
      shape="circle"
      status="online"
    />
  );
}
```

## AvatarGroup

```tsx
import { AvatarStyled, AvatarGroup } from "@mshafiqyajid/react-avatar/styled";
import "@mshafiqyajid/react-avatar/styles.css";

function App() {
  return (
    <AvatarGroup max={3} size="md" spacing="sm">
      <AvatarStyled name="Alice Smith" />
      <AvatarStyled name="Bob Jones" />
      <AvatarStyled name="Carol White" />
      <AvatarStyled name="Dave Brown" />
    </AvatarGroup>
  );
}
```

## Auto-color from name

```tsx
<AvatarStyled name="Shafiq Yajid" autoColor />
{/* Deterministic background pulled from a 10-color palette by hashing the name. */}
{/* Overridden by an explicit `color` prop. */}
```

## Loading skeleton

```tsx
<AvatarStyled src="/photo.jpg" name="Shafiq" showLoading />
{/* Renders a skeleton overlay while the image is loading. */}
```

## Image focal-point (imagePosition)

Profile photos are often off-center. `imagePosition` maps directly to the CSS `object-position` property so you can shift the framing without re-uploading.

```tsx
<AvatarStyled
  src="/photo.jpg"
  name="Jane Doe"
  imagePosition="top"
/>

<AvatarStyled
  src="/photo.jpg"
  name="Bob"
  imagePosition="30% 20%"
/>
```

## AvatarStyled props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | — | Image URL |
| `name` | `string` | — | Used to derive initials and as `alt` text |
| `size` | `"xs" \| "sm" \| "md" \| "lg" \| "xl"` | `"md"` | Avatar diameter |
| `shape` | `"circle" \| "square"` | `"circle"` | Border-radius shape |
| `status` | `"online" \| "offline" \| "busy" \| "away"` | — | Presence dot |
| `fallback` | `ReactNode` | — | Custom element shown when image is unavailable |
| `border` | `boolean` | `false` | White ring around the avatar |
| `color` | `string` | — | Explicit background color |
| `autoColor` | `boolean` | `false` | Deterministic background from `name` hash. Overridden by `color`. |
| `showLoading` | `boolean` | `false` | Skeleton shimmer while image loads |
| `imagePosition` | `string` | `"center"` | CSS `object-position` for the image — shift the focal point without re-uploading |

## What's new in 0.3.0

- **`imagePosition` prop** — forwards a CSS `object-position` value to the `<img>` element so off-center portraits are framed correctly inside the avatar clip.

## License

MIT
