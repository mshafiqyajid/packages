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

## License

MIT
