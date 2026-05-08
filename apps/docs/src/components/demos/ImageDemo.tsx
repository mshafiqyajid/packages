import PropPlayground from "../PropPlayground";
import { ImageStyled } from "@mshafiqyajid/react-image/styled";
import "@mshafiqyajid/react-image/styles.css";

export default function ImageDemo() {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        <ImageStyled src="https://picsum.photos/seed/1/400/300" alt="Sample 1" aspectRatio="4/3" radius="md" />
        <ImageStyled src="https://picsum.photos/seed/2/400/300" alt="Sample 2" aspectRatio="4/3" radius="md" />
        <ImageStyled src="https://picsum.photos/seed/3/400/300" alt="Sample 3" aspectRatio="4/3" radius="md" />
      </div>
      <PropPlayground
        componentName="ImageStyled"
        importLine={`import { ImageStyled } from "@mshafiqyajid/react-image/styled";\nimport "@mshafiqyajid/react-image/styles.css";`}
        props={[
          { name: "placeholder", control: { type: "segmented", options: ["skeleton","blur","color","none"] as const }, defaultValue: "skeleton", omitWhen: "skeleton" },
          { name: "objectFit",   control: { type: "segmented", options: ["cover","contain","fill"] as const },         defaultValue: "cover",    omitWhen: "cover" },
          { name: "radius",      control: { type: "segmented", options: ["none","sm","md","lg","full"] as const },     defaultValue: "none",     omitWhen: "none" },
          { name: "lazy",        control: { type: "toggle" },                                                          defaultValue: true,       omitWhen: true },
        ]}
        render={(v) => (
          <ImageStyled
            src="https://picsum.photos/seed/42/600/400"
            alt="Demo image"
            aspectRatio="3/2"
            placeholder={v.placeholder as "skeleton"|"blur"|"color"|"none"}
            objectFit={v.objectFit as "cover"|"contain"|"fill"}
            radius={v.radius as "none"|"sm"|"md"|"lg"|"full"}
            lazy={v.lazy as boolean}
          />
        )}
      />
    </>
  );
}
