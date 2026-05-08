# @mshafiqyajid/react-carousel

Headless carousel hook and styled slide component for React. Touch swipe, drag, keyboard navigation, autoplay, dots, arrows, multi-slide view, controlled/uncontrolled, full ARIA compliance, and smooth motion with reduced-motion support.

**[Full docs →](https://docs.shafiqyajid.com/react/carousel/)**

## Install

```bash
npm install @mshafiqyajid/react-carousel
```

## Quick start

```tsx
import { CarouselStyled } from "@mshafiqyajid/react-carousel/styled";
import "@mshafiqyajid/react-carousel/styles.css";

const slides = [
  <div key="1" style={{ background: "#6366f1", height: 200, borderRadius: 8 }}>Slide 1</div>,
  <div key="2" style={{ background: "#ec4899", height: 200, borderRadius: 8 }}>Slide 2</div>,
  <div key="3" style={{ background: "#f59e0b", height: 200, borderRadius: 8 }}>Slide 3</div>,
];

export function MyCarousel() {
  return (
    <CarouselStyled
      items={slides}
      autoPlay
      showDots
      showArrows
    />
  );
}
```

## Headless usage

```tsx
import { useCarousel } from "@mshafiqyajid/react-carousel";

function MyCarousel({ items }) {
  const {
    containerProps,
    trackProps,
    getSlideProps,
    prevProps,
    nextProps,
    getDotProps,
    index,
  } = useCarousel({ items });

  return (
    <div {...containerProps}>
      <div {...trackProps}>
        {items.map((item, i) => (
          <div key={i} {...getSlideProps(i)}>{item}</div>
        ))}
      </div>
      <button {...prevProps}>Prev</button>
      <button {...nextProps}>Next</button>
      <div>
        {items.map((_, i) => (
          <button key={i} {...getDotProps(i)} />
        ))}
      </div>
    </div>
  );
}
```

## License

MIT
