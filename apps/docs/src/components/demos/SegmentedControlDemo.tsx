import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { SegmentedControlStyled } from "@mshafiqyajid/react-segmented-control/styled";
import "@mshafiqyajid/react-segmented-control/styles.css";

const SIMPLE_OPTIONS = ["Day", "Week", "Month", "Year"];

const BADGED_OPTIONS = [
  { value: "All",      label: "All" },
  { value: "Active",   label: "Active",   badge: 3 },
  { value: "Pending",  label: "Pending",  badge: 12 },
  { value: "Archived", label: "Archived" },
];

const MANY_OPTIONS = [
  "Quarter", "Year", "All time", "Last 7 days", "Last 30 days", "Last 90 days", "Custom",
];

export default function SegmentedControlDemo() {
  const [value, setValue] = useState("Week");

  return (
    <PropPlayground
      componentName="SegmentedControlStyled"
      importLine={`import { SegmentedControlStyled } from "@mshafiqyajid/react-segmented-control/styled";\nimport "@mshafiqyajid/react-segmented-control/styles.css";`}
      props={[
        { name: "variant",     group: "Appearance", control: { type: "segmented", options: ["solid","pill","underline"] as const },            defaultValue: "solid",  omitWhen: "solid" },
        { name: "size",        group: "Appearance", control: { type: "segmented", options: ["sm","md","lg"] as const },                        defaultValue: "md",     omitWhen: "md" },
        { name: "tone",        group: "Appearance", control: { type: "segmented", options: ["neutral","primary","success","danger"] as const },defaultValue: "primary",omitWhen: "primary" },
        { name: "fullWidth",   group: "Layout",     control: { type: "toggle" },                                                               defaultValue: false,    omitWhen: false },
        { name: "withBadges",  group: "Display",    label: "badge per segment",  control: { type: "toggle" },                                  defaultValue: false,    omitWhen: false },
        { name: "scrollable",  group: "Display",    label: "scrollable overflow", control: { type: "toggle" },                                  defaultValue: false,    omitWhen: false },
        { name: "equalize",    group: "Display",    label: "equalize widths",    control: { type: "toggle" },                                  defaultValue: false,    omitWhen: false },
        { name: "disabled",    group: "State",      control: { type: "toggle" },                                                               defaultValue: false,    omitWhen: false },
      ]}
      staticProps={{ options: '[…]', value: "{value}", onChange: "{setValue}" }}
      render={(v) => {
        const isScrollable = v.scrollable as boolean;
        const useBadges = v.withBadges as boolean;
        const options: typeof BADGED_OPTIONS | string[] =
          isScrollable ? MANY_OPTIONS : useBadges ? BADGED_OPTIONS : SIMPLE_OPTIONS;
        const initialValue =
          isScrollable ? "Year" : useBadges ? "Active" : "Week";
        const ctlValue = isScrollable || useBadges ? initialValue : value;
        const onChange = isScrollable || useBadges ? () => {} : setValue;

        return (
          <div style={{ width: "100%", maxWidth: 380 }}>
            <SegmentedControlStyled
              key={`${v.scrollable}-${v.withBadges}-${v.equalize}`}
              options={options as string[]}
              value={ctlValue}
              onChange={onChange}
              variant={v.variant as "solid"|"pill"|"underline"}
              size={v.size as "sm"|"md"|"lg"}
              tone={v.tone as "neutral"|"primary"|"success"|"danger"}
              fullWidth={v.fullWidth as boolean}
              disabled={v.disabled as boolean}
              scrollable={isScrollable}
              equalize={v.equalize as boolean}
              label="Time range"
            />
          </div>
        );
      }}
    />
  );
}
