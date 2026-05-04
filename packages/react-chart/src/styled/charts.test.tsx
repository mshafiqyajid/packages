import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LineChart } from "./LineChart";
import { BarChart } from "./BarChart";
import { PieChart } from "./PieChart";
import type { DataPoint } from "../chartUtils";

const flat: DataPoint[] = [
  { label: "Mon", value: 10 },
  { label: "Tue", value: 25 },
  { label: "Wed", value: 18 },
];

describe("Chart loading / empty / error states", () => {
  it("LineChart renders skeleton when loading", () => {
    const { container } = render(<LineChart data={flat} loading />);
    expect(container.querySelector(".rchart-skeleton")).not.toBeNull();
    expect(container.querySelector("svg")).toBeNull();
  });

  it("BarChart renders error message", () => {
    render(<BarChart data={flat} error errorText="Boom" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Boom");
  });

  it("PieChart renders empty when data is empty", () => {
    render(<PieChart data={[]} emptyText="Nothing" />);
    expect(screen.getByLabelText("No chart data")).toHaveTextContent("Nothing");
  });
});

describe("formatValue / formatLabel", () => {
  it("BarChart applies formatValue to showValues output", () => {
    const { container } = render(
      <BarChart
        data={flat}
        showValues
        formatValue={(v) => `$${v}`}
      />,
    );
    const valueLabels = container.querySelectorAll(".rchart-bar-value");
    const texts = Array.from(valueLabels).map((el) => el.textContent);
    expect(texts).toContain("$10");
    expect(texts).toContain("$25");
  });

  it("LineChart applies formatLabel to x-axis text", () => {
    const { container } = render(
      <LineChart
        data={flat}
        showLabels
        formatLabel={(l) => l.toUpperCase()}
      />,
    );
    const labels = Array.from(container.querySelectorAll(".rchart-axis-label")).map(
      (el) => el.textContent,
    );
    expect(labels).toContain("MON");
    expect(labels).toContain("TUE");
  });
});

describe("LineChart sparkline variant", () => {
  it("disables labels/dots/legend by default in sparkline mode", () => {
    const { container } = render(<LineChart data={flat} variant="sparkline" />);
    expect(container.querySelector(".rchart-root")?.getAttribute("data-variant")).toBe("sparkline");
    expect(container.querySelectorAll(".rchart-dot")).toHaveLength(0);
    expect(container.querySelectorAll(".rchart-legend")).toHaveLength(0);
  });
});

describe("renderTooltip slot", () => {
  it("BarChart uses renderTooltip when provided", async () => {
    const user = userEvent.setup();
    const renderTooltip = vi.fn(({ value }: { value: number }) => (
      <span className="custom-tip">Value is {value}</span>
    ));
    const { container } = render(
      <BarChart data={flat} renderTooltip={renderTooltip} />,
    );
    const bar = container.querySelector(".rchart-bar");
    expect(bar).not.toBeNull();
    await user.hover(bar as Element);
    expect(renderTooltip).toHaveBeenCalled();
    expect(container.querySelector(".custom-tip")).not.toBeNull();
  });
});

describe("PieChart hoverOffset / selectedIndex", () => {
  it("applies translate transform to selected slice", () => {
    const { container } = render(
      <PieChart data={flat} selectedIndex={0} selectedOffset={12} />,
    );
    const selected = container.querySelector('.rchart-slice[data-selected="true"]');
    expect(selected).not.toBeNull();
    const transform = selected?.getAttribute("transform");
    expect(transform).toMatch(/translate/);
  });

  it("toggles selection on click via onSelectedChange", async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    const { container } = render(
      <PieChart data={flat} onSelectedChange={onSelectedChange} />,
    );
    const slice = container.querySelector(".rchart-slice");
    expect(slice).not.toBeNull();
    await user.click(slice as Element);
    expect(onSelectedChange).toHaveBeenCalledWith(0);
  });
});

describe("colorScheme", () => {
  it("BarChart uses warm palette when colorScheme='warm'", () => {
    const { container } = render(<BarChart data={flat} colorScheme="warm" />);
    const bars = container.querySelectorAll(".rchart-bar");
    expect(bars.length).toBeGreaterThan(0);
    const fill = (bars[0] as SVGElement).getAttribute("fill");
    expect(fill).toBe("#ef4444");
  });
});
