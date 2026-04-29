import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useKanban } from "./useKanban";
import type { KanbanColumn } from "./useKanban";

const baseColumns: KanbanColumn[] = [
  {
    id: "todo",
    title: "To Do",
    cards: [
      { id: "card-1", content: "Task one" },
      { id: "card-2", content: "Task two" },
    ],
  },
  {
    id: "done",
    title: "Done",
    cards: [],
  },
];

function makeColumns(): KanbanColumn[] {
  return [
    {
      id: "todo",
      title: "To Do",
      cards: [
        { id: "card-1", content: "Task one" },
        { id: "card-2", content: "Task two" },
      ],
    },
    {
      id: "done",
      title: "Done",
      cards: [],
    },
  ];
}

function makeDragEvent(overrides: Partial<DragEvent> = {}): React.DragEvent<HTMLElement> {
  return {
    preventDefault: vi.fn(),
    dataTransfer: {
      effectAllowed: "",
      dropEffect: "",
      setData: vi.fn(),
      getData: vi.fn(),
    },
    currentTarget: document.createElement("div"),
    relatedTarget: null,
    ...overrides,
  } as unknown as React.DragEvent<HTMLElement>;
}

describe("useKanban", () => {
  it("returns initial columns", () => {
    const { result } = renderHook(() =>
      useKanban({ columns: makeColumns() }),
    );
    expect(result.current.columns).toHaveLength(2);
    expect(result.current.columns[0]?.id).toBe("todo");
    expect(result.current.columns[1]?.id).toBe("done");
  });

  it("starts with no dragging or dragOver state", () => {
    const { result } = renderHook(() =>
      useKanban({ columns: makeColumns() }),
    );
    expect(result.current.dragging).toBeNull();
    expect(result.current.dragOver).toBeNull();
  });

  it("sets dragging on dragStart and clears on dragEnd", () => {
    const { result } = renderHook(() =>
      useKanban({ columns: makeColumns() }),
    );

    act(() => {
      const dragProps = result.current.getDragProps("card-1", "todo");
      dragProps.onDragStart(makeDragEvent());
    });
    expect(result.current.dragging).toBe("card-1");

    act(() => {
      const dragProps = result.current.getDragProps("card-1", "todo");
      dragProps.onDragEnd(makeDragEvent());
    });
    expect(result.current.dragging).toBeNull();
  });

  it("moves a card from one column to another and calls onChange", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useKanban({ columns: makeColumns(), onChange }),
    );

    act(() => {
      result.current.getDragProps("card-1", "todo").onDragStart(makeDragEvent());
    });

    act(() => {
      const dropProps = result.current.getDropProps("done");
      dropProps.onDragOver(makeDragEvent());
      dropProps.onDrop(makeDragEvent());
    });

    expect(result.current.columns[0]?.cards).toHaveLength(1);
    expect(result.current.columns[1]?.cards).toHaveLength(1);
    expect(result.current.columns[1]?.cards[0]?.id).toBe("card-1");
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("does not move cards when disabled", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useKanban({ columns: makeColumns(), onChange, disabled: true }),
    );

    act(() => {
      const dragProps = result.current.getDragProps("card-1", "todo");
      const prevented = vi.fn();
      dragProps.onDragStart(makeDragEvent({ preventDefault: prevented }));
    });
    expect(result.current.dragging).toBeNull();

    act(() => {
      result.current.getDropProps("done").onDrop(makeDragEvent());
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(result.current.columns[0]?.cards).toHaveLength(2);
  });

  it("does not call onChange when dropping in the same column", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useKanban({ columns: makeColumns(), onChange }),
    );

    act(() => {
      result.current.getDragProps("card-1", "todo").onDragStart(makeDragEvent());
    });

    act(() => {
      result.current.getDropProps("todo").onDrop(makeDragEvent());
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(result.current.columns[0]?.cards).toHaveLength(2);
  });

  it("sets dragOver on onDragOver and clears on onDragLeave", () => {
    const { result } = renderHook(() =>
      useKanban({ columns: makeColumns() }),
    );

    act(() => {
      result.current.getDragProps("card-1", "todo").onDragStart(makeDragEvent());
    });

    act(() => {
      result.current.getDropProps("done").onDragOver(makeDragEvent());
    });
    expect(result.current.dragOver).toBe("done");

    const container = document.createElement("div");
    const outside = document.createElement("div");
    act(() => {
      result.current
        .getDropProps("done")
        .onDragLeave(
          makeDragEvent({ currentTarget: container, relatedTarget: outside }),
        );
    });
    expect(result.current.dragOver).toBeNull();
  });

  it("getDragProps marks element as draggable when not disabled", () => {
    const { result } = renderHook(() =>
      useKanban({ columns: makeColumns() }),
    );
    const props = result.current.getDragProps("card-1", "todo");
    expect(props.draggable).toBe(true);
    expect(props["data-card-id"]).toBe("card-1");
    expect(props["data-column-id"]).toBe("todo");
  });

  it("getDragProps sets draggable false when disabled", () => {
    const { result } = renderHook(() =>
      useKanban({ columns: makeColumns(), disabled: true }),
    );
    const props = result.current.getDragProps("card-1", "todo");
    expect(props.draggable).toBe(false);
  });
});
