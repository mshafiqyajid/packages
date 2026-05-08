# @mshafiqyajid/react-image

Image component with lazy loading, blur-up effect, skeleton placeholder, and error fallback.

**[Full docs →](https://docs.shafiqyajid.com/react/image/)**

## Install

```bash
npm install @mshafiqyajid/react-image
```

## Quick start

```tsx
import { ImageStyled } from "@mshafiqyajid/react-image/styled";
import "@mshafiqyajid/react-image/styles.css";

<ImageStyled
  src="https://picsum.photos/seed/1/800/600"
  alt="A scenic photo"
  aspectRatio="4/3"
  radius="md"
  placeholder="skeleton"
/>
```

## Headless

```tsx
import { useImage } from "@mshafiqyajid/react-image";

const { imgProps, isLoading, isLoaded, isError } = useImage({
  src: "https://example.com/photo.jpg",
  alt: "A photo",
  fallbackSrc: "https://example.com/fallback.jpg",
  lazy: true,
});

return (
  <div style={{ position: "relative" }}>
    {isLoading && <div>Loading...</div>}
    {!isError && <img {...imgProps} />}
    {isError && <div>Failed to load</div>}
  </div>
);
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| src | string | — | Image source URL |
| alt | string | — | Alt text (empty string marks as decorative) |
| fallbackSrc | string | — | Fallback URL if src fails |
| fallback | ReactNode | — | Custom error state content |
| placeholder | "blur" \| "skeleton" \| "color" \| "none" | "skeleton" | Loading placeholder style |
| blurDataURL | string | — | Low-res data URL for blur placeholder |
| placeholderColor | string | — | Background color for "color" placeholder |
| lazy | boolean | true | Use native lazy loading |
| aspectRatio | string \| number | — | CSS aspect-ratio value |
| objectFit | "cover" \| "contain" \| "fill" \| "none" \| "scale-down" | "cover" | CSS object-fit |
| objectPosition | string | "center" | CSS object-position |
| radius | "none" \| "sm" \| "md" \| "lg" \| "full" | "none" | Border radius |
| onLoad | () => void | — | Callback when image loads |
| onError | () => void | — | Callback when image errors |

## License

MIT
