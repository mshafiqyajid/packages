import { useRef, useState } from "react";
import PropPlayground from "../PropPlayground";
import { SignatureStyled } from "@mshafiqyajid/react-signature/styled";
import type { SignatureHandle } from "@mshafiqyajid/react-signature/styled";
import "@mshafiqyajid/react-signature/styles.css";

export default function SignatureDemo() {
  const ref = useRef<SignatureHandle>(null);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);

  return (
    <>
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ maxWidth: 520 }}>
          <SignatureStyled
            ref={ref}
            penColor="#18181b"
            penWidth={2}
            height={160}
            showToolbar
            onEnd={() => setSavedUrl(null)}
          />
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "8px",
              flexWrap: "wrap",
            }}
          >
            <button
              className="rsig-btn"
              style={{
                border: "1px solid #d4d4d8",
                padding: "5px 14px",
                borderRadius: 6,
                fontSize: "0.8125rem",
                cursor: "pointer",
                background: "transparent",
              }}
              onClick={() => ref.current?.clear()}
            >
              Clear
            </button>
            <button
              className="rsig-btn"
              style={{
                border: "1px solid #d4d4d8",
                padding: "5px 14px",
                borderRadius: 6,
                fontSize: "0.8125rem",
                cursor: "pointer",
                background: "transparent",
              }}
              onClick={() => ref.current?.undo()}
            >
              Undo
            </button>
            <button
              style={{
                border: "1px solid #3b82f6",
                padding: "5px 14px",
                borderRadius: 6,
                fontSize: "0.8125rem",
                cursor: "pointer",
                background: "#3b82f6",
                color: "#fff",
              }}
              onClick={() => {
                const url = ref.current?.getDataURL("image/png");
                if (url) setSavedUrl(url);
              }}
            >
              Save as PNG
            </button>
          </div>
          {savedUrl && (
            <div style={{ marginTop: "12px" }}>
              <p
                style={{
                  fontSize: "0.8125rem",
                  marginBottom: "6px",
                  color: "#71717a",
                }}
              >
                Saved signature:
              </p>
              <img
                src={savedUrl}
                alt="Saved signature"
                style={{
                  border: "1px solid #e4e4e7",
                  borderRadius: 6,
                  maxWidth: "100%",
                  background:
                    "repeating-conic-gradient(#f4f4f5 0% 25%, transparent 0% 50%) 0 0 / 12px 12px",
                }}
              />
            </div>
          )}
        </div>
      </div>
      <PropPlayground
        layout="stacked"
        componentName="SignatureStyled"
        importLine={`import { SignatureStyled } from "@mshafiqyajid/react-signature/styled";\nimport "@mshafiqyajid/react-signature/styles.css";`}
        props={[
          {
            name: "penColor",
            group: "Pen",
            control: { type: "color" },
            defaultValue: "#18181b",
            omitWhen: "#18181b",
          },
          {
            name: "penWidth",
            group: "Pen",
            control: { type: "slider", min: 1, max: 8, step: 0.5 },
            defaultValue: 2,
            omitWhen: 2,
          },
          {
            name: "velocitySensitivity",
            group: "Pen",
            control: { type: "slider", min: 0, max: 1, step: 0.1 },
            defaultValue: 0.7,
            omitWhen: 0.7,
          },
          {
            name: "inkStyle",
            group: "Pen",
            control: { type: "segmented", options: ["pen", "brush", "marker"] as const },
            defaultValue: "pen",
            omitWhen: "pen",
          },
          {
            name: "taper",
            group: "Pen",
            control: { type: "toggle" },
            defaultValue: true,
            omitWhen: true,
          },
          {
            name: "smoothing",
            group: "Pen",
            control: { type: "toggle" },
            defaultValue: true,
            omitWhen: true,
          },
          {
            name: "minWidth",
            group: "Width",
            control: { type: "slider", min: 0.5, max: 4, step: 0.5 },
            defaultValue: 1,
            omitWhen: 1,
          },
          {
            name: "maxWidth",
            group: "Width",
            control: { type: "slider", min: 2, max: 12, step: 0.5 },
            defaultValue: 4,
            omitWhen: 4,
          },
          {
            name: "mode",
            group: "Mode",
            control: { type: "segmented", options: ["draw", "erase"] as const },
            defaultValue: "draw",
            omitWhen: "draw",
          },
          {
            name: "showToolbar",
            group: "Mode",
            control: { type: "toggle" },
            defaultValue: false,
            omitWhen: false,
          },
          {
            name: "backgroundColor",
            group: "Canvas",
            control: { type: "color" },
            defaultValue: "#ffffff",
            omitWhen: "#ffffff",
          },
          {
            name: "disabled",
            group: "State",
            control: { type: "toggle" },
            defaultValue: false,
            omitWhen: false,
          },
        ]}
        render={(v) => (
          <div style={{ width: "100%", maxWidth: 460 }}>
            <SignatureStyled
              penColor={v.penColor as string}
              penWidth={v.penWidth as number}
              velocitySensitivity={v.velocitySensitivity as number}
              inkStyle={v.inkStyle as "pen" | "brush" | "marker"}
              taper={v.taper as boolean}
              smoothing={v.smoothing as boolean}
              minWidth={v.minWidth as number}
              maxWidth={v.maxWidth as number}
              mode={v.mode as "draw" | "erase"}
              showToolbar={v.showToolbar as boolean}
              backgroundColor={
                v.backgroundColor !== "#ffffff"
                  ? (v.backgroundColor as string)
                  : undefined
              }
              disabled={v.disabled as boolean}
              height={140}
            />
          </div>
        )}
      />
    </>
  );
}
