# @mshafiqyajid/react-lightbox

Full-screen image lightbox with thumbnails, swipe navigation, keyboard control, and optional zoom.

**[Full docs →](https://docs.shafiqyajid.com/react/lightbox/)**

## Install

```bash
npm install @mshafiqyajid/react-lightbox
```

## Quick start

```tsx
import { LightboxStyled } from "@mshafiqyajid/react-lightbox/styled";
import "@mshafiqyajid/react-lightbox/styles.css";
import { useState } from "react";

const images = [
  { src: "/photo-1.jpg", alt: "Mountain landscape", caption: "Swiss Alps, 2024" },
  { src: "/photo-2.jpg", alt: "Ocean sunset",       caption: "Malibu, California" },
  { src: "/photo-3.jpg", alt: "City skyline",        caption: "Tokyo at night" },
];

export function Gallery() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  return (
    <>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {images.map((img, i) => (
          <img
            key={i}
            src={img.src}
            alt={img.alt}
            style={{ width: 120, height: 80, objectFit: "cover", cursor: "pointer" }}
            onClick={() => { setIndex(i); setOpen(true); }}
          />
        ))}
      </div>

      <LightboxStyled
        images={images}
        open={open}
        index={index}
        onOpenChange={setOpen}
        onIndexChange={setIndex}
      />
    </>
  );
}
```

## Headless hook

```tsx
import { useLightbox } from "@mshafiqyajid/react-lightbox";

const { isOpen, open, close, index, prev, next, lightboxProps } = useLightbox({
  total: images.length,
  loop: true,
});
```

## LightboxImage type

```ts
interface LightboxImage {
  src: string;          // Full-size image URL
  alt: string;          // Alt text (required for accessibility)
  caption?: string;     // Optional caption displayed below the image
  thumb?: string;       // Thumbnail URL — falls back to src
  width?: number;       // Native image width (improves CLS)
  height?: number;      // Native image height
}
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `images` | `LightboxImage[]` | — | Image list |
| `open` | `boolean` | — | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial open state |
| `onOpenChange` | `(open: boolean) => void` | — | Called when open state changes |
| `index` | `number` | — | Controlled current image index (0-based) |
| `defaultIndex` | `number` | `0` | Uncontrolled initial index |
| `onIndexChange` | `(index: number) => void` | — | Called when image changes |
| `loop` | `boolean` | `true` | Wrap around at boundaries |
| `showThumbnails` | `boolean` | `true` | Show thumbnail strip |
| `showCaption` | `boolean` | `true` | Show caption below image |
| `showCounter` | `boolean` | `true` | Show "N / total" counter |
| `showClose` | `boolean` | `true` | Show close button |
| `closeOnOverlayClick` | `boolean` | `true` | Close when clicking the overlay |
| `closeOnEsc` | `boolean` | `true` | Close on Escape key |
| `swipe` | `boolean` | `true` | Enable touch swipe navigation |
| `zoom` | `boolean` | `false` | Enable zoom controls |
| `maxZoom` | `number` | `3` | Maximum zoom multiplier |
| `onClose` | `() => void` | — | Called when the lightbox closes |
| `renderCaption` | `(image, index) => ReactNode` | — | Custom caption renderer |
| `className` | `string` | — | Extra class on the container |
| `style` | `CSSProperties` | — | Inline style on the container |

## Keyboard

| Key | Action |
|---|---|
| `ArrowLeft` | Previous image |
| `ArrowRight` | Next image |
| `Home` | First image |
| `End` | Last image |
| `Escape` | Close |
| `+` / `=` | Zoom in (when `zoom` enabled) |
| `-` | Zoom out (when `zoom` enabled) |

## CSS variables

```css
:root {
  --rlbx-overlay-bg: rgba(0, 0, 0, 0.95);
  --rlbx-nav-size: 3rem;
  --rlbx-thumb-size: 4rem;
  --rlbx-thumb-ring: #fff;
  --rlbx-duration-overlay: 220ms;
  --rlbx-duration-image: 200ms;
}
```

## Data attributes

| Attribute | Values | Element |
|---|---|---|
| `data-state` | `"open"` \| `"closed"` | overlay + container |
| `data-index` | `number` | container |
| `data-total` | `number` | container |
| `data-zoom-active` | `"true"` (when zoomed) | container |

## License

MIT
