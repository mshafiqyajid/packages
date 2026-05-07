import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AccordionStyled } from "./AccordionStyled";

const nestedItems = [
  {
    title: "Outer A",
    content: (
      <AccordionStyled
        items={[
          { title: "Inner 1", content: "Inner content 1" },
          { title: "Inner 2", content: "Inner content 2" },
        ]}
        type="single"
        animated={false}
      />
    ),
  },
  { title: "Outer B", content: "Outer B content" },
];

describe("AccordionStyled — nested", () => {
  it("renders nested accordion inside parent panel without crashing", () => {
    render(
      <AccordionStyled items={nestedItems} type="single" animated={false} />,
    );
    expect(screen.getByText("Outer A")).toBeInTheDocument();
    expect(screen.getByText("Outer B")).toBeInTheDocument();
  });

  it("expanding outer item reveals inner accordion triggers in the DOM", async () => {
    const user = userEvent.setup();
    render(
      <AccordionStyled items={nestedItems} type="single" animated={false} />,
    );
    await user.click(screen.getByText("Outer A"));
    expect(screen.getByText("Inner 1")).toBeInTheDocument();
    expect(screen.getByText("Inner 2")).toBeInTheDocument();
  });

  it("inner accordion open/close is independent of outer", async () => {
    const user = userEvent.setup();
    render(
      <AccordionStyled items={nestedItems} type="single" animated={false} />,
    );
    await user.click(screen.getByText("Outer A"));
    await user.click(screen.getByText("Inner 1"));
    expect(screen.getByText("Inner content 1")).toBeInTheDocument();
    await user.click(screen.getByText("Outer B"));
    expect(screen.getByText("Outer B content")).toBeInTheDocument();
    const outerAPanel = screen.getByRole("region", { name: "Outer A" });
    expect(outerAPanel).toHaveAttribute("data-state", "closed");
    const outerBPanel = screen.getByRole("region", { name: "Outer B" });
    expect(outerBPanel).toHaveAttribute("data-state", "open");
  });

  it("inner trigger has correct aria-controls pointing to inner panel", async () => {
    const user = userEvent.setup();
    render(
      <AccordionStyled items={nestedItems} type="single" animated={false} />,
    );
    await user.click(screen.getByText("Outer A"));
    const innerTrigger = screen.getByRole("button", { name: "Inner 1" });
    const controlsId = innerTrigger.getAttribute("aria-controls");
    expect(controlsId).not.toBeNull();
    const innerPanel = document.getElementById(controlsId!);
    expect(innerPanel).not.toBeNull();
    expect(innerPanel?.getAttribute("role")).toBe("region");
  });

  it("inner panel aria-controls ID is different from outer panel ID", async () => {
    const user = userEvent.setup();
    render(
      <AccordionStyled items={nestedItems} type="single" animated={false} />,
    );
    await user.click(screen.getByText("Outer A"));
    const outerTrigger = screen.getByRole("button", { name: "Outer A" });
    const innerTrigger = screen.getByRole("button", { name: "Inner 1" });
    expect(outerTrigger.getAttribute("aria-controls")).not.toBe(
      innerTrigger.getAttribute("aria-controls"),
    );
  });

  it("keyboard navigation is scoped — ArrowDown inside inner accordion does not leak to outer", async () => {
    const user = userEvent.setup();
    render(
      <AccordionStyled items={nestedItems} type="single" animated={false} />,
    );
    await user.click(screen.getByText("Outer A"));
    const inner1 = screen.getByRole("button", { name: "Inner 1" });
    inner1.focus();
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Inner 2" }));
  });

  it("outer accordion collapses correctly — outer panel data-state becomes closed", async () => {
    const user = userEvent.setup();
    render(
      <AccordionStyled items={nestedItems} type="single" animated={false} />,
    );
    await user.click(screen.getByText("Outer A"));
    await user.click(screen.getByText("Inner 1"));
    await user.click(screen.getByText("Outer A"));
    const outerAPanel = screen.getByRole("region", { name: "Outer A" });
    expect(outerAPanel).toHaveAttribute("data-state", "closed");
    expect(outerAPanel).not.toHaveAttribute("data-open");
  });
});
