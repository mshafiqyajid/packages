import PropPlayground from "../PropPlayground";
import { CarouselStyled } from "@mshafiqyajid/react-carousel/styled";
import "@mshafiqyajid/react-carousel/styles.css";

const SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    alt: "Mountain peak above the clouds at golden hour",
    caption: "Swiss Alps — golden hour above the clouds",
  },
  {
    src: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80",
    alt: "Calm lake reflecting a snow-capped mountain",
    caption: "Moraine Lake, Banff — Canadian Rockies",
  },
  {
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
    alt: "Sunlight breaking through a forest",
    caption: "Morning light, Black Forest, Germany",
  },
  {
    src: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800&q=80",
    alt: "Desert sand dunes at sunset",
    caption: "Sahara Desert, Morocco",
  },
  {
    src: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=80",
    alt: "Dense tropical rainforest canopy",
    caption: "Amazon rainforest canopy, Brazil",
  },
];

const slides = SLIDES.map((s) => (
  <div
    key={s.src}
    style={{
      position: "relative",
      width: "100%",
      height: "100%",
      overflow: "hidden",
    }}
  >
    <img
      src={s.src}
      alt={s.alt}
      loading="lazy"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        userSelect: "none",
        pointerEvents: "none",
      }}
    />
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "2rem 1.25rem 1rem",
        background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#fff",
          fontSize: "0.8125rem",
          fontWeight: 500,
          letterSpacing: "0.01em",
          textShadow: "0 1px 4px rgba(0,0,0,0.4)",
          userSelect: "none",
        }}
      >
        {s.caption}
      </p>
    </div>
  </div>
));

function CarouselWrapper({
  orientation,
  loop,
  autoPlay,
  showDots,
  showArrows,
  swipe,
  drag,
  slidesPerView,
  spacing,
  transitionEffect,
  counter,
  autoPlayProgress,
  peek,
}: {
  orientation: "horizontal" | "vertical";
  loop: boolean;
  autoPlay: boolean;
  showDots: boolean;
  showArrows: boolean;
  swipe: boolean;
  drag: boolean;
  slidesPerView: number;
  spacing: number;
  transitionEffect: "slide" | "fade";
  counter: boolean;
  autoPlayProgress: boolean;
  peek: number;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: orientation === "vertical" ? 480 : 420,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
      }}
    >
      <CarouselStyled
        items={slides}
        orientation={orientation}
        loop={loop}
        autoPlay={autoPlay}
        autoPlayInterval={3000}
        showDots={showDots}
        showArrows={showArrows}
        swipe={swipe}
        drag={drag}
        slidesPerView={slidesPerView}
        spacing={spacing}
        transitionEffect={transitionEffect}
        counter={counter}
        autoPlayProgress={autoPlayProgress}
        peek={peek}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

export default function CarouselDemo() {
  return (
    <PropPlayground
      layout="stacked"
      componentName="CarouselStyled"
      importLine={`import { CarouselStyled } from "@mshafiqyajid/react-carousel/styled";\nimport "@mshafiqyajid/react-carousel/styles.css";`}
      props={[
        /* ── Navigation ── */
        { name: "loop",       group: "Navigation", control: { type: "toggle" }, defaultValue: true,  omitWhen: true },
        { name: "swipe",      group: "Navigation", control: { type: "toggle" }, defaultValue: true,  omitWhen: true },
        { name: "drag",       group: "Navigation", control: { type: "toggle" }, defaultValue: true,  omitWhen: true },
        /* ── AutoPlay ── */
        { name: "autoPlay",         group: "AutoPlay", control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "autoPlayProgress", group: "AutoPlay", label: "progress bar", control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        /* ── Layout ── */
        {
          name: "orientation", group: "Layout",
          control: { type: "select", options: ["horizontal", "vertical"] },
          defaultValue: "horizontal", omitWhen: "horizontal",
        },
        {
          name: "slidesPerView", group: "Layout", label: "slides/view",
          control: { type: "select", options: [1, 2, 3] as unknown as string[] },
          defaultValue: 1, omitWhen: 1,
        },
        {
          name: "spacing", group: "Layout", label: "gap",
          control: { type: "select", options: [0, 8, 16] as unknown as string[] },
          defaultValue: 0, omitWhen: 0,
        },
        {
          name: "peek", group: "Layout",
          control: { type: "select", options: [0, 20, 40] as unknown as string[] },
          defaultValue: 0, omitWhen: 0,
        },
        /* ── Display ── */
        { name: "showDots",   group: "Display", label: "dots",       control: { type: "toggle" }, defaultValue: true,  omitWhen: true },
        { name: "showArrows", group: "Display", label: "arrows",     control: { type: "toggle" }, defaultValue: true,  omitWhen: true },
        { name: "counter",    group: "Display",                       control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        {
          name: "transitionEffect", group: "Display", label: "transition",
          control: { type: "select", options: ["slide", "fade"] },
          defaultValue: "slide", omitWhen: "slide",
        },
      ]}
      staticProps={{ items: "{slides}" }}
      render={(v) => (
        <CarouselWrapper
          orientation={v.orientation as "horizontal" | "vertical"}
          loop={v.loop as boolean}
          autoPlay={v.autoPlay as boolean}
          showDots={v.showDots as boolean}
          showArrows={v.showArrows as boolean}
          swipe={v.swipe as boolean}
          drag={v.drag as boolean}
          slidesPerView={Number(v.slidesPerView)}
          spacing={Number(v.spacing)}
          transitionEffect={v.transitionEffect as "slide" | "fade"}
          counter={v.counter as boolean}
          autoPlayProgress={v.autoPlayProgress as boolean}
          peek={Number(v.peek)}
        />
      )}
    />
  );
}
