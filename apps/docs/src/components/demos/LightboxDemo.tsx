import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { LightboxStyled } from "@mshafiqyajid/react-lightbox/styled";
import "@mshafiqyajid/react-lightbox/styles.css";

const DEMO_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
    thumb: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=70",
    alt: "Mountain peak above the clouds at golden hour",
    caption: "Swiss Alps — golden hour above the clouds",
    width: 1200,
    height: 800,
  },
  {
    src: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1200&q=80",
    thumb: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=200&q=70",
    alt: "Dense tropical rainforest canopy",
    caption: "Amazon rainforest canopy, Brazil",
    width: 1200,
    height: 800,
  },
  {
    src: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1200&q=80",
    thumb: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=200&q=70",
    alt: "Calm lake reflecting a snow-capped mountain",
    caption: "Reflection on Moraine Lake, Canada",
    width: 1200,
    height: 800,
  },
  {
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80",
    thumb: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&q=70",
    alt: "Sunlight breaking through a forest",
    caption: "Morning light, Black Forest, Germany",
    width: 1200,
    height: 800,
  },
  {
    src: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=1200&q=80",
    thumb: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=200&q=70",
    alt: "Desert sand dunes at sunset",
    caption: "Sahara Desert, Morocco",
    width: 1200,
    height: 800,
  },
];

function GalleryWrapper({
  loop,
  showThumbnails,
  showCaption,
  showCounter,
  showClose,
  closeOnOverlayClick,
  closeOnEsc,
  swipe,
  zoom,
}: {
  loop: boolean;
  showThumbnails: boolean;
  showCaption: boolean;
  showCounter: boolean;
  showClose: boolean;
  closeOnOverlayClick: boolean;
  closeOnEsc: boolean;
  swipe: boolean;
  zoom: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "0.375rem",
          maxWidth: 420,
        }}
      >
        {DEMO_IMAGES.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { setIndex(i); setOpen(true); }}
            style={{
              all: "unset",
              cursor: "pointer",
              borderRadius: 4,
              overflow: "hidden",
              aspectRatio: "1",
              display: "block",
              outline: "2px solid transparent",
              outlineOffset: 2,
              transition: "outline-color 120ms ease, opacity 120ms ease",
            }}
            onFocus={(e) => { (e.currentTarget.style.outlineColor = "var(--accent)"); }}
            onBlur={(e) => { (e.currentTarget.style.outlineColor = "transparent"); }}
            onMouseEnter={(e) => { (e.currentTarget.style.opacity = "0.82"); }}
            onMouseLeave={(e) => { (e.currentTarget.style.opacity = "1"); }}
            aria-label={`Open gallery at image: ${img.alt}`}
          >
            <img
              src={img.thumb}
              alt={img.alt}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <p style={{ fontSize: "0.8125rem", color: "var(--fg-subtle)", margin: 0 }}>
        Click any thumbnail to open. Use <kbd style={{ fontFamily: "monospace", fontSize: "0.75rem", padding: "1px 4px", border: "1px solid var(--border)", borderRadius: 3 }}>←</kbd> <kbd style={{ fontFamily: "monospace", fontSize: "0.75rem", padding: "1px 4px", border: "1px solid var(--border)", borderRadius: 3 }}>→</kbd> to navigate,{" "}
        <kbd style={{ fontFamily: "monospace", fontSize: "0.75rem", padding: "1px 4px", border: "1px solid var(--border)", borderRadius: 3 }}>Esc</kbd> to close.
      </p>

      <LightboxStyled
        images={DEMO_IMAGES}
        open={open}
        index={index}
        onOpenChange={setOpen}
        onIndexChange={setIndex}
        loop={loop}
        showThumbnails={showThumbnails}
        showCaption={showCaption}
        showCounter={showCounter}
        showClose={showClose}
        closeOnOverlayClick={closeOnOverlayClick}
        closeOnEsc={closeOnEsc}
        swipe={swipe}
        zoom={zoom}
        maxZoom={3}
      />
    </div>
  );
}

export default function LightboxDemo() {
  return (
    <PropPlayground
      componentName="LightboxStyled"
      importLine={`import { LightboxStyled } from "@mshafiqyajid/react-lightbox/styled";\nimport "@mshafiqyajid/react-lightbox/styles.css";`}
      props={[
        { name: "loop",                 control: { type: "toggle" }, defaultValue: true,  omitWhen: true },
        { name: "showThumbnails",       label: "thumbnails",        control: { type: "toggle" }, defaultValue: true,  omitWhen: true },
        { name: "showCaption",          label: "caption",           control: { type: "toggle" }, defaultValue: true,  omitWhen: true },
        { name: "showCounter",          label: "counter",           control: { type: "toggle" }, defaultValue: true,  omitWhen: true },
        { name: "showClose",            label: "close button",      control: { type: "toggle" }, defaultValue: true,  omitWhen: true },
        { name: "closeOnOverlayClick",  label: "overlay click",     control: { type: "toggle" }, defaultValue: true,  omitWhen: true },
        { name: "closeOnEsc",           label: "Esc closes",        control: { type: "toggle" }, defaultValue: true,  omitWhen: true },
        { name: "swipe",                label: "swipe nav",         control: { type: "toggle" }, defaultValue: true,  omitWhen: true },
        { name: "zoom",                 label: "zoom enabled",      control: { type: "toggle" }, defaultValue: false, omitWhen: false },
      ]}
      staticProps={{ images: "{images}", open: "{open}", index: "{index}", onOpenChange: "{setOpen}", onIndexChange: "{setIndex}" }}
      render={(v) => (
        <GalleryWrapper
          loop={v.loop as boolean}
          showThumbnails={v.showThumbnails as boolean}
          showCaption={v.showCaption as boolean}
          showCounter={v.showCounter as boolean}
          showClose={v.showClose as boolean}
          closeOnOverlayClick={v.closeOnOverlayClick as boolean}
          closeOnEsc={v.closeOnEsc as boolean}
          swipe={v.swipe as boolean}
          zoom={v.zoom as boolean}
        />
      )}
    />
  );
}
