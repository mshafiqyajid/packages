import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi, beforeAll, afterAll } from "vitest";
import { TabsStyled } from "./TabsStyled";

const manyTabs = [
  { value: "a", label: "Alpha",   content: <div>A</div> },
  { value: "b", label: "Beta",    content: <div>B</div> },
  { value: "c", label: "Gamma",   content: <div>C</div> },
  { value: "d", label: "Delta",   content: <div>D</div> },
  { value: "e", label: "Epsilon", content: <div>E</div> },
  { value: "f", label: "Zeta",    content: <div>F</div> },
];

let origScrollWidth: PropertyDescriptor | undefined;
let origClientWidth: PropertyDescriptor | undefined;
let origScrollIntoView: typeof HTMLElement.prototype.scrollIntoView;

beforeAll(() => {
  origScrollWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollWidth");
  origClientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");
  origScrollIntoView = HTMLElement.prototype.scrollIntoView;

  Object.defineProperty(HTMLElement.prototype, "scrollWidth", { configurable: true, get: () => 800 });
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 300 });
  HTMLElement.prototype.scrollIntoView = vi.fn();
});

afterAll(() => {
  if (origScrollWidth) Object.defineProperty(HTMLElement.prototype, "scrollWidth", origScrollWidth);
  if (origClientWidth) Object.defineProperty(HTMLElement.prototype, "clientWidth", origClientWidth);
  HTMLElement.prototype.scrollIntoView = origScrollIntoView;
});

describe("TabsStyled — scrollable", () => {
  test("renders left and right scroll buttons when scrollable=true", () => {
    const { container } = render(<TabsStyled tabs={manyTabs} defaultValue="a" scrollable />);
    expect(container.querySelector(".rtab-scroll-btn--left")).toBeInTheDocument();
    expect(container.querySelector(".rtab-scroll-btn--right")).toBeInTheDocument();
  });

  test("does not render scroll buttons when scrollable=false", () => {
    const { container } = render(<TabsStyled tabs={manyTabs} defaultValue="a" />);
    expect(container.querySelector(".rtab-scroll-btn--left")).not.toBeInTheDocument();
    expect(container.querySelector(".rtab-scroll-btn--right")).not.toBeInTheDocument();
  });

  test("scroll buttons have rtab-scroll-btn class", () => {
    const { container } = render(<TabsStyled tabs={manyTabs} defaultValue="a" scrollable />);
    const left = container.querySelector(".rtab-scroll-btn--left")!;
    const right = container.querySelector(".rtab-scroll-btn--right")!;
    expect(left.className).toContain("rtab-scroll-btn");
    expect(left.className).toContain("rtab-scroll-btn--left");
    expect(right.className).toContain("rtab-scroll-btn");
    expect(right.className).toContain("rtab-scroll-btn--right");
  });

  test("tab list has data-scrollable attribute when scrollable=true", () => {
    render(<TabsStyled tabs={manyTabs} defaultValue="a" scrollable />);
    const list = screen.getByRole("tablist");
    expect(list).toHaveAttribute("data-scrollable");
  });

  test("tab list does not have data-scrollable when scrollable=false", () => {
    render(<TabsStyled tabs={manyTabs} defaultValue="a" />);
    const list = screen.getByRole("tablist");
    expect(list).not.toHaveAttribute("data-scrollable");
  });
});

describe("TabsStyled — activationMode", () => {
  test("activationMode prop is accepted without errors", () => {
    const onChange = vi.fn();
    expect(() =>
      render(<TabsStyled tabs={manyTabs} defaultValue="a" activationMode="manual" onChange={onChange} />)
    ).not.toThrow();
  });

  test("activationMode=automatic activates on arrow key", () => {
    const onChange = vi.fn();
    render(<TabsStyled tabs={manyTabs} defaultValue="a" activationMode="automatic" onChange={onChange} />);
    const tabA = screen.getByRole("tab", { name: "Alpha" });
    tabA.focus();
    fireEvent.keyDown(tabA, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith("b", "keyboard");
  });

  test("activationMode=manual does not activate on arrow key alone", () => {
    const onChange = vi.fn();
    render(<TabsStyled tabs={manyTabs} defaultValue="a" activationMode="manual" onChange={onChange} />);
    const tabA = screen.getByRole("tab", { name: "Alpha" });
    tabA.focus();
    fireEvent.keyDown(tabA, { key: "ArrowRight" });
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("TabsStyled — reorderable", () => {
  test("reorderable=true + onReorder receives fromIndex and toIndex", () => {
    const onReorder = vi.fn();
    render(
      <TabsStyled
        tabs={manyTabs}
        defaultValue="a"
        reorderable
        onReorder={onReorder}
      />
    );
    const tabA = screen.getByRole("tab", { name: "Alpha" });
    const tabC = screen.getByRole("tab", { name: "Gamma" });

    fireEvent.dragStart(tabA);
    fireEvent.dragOver(tabC);
    fireEvent.drop(tabC);

    expect(onReorder).toHaveBeenCalledWith(0, 2);
  });

  test("sortable=true + onReorder receives values array", () => {
    const onReorder = vi.fn();
    render(
      <TabsStyled
        tabs={manyTabs}
        defaultValue="a"
        sortable
        onReorder={onReorder}
      />
    );
    const tabA = screen.getByRole("tab", { name: "Alpha" });
    const tabB = screen.getByRole("tab", { name: "Beta" });

    fireEvent.dragStart(tabA);
    fireEvent.dragOver(tabB);
    fireEvent.drop(tabB);

    expect(onReorder).toHaveBeenCalledWith(["b", "a", "c", "d", "e", "f"]);
  });
});
