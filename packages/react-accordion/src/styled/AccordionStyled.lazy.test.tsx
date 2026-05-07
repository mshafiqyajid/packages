import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AccordionStyled } from "./AccordionStyled";

describe("AccordionStyled — lazy prop", () => {
  it("with lazy=false (default), content mounts immediately", () => {
    render(
      <AccordionStyled
        items={[{ title: "Item A", content: "Eager content" }]}
        animated={false}
      />,
    );
    expect(screen.getByText("Eager content")).toBeInTheDocument();
  });

  it("with lazy=true, content does not mount before first open", () => {
    render(
      <AccordionStyled
        lazy
        items={[{ title: "Item A", content: "Lazy content" }]}
        animated={false}
      />,
    );
    expect(screen.queryByText("Lazy content")).not.toBeInTheDocument();
  });

  it("with lazy=true, content mounts after first open", async () => {
    const user = userEvent.setup();
    render(
      <AccordionStyled
        lazy
        items={[{ title: "Item A", content: "Lazy content" }]}
        animated={false}
      />,
    );
    await user.click(screen.getByText("Item A"));
    expect(screen.getByText("Lazy content")).toBeInTheDocument();
  });

  it("with lazy=true, content remains mounted after collapse", async () => {
    const user = userEvent.setup();
    render(
      <AccordionStyled
        lazy
        items={[{ title: "Item A", content: "Stays mounted" }]}
        animated={false}
      />,
    );
    await user.click(screen.getByText("Item A"));
    expect(screen.getByText("Stays mounted")).toBeInTheDocument();
    await user.click(screen.getByText("Item A"));
    expect(screen.getByText("Stays mounted")).toBeInTheDocument();
  });

  it("forceMount per-item overrides lazy and always mounts content", () => {
    render(
      <AccordionStyled
        lazy
        items={[
          { title: "Item A", content: "Force mounted", forceMount: true },
          { title: "Item B", content: "Lazy item" },
        ]}
        animated={false}
      />,
    );
    expect(screen.getByText("Force mounted")).toBeInTheDocument();
    expect(screen.queryByText("Lazy item")).not.toBeInTheDocument();
  });

  it("expensive child component only renders after first expand when lazy=true", async () => {
    const mountSpy = vi.fn();
    function Expensive() {
      mountSpy();
      return <span>Expensive</span>;
    }
    const user = userEvent.setup();
    render(
      <AccordionStyled
        lazy
        items={[{ title: "Open me", content: <Expensive /> }]}
        animated={false}
      />,
    );
    expect(mountSpy).not.toHaveBeenCalled();
    await user.click(screen.getByText("Open me"));
    expect(mountSpy).toHaveBeenCalledTimes(1);
    await user.click(screen.getByText("Open me"));
    expect(mountSpy).toHaveBeenCalledTimes(1);
  });

  it("multiple items each have independent lazy mount state", async () => {
    const user = userEvent.setup();
    render(
      <AccordionStyled
        lazy
        type="multiple"
        items={[
          { title: "Alpha", content: "Alpha content" },
          { title: "Beta", content: "Beta content" },
        ]}
        animated={false}
      />,
    );
    expect(screen.queryByText("Alpha content")).not.toBeInTheDocument();
    expect(screen.queryByText("Beta content")).not.toBeInTheDocument();
    await user.click(screen.getByText("Alpha"));
    expect(screen.getByText("Alpha content")).toBeInTheDocument();
    expect(screen.queryByText("Beta content")).not.toBeInTheDocument();
    await user.click(screen.getByText("Beta"));
    expect(screen.getByText("Beta content")).toBeInTheDocument();
  });
});
