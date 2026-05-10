# @mshafiqyajid/react-signature

Canvas-based signature pad for React. Velocity-sensitive strokes, Bézier curve smoothing, undo history, and an imperative ref API for clearing, undoing, and exporting signatures as PNG, JPEG, or SVG.

**[Full docs →](https://docs.shafiqyajid.com/react/signature/)**

## Install

```bash
npm install @mshafiqyajid/react-signature
```

## Quick start

```tsx
import { SignatureStyled } from "@mshafiqyajid/react-signature/styled";
import "@mshafiqyajid/react-signature/styles.css";

<SignatureStyled
  penColor="#18181b"
  penWidth={2}
  onEnd={(dataURL) => console.log(dataURL)}
/>
```

## Headless usage

```tsx
import { useSignature } from "@mshafiqyajid/react-signature";

function MySignaturePad() {
  const { canvasRef, canvasProps, isEmpty, clear, getDataURL, undo } =
    useSignature({ penColor: "#18181b" });

  return (
    <div>
      <canvas ref={canvasRef} {...canvasProps} width={600} height={200} />
      <button onClick={clear}>Clear</button>
      <button onClick={undo}>Undo</button>
      <button onClick={() => console.log(getDataURL())}>Save</button>
    </div>
  );
}
```

## Imperative ref API

```tsx
import { useRef } from "react";
import { SignatureStyled } from "@mshafiqyajid/react-signature/styled";
import type { SignatureHandle } from "@mshafiqyajid/react-signature/styled";

function App() {
  const ref = useRef<SignatureHandle>(null);

  return (
    <>
      <SignatureStyled ref={ref} />
      <button onClick={() => ref.current?.clear()}>Clear</button>
      <button onClick={() => ref.current?.undo()}>Undo</button>
      <button onClick={() => {
        const url = ref.current?.getDataURL("image/png");
        if (url) window.open(url);
      }}>Save PNG</button>
    </>
  );
}
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `penColor` | `string` | `"#18181b"` | Stroke color |
| `penWidth` | `number` | `2` | Base stroke width in px |
| `backgroundColor` | `string` | `"transparent"` | Canvas fill color |
| `smoothing` | `boolean` | `true` | Bézier curve smoothing |
| `velocitySensitivity` | `number` | `0.7` | How much pen speed affects width (0–1) |
| `minWidth` | `number` | `1` | Minimum stroke width |
| `maxWidth` | `number` | `4` | Maximum stroke width |
| `onBegin` | `() => void` | — | Called when a stroke starts |
| `onEnd` | `(dataURL: string) => void` | — | Called when a stroke ends |
| `onChange` | `(isEmpty: boolean) => void` | — | Called when empty state changes |
| `disabled` | `boolean` | `false` | Disable drawing |
| `width` | `number \| string` | `"100%"` | Container width |
| `height` | `number` | `200` | Canvas height in px |
| `className` | `string` | — | Extra class on root |
| `style` | `CSSProperties` | — | Inline style on root |

## CSS variables

```css
:root {
  --rsig-border-color: #d4d4d8;
  --rsig-bg: #ffffff;
  --rsig-radius: 8px;
  --rsig-toolbar-bg: #f4f4f5;
  --rsig-toolbar-border: #e4e4e7;
  --rsig-btn-color: #3f3f46;
  --rsig-btn-bg-hover: #e4e4e7;
  --rsig-btn-radius: 6px;
  --rsig-focus-ring: 0 0 0 2px #3b82f6;
}
```
