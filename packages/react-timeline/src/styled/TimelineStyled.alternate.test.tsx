import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TimelineStyled } from "./index";
import type { TimelineItem } from "../useTimeline";

const items: TimelineItem[] = [
  { id: "1", title: "First", status: "completed" },
  { id: "2", title: "Second", status: "active" },
  { id: "3", title: "Third" },
];

describe("TimelineStyled — align='alternate'", () => {
  it("sets data-align='alternate' on the root", () => {
    const { container } = render(
      <TimelineStyled items={items} align="alternate" />,
    );
    const root = container.querySelector(".rtl-timeline");
    expect(root).toHaveAttribute("data-align", "alternate");
  });

  it("renders all items in alternate mode", () => {
    render(<TimelineStyled items={items} align="alternate" />);
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
    expect(screen.getByText("Third")).toBeInTheDocument();
  });

  it("does not set data-align when orientation is horizontal", () => {
    const { container } = render(
      <TimelineStyled items={items} orientation="horizontal" align="alternate" />,
    );
    const root = container.querySelector(".rtl-timeline");
    expect(root).not.toHaveAttribute("data-align");
  });

  it("left/right alignments still work unchanged", () => {
    const { container: cl } = render(
      <TimelineStyled items={items} align="left" />,
    );
    expect(cl.querySelector(".rtl-timeline")).toHaveAttribute("data-align", "left");

    const { container: cr } = render(
      <TimelineStyled items={items} align="right" />,
    );
    expect(cr.querySelector(".rtl-timeline")).toHaveAttribute("data-align", "right");
  });

  it("center alignment renders correctly", () => {
    const { container } = render(
      <TimelineStyled items={items} align="center" />,
    );
    expect(container.querySelector(".rtl-timeline")).toHaveAttribute("data-align", "center");
  });
});

describe("TimelineStyled — orientation='horizontal'", () => {
  it("sets data-orientation='horizontal' on the root", () => {
    const { container } = render(
      <TimelineStyled items={items} orientation="horizontal" />,
    );
    const root = container.querySelector(".rtl-timeline");
    expect(root).toHaveAttribute("data-orientation", "horizontal");
  });

  it("renders all items in horizontal mode", () => {
    render(<TimelineStyled items={items} orientation="horizontal" />);
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
    expect(screen.getByText("Third")).toBeInTheDocument();
  });

  it("vertical orientation is the default", () => {
    const { container } = render(<TimelineStyled items={items} />);
    expect(container.querySelector(".rtl-timeline")).toHaveAttribute(
      "data-orientation",
      "vertical",
    );
  });
});

describe("TimelineStyled — progress prop", () => {
  it("sets --rtl-progress CSS variable on the root when progress is provided", () => {
    const { container } = render(
      <TimelineStyled items={items} progress={60} />,
    );
    const root = container.querySelector<HTMLElement>(".rtl-timeline");
    expect(root?.style.getPropertyValue("--rtl-progress")).toBe("60%");
  });

  it("clamps progress at 0", () => {
    const { container } = render(
      <TimelineStyled items={items} progress={-10} />,
    );
    const root = container.querySelector<HTMLElement>(".rtl-timeline");
    expect(root?.style.getPropertyValue("--rtl-progress")).toBe("0%");
  });

  it("clamps progress at 100", () => {
    const { container } = render(
      <TimelineStyled items={items} progress={150} />,
    );
    const root = container.querySelector<HTMLElement>(".rtl-timeline");
    expect(root?.style.getPropertyValue("--rtl-progress")).toBe("100%");
  });

  it("does not set style when progress is undefined", () => {
    const { container } = render(<TimelineStyled items={items} />);
    const root = container.querySelector<HTMLElement>(".rtl-timeline");
    expect(root?.style.getPropertyValue("--rtl-progress")).toBe("");
  });
});
