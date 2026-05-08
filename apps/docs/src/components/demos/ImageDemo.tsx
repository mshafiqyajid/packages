import PropPlayground from "../PropPlayground";
import { ImageStyled } from "@mshafiqyajid/react-image/styled";
import "@mshafiqyajid/react-image/styles.css";

function ImageGrid() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
      <ImageStyled src="https://picsum.photos/seed/coast/600/400" alt="Coastal view" aspectRatio="3/2" radius="md" />
      <ImageStyled src="https://picsum.photos/seed/forest/600/600" alt="Forest" aspectRatio="1/1" radius="md" />
      <ImageStyled src="https://picsum.photos/seed/city/400/600" alt="City" aspectRatio="2/3" radius="md" />
    </div>
  );
}

export default function ImageDemo() {
  return (
    <>
      <ImageGrid />
      <PropPlayground
        componentName="ImageStyled"
        importLine={`import { ImageStyled } from "@mshafiqyajid/react-image/styled";\nimport "@mshafiqyajid/react-image/styles.css";`}
        props={[
          { name: "placeholder", group: "Appearance", control: { type: "segmented", options: ["skeleton","blur","color","none"] as const }, defaultValue: "skeleton", omitWhen: "skeleton" },
          { name: "objectFit",   group: "Appearance", control: { type: "segmented", options: ["cover","contain","fill","scale-down"] as const }, defaultValue: "cover", omitWhen: "cover" },
          { name: "radius",      group: "Appearance", control: { type: "segmented", options: ["none","xs","sm","md","lg","full"] as const }, defaultValue: "none", omitWhen: "none" },
          { name: "aspectRatio", group: "Layout",     control: { type: "segmented", options: ["16/9","4/3","1/1","3/2","2/3"] as const }, defaultValue: "4/3", omitWhen: "4/3" },
          { name: "lazy",        group: "Behaviour",  control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        ]}
        render={(v) => {
          // Use different seed per aspectRatio so the image has a different intrinsic ratio
          // than the container — makes objectFit differences clearly visible.
          const seedMap: Record<string, string> = {
            "16/9":  "https://picsum.photos/seed/wide16/800/450",
            "4/3":   "https://picsum.photos/seed/tall600/600/800",
            "1/1":   "https://picsum.photos/seed/port900/600/900",
            "3/2":   "https://picsum.photos/seed/sq300/300/300",
            "2/3":   "https://picsum.photos/seed/land800/800/450",
          };
          const src = seedMap[v.aspectRatio as string] ?? "https://picsum.photos/seed/demo/800/600";

          return (
            // Re-key on placeholder + src so the component remounts when placeholder type
            // changes — this makes the loading animation/skeleton/color visible each time.
            <ImageStyled
              key={`${v.placeholder as string}-${src}`}
              src={src}
              alt="Demo image"
              placeholder={v.placeholder as "skeleton"|"blur"|"color"|"none"}
              objectFit={v.objectFit as "cover"|"contain"|"fill"|"scale-down"}
              radius={v.radius as "none"|"xs"|"sm"|"md"|"lg"|"full"}
              lazy={v.lazy as boolean}
              aspectRatio={v.aspectRatio as string}
              style={{ width: "100%", maxWidth: "380px" }}
            />
          );
        }}
      />
    </>
  );
}
