import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { SplitStyled } from "@mshafiqyajid/react-split/styled";
import "@mshafiqyajid/react-split/styles.css";

function SplitPreview2({
  orientation,
  defaultSizes,
  minSize,
  maxSize,
  resizerSize,
  disabled,
  collapsible,
  snapPoints,
  persistent,
}: {
  orientation: "horizontal" | "vertical";
  defaultSizes: [number, number];
  minSize: number;
  maxSize: number;
  resizerSize: number;
  disabled: boolean;
  collapsible: boolean;
  snapPoints: number[] | undefined;
  persistent: string | undefined;
}) {
  const [sizes, setSizes] = useState<number[]>(defaultSizes);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%" }}>
      <SplitStyled
        key={`${orientation}-${defaultSizes[0]}-${minSize}-${maxSize}-${resizerSize}-${collapsible}-${String(snapPoints)}-${persistent}`}
        orientation={orientation}
        defaultSizes={defaultSizes}
        minSize={minSize}
        maxSize={maxSize}
        resizerSize={resizerSize}
        disabled={disabled}
        collapsible={collapsible || undefined}
        snapPoints={snapPoints}
        persistent={persistent}
        onResize={setSizes}
        style={{ height: orientation === "horizontal" ? 200 : 240, border: "1px solid var(--pp-border, #e4e4e7)", borderRadius: 8, overflow: "hidden" }}
      >
        {[
          { label: "Panel A", bg: "var(--rspl-pane-a-bg, #f0f9ff)", color: "#0369a1" },
          { label: "Panel B", bg: "var(--rspl-pane-b-bg, #f0fdf4)", color: "#15803d" },
        ].map(({ label, bg, color }, i) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: bg,
              height: "100%",
              fontWeight: 600,
              fontSize: "0.9rem",
              color,
            }}
          >
            {label} · {Math.round(sizes[i] ?? 0)}%
          </div>
        ))}
      </SplitStyled>
      <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--pp-muted, #6b7280)" }}>
        Drag the divider or focus it and use arrow keys (Shift for 5% jumps), Home, and End.
        Double-click a divider to equalize all panes.
        {collapsible && " Click the chevron button to collapse/expand a pane."}
        {snapPoints && snapPoints.length > 0 && ` Snap points: ${snapPoints.join("%, ")}%.`}
        {persistent && " Size is saved to localStorage."}
      </p>
    </div>
  );
}

function SplitPreview3({
  orientation,
  resizerSize,
  disabled,
  collapsible,
  snapPoints,
  persistent,
}: {
  orientation: "horizontal" | "vertical";
  resizerSize: number;
  disabled: boolean;
  collapsible: boolean;
  snapPoints: number[] | undefined;
  persistent: string | undefined;
}) {
  const [sizes, setSizes] = useState<number[]>([25, 50, 25]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%" }}>
      <SplitStyled
        key={`3pane-${orientation}-${resizerSize}-${collapsible}-${String(snapPoints)}-${persistent}`}
        orientation={orientation}
        defaultSizes={[25, 50, 25]}
        resizerSize={resizerSize}
        disabled={disabled}
        collapsible={collapsible || undefined}
        snapPoints={snapPoints}
        persistent={persistent}
        onResize={setSizes}
        style={{ height: orientation === "horizontal" ? 200 : 300, border: "1px solid var(--pp-border, #e4e4e7)", borderRadius: 8, overflow: "hidden" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f0f9ff",
            height: "100%",
            fontWeight: 600,
            fontSize: "0.9rem",
            color: "#0369a1",
          }}
        >
          Sidebar · {Math.round(sizes[0] ?? 0)}%
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f0fdf4",
            height: "100%",
            fontWeight: 600,
            fontSize: "0.9rem",
            color: "#15803d",
          }}
        >
          Content · {Math.round(sizes[1] ?? 0)}%
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fdf4ff",
            height: "100%",
            fontWeight: 600,
            fontSize: "0.9rem",
            color: "#7e22ce",
          }}
        >
          Inspector · {Math.round(sizes[2] ?? 0)}%
        </div>
      </SplitStyled>
      <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--pp-muted, #6b7280)" }}>
        3-pane layout with independent resizers. Double-click any divider to equalize all three panes.
        {disabled && " Resizing is disabled."}
      </p>
    </div>
  );
}

const PRESET_SIZES: Record<string, [number, number]> = {
  "50 / 50": [50, 50],
  "30 / 70": [30, 70],
  "70 / 30": [70, 30],
  "25 / 75": [25, 75],
};

const SNAP_PRESETS: Record<string, number[] | undefined> = {
  "none": undefined,
  "25 / 50 / 75": [25, 50, 75],
  "33 / 66": [33, 66],
};

export default function SplitDemo() {
  return (
    <PropPlayground
      layout="stacked"
      componentName="SplitStyled"
      importLine={`import { SplitStyled } from "@mshafiqyajid/react-split/styled";\nimport "@mshafiqyajid/react-split/styles.css";`}
      props={[
        {
          name: "panes",
          group: "Layout",
          control: { type: "segmented", options: ["2 panes", "3 panes"] as const },
          defaultValue: "2 panes",
          omitWhen: "2 panes",
        },
        {
          name: "orientation",
          group: "Layout",
          control: { type: "segmented", options: ["horizontal", "vertical"] as const },
          defaultValue: "horizontal",
          omitWhen: "horizontal",
        },
        {
          name: "defaultSizes",
          group: "Layout",
          control: { type: "select", options: ["50 / 50", "30 / 70", "70 / 30", "25 / 75"] as const },
          defaultValue: "50 / 50",
          omitWhen: "50 / 50",
        },
        {
          name: "minSize",
          group: "Constraints",
          control: { type: "slider", min: 0, max: 40, step: 5 },
          defaultValue: 10,
          omitWhen: 10,
        },
        {
          name: "maxSize",
          group: "Constraints",
          control: { type: "slider", min: 60, max: 100, step: 5 },
          defaultValue: 90,
          omitWhen: 90,
        },
        {
          name: "resizerSize",
          group: "Appearance",
          control: { type: "slider", min: 2, max: 16, step: 2 },
          defaultValue: 6,
          omitWhen: 6,
        },
        {
          name: "collapsible",
          group: "Collapsible",
          control: { type: "toggle" },
          defaultValue: false,
          omitWhen: false,
        },
        {
          name: "snapPoints",
          group: "Snap",
          control: { type: "select", options: ["none", "25 / 50 / 75", "33 / 66"] as const },
          defaultValue: "none",
          omitWhen: "none",
        },
        {
          name: "persistent",
          group: "Persistence",
          control: { type: "toggle" },
          defaultValue: false,
          omitWhen: false,
        },
        {
          name: "disabled",
          group: "State",
          control: { type: "toggle" },
          defaultValue: false,
          omitWhen: false,
        },
      ]}
      render={(v) => {
        const is3Pane = v.panes === "3 panes";
        const presetKey = String(v.defaultSizes ?? "50 / 50");
        const resolvedSizes = PRESET_SIZES[presetKey] ?? [50, 50];
        const snapKey = String(v.snapPoints ?? "none");
        const resolvedSnapPoints = SNAP_PRESETS[snapKey];
        const persistentKey = v.persistent ? "demo-split" : undefined;

        if (is3Pane) {
          return (
            <SplitPreview3
              orientation={v.orientation as "horizontal" | "vertical"}
              resizerSize={v.resizerSize as number}
              disabled={v.disabled as boolean}
              collapsible={v.collapsible as boolean}
              snapPoints={resolvedSnapPoints}
              persistent={v.persistent ? "demo-split-3" : undefined}
            />
          );
        }

        return (
          <SplitPreview2
            orientation={v.orientation as "horizontal" | "vertical"}
            defaultSizes={resolvedSizes}
            minSize={v.minSize as number}
            maxSize={v.maxSize as number}
            resizerSize={v.resizerSize as number}
            disabled={v.disabled as boolean}
            collapsible={v.collapsible as boolean}
            snapPoints={resolvedSnapPoints}
            persistent={persistentKey}
          />
        );
      }}
    />
  );
}
