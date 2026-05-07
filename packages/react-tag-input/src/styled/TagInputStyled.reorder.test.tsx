import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TagInputStyled } from "./TagInputStyled";

function makeDragEvent(type: string): Partial<DragEvent> {
  return { preventDefault: vi.fn() } as Partial<DragEvent>;
}

describe("TagInputStyled — drag-to-reorder (reorderable prop)", () => {
  it("renders tags as draggable when reorderable=true", () => {
    render(
      <TagInputStyled
        value={["alpha", "beta", "gamma"]}
        onChange={() => {}}
        reorderable
      />,
    );
    const tags = screen.getAllByText(/alpha|beta|gamma/).map((el) => el.closest(".rti-tag")!);
    tags.forEach((tag) => {
      expect(tag).toHaveAttribute("draggable", "true");
    });
  });

  it("tags are NOT draggable when reorderable is omitted", () => {
    render(
      <TagInputStyled
        value={["alpha", "beta"]}
        onChange={() => {}}
      />,
    );
    const tags = document.querySelectorAll(".rti-tag");
    tags.forEach((tag) => {
      expect(tag).not.toHaveAttribute("draggable", "true");
    });
  });

  it("adds rti-tag--dragging class to the dragged tag", () => {
    render(
      <TagInputStyled
        value={["alpha", "beta", "gamma"]}
        onChange={() => {}}
        reorderable
      />,
    );
    const tagEls = document.querySelectorAll(".rti-tag");
    const first = tagEls[0]!;
    fireEvent.dragStart(first);
    expect(first).toHaveClass("rti-tag--dragging");
  });

  it("adds rti-tag--drop-target class to the hovered tag on dragOver", () => {
    render(
      <TagInputStyled
        value={["alpha", "beta", "gamma"]}
        onChange={() => {}}
        reorderable
      />,
    );
    const tagEls = document.querySelectorAll(".rti-tag");
    fireEvent.dragStart(tagEls[0]!);
    fireEvent.dragOver(tagEls[2]!, { preventDefault: () => {} });
    expect(tagEls[2]).toHaveClass("rti-tag--drop-target");
  });

  it("calls onChange with reordered tags on drop", () => {
    const onChange = vi.fn();
    render(
      <TagInputStyled
        value={["alpha", "beta", "gamma"]}
        onChange={onChange}
        reorderable
      />,
    );
    const tagEls = document.querySelectorAll(".rti-tag");
    fireEvent.dragStart(tagEls[0]!);
    fireEvent.dragOver(tagEls[2]!, { preventDefault: () => {} });
    fireEvent.drop(tagEls[2]!, { preventDefault: () => {} });
    expect(onChange).toHaveBeenCalledWith(["beta", "gamma", "alpha"]);
  });

  it("calls onReorder callback after drop", () => {
    const onChange = vi.fn();
    const onReorder = vi.fn();
    render(
      <TagInputStyled
        value={["alpha", "beta", "gamma"]}
        onChange={onChange}
        onReorder={onReorder}
        reorderable
      />,
    );
    const tagEls = document.querySelectorAll(".rti-tag");
    fireEvent.dragStart(tagEls[0]!);
    fireEvent.dragOver(tagEls[1]!, { preventDefault: () => {} });
    fireEvent.drop(tagEls[1]!, { preventDefault: () => {} });
    expect(onReorder).toHaveBeenCalledWith(["beta", "alpha", "gamma"]);
  });

  it("no-ops when dropping on the same tag", () => {
    const onChange = vi.fn();
    render(
      <TagInputStyled
        value={["alpha", "beta"]}
        onChange={onChange}
        reorderable
      />,
    );
    const tagEls = document.querySelectorAll(".rti-tag");
    fireEvent.dragStart(tagEls[0]!);
    fireEvent.drop(tagEls[0]!, { preventDefault: () => {} });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("legacy sortable prop still enables drag", () => {
    render(
      <TagInputStyled
        value={["x", "y"]}
        onChange={() => {}}
        sortable
      />,
    );
    const tags = document.querySelectorAll(".rti-tag");
    tags.forEach((tag) => {
      expect(tag).toHaveAttribute("draggable", "true");
    });
  });
});
