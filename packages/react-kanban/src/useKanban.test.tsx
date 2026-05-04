import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useKanban } from "./useKanban";
import type { KanbanColumn } from "./useKanban";

function makeColumns(): KanbanColumn[] {
  return [
    {
      id: "todo",
      title: "To Do",
      cards: [
        { id: "card-1", content: "Task one" },
        { id: "card-2", content: "Task two" },
        { id: "card-3", content: "Task three" },
      ],
    },
    {
      id: "done",
      title: "Done",
      cards: [],
    },
  ];
}

function makeDragEvent(
  overrides: Partial<DragEvent> & { currentTarget?: HTMLElement; clientY?: number } = {},
): React.DragEvent<HTMLElement> {
  return {
    preventDefault: vi.fn(),
    dataTransfer: {
      effectAllowed: "",
      dropEffect: "",
      setData: vi.fn(),
      getData: vi.fn(),
    },
    currentTarget: overrides.currentTarget ?? document.createElement("div"),
    relatedTarget: null,
    clientY: overrides.clientY ?? 0,
    ...overrides,
  } as unknown as React.DragEvent<HTMLElement>;
}

function makeColumnEl(
  cards: Array<{ id: string; top: number; height: number }>,
): HTMLElement {
  const col = document.createElement("div");
  for (const c of cards) {
    const card = document.createElement("div");
    card.dataset.cardId = c.id;
    card.dataset.columnId = "todo";
    card.getBoundingClientRect = () =>
      ({
        top: c.top,
        height: c.height,
        bottom: c.top + c.height,
        left: 0,
        right: 0,
        width: 0,
        x: 0,
        y: c.top,
        toJSON() {
          return {};
        },
      }) as DOMRect;
    col.appendChild(card);
  }
  return col;
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
    expect(result.current.dragOverIndex).toBeNull();
  });

  it("sets dragging on dragStart and clears on dragEnd", () => {
    const { result } = renderHook(() =>
      useKanban({ columns: makeColumns() }),
    );

    act(() => {
      result.current.getDragProps("card-1", "todo").onDragStart(makeDragEvent());
    });
    expect(result.current.dragging).toBe("card-1");

    act(() => {
      result.current.getDragProps("card-1", "todo").onDragEnd(makeDragEvent());
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

    expect(result.current.columns[0]?.cards).toHaveLength(2);
    expect(result.current.columns[1]?.cards).toHaveLength(1);
    expect(result.current.columns[1]?.cards[0]?.id).toBe("card-1");
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("calls onCardMove with toIndex on cross-column drop", () => {
    const onCardMove = vi.fn();
    const { result } = renderHook(() =>
      useKanban({ columns: makeColumns(), onCardMove }),
    );

    act(() => {
      result.current.getDragProps("card-1", "todo").onDragStart(makeDragEvent());
    });

    act(() => {
      result.current.getDropProps("done").onDrop(makeDragEvent());
    });

    expect(onCardMove).toHaveBeenCalledOnce();
    const call = onCardMove.mock.calls[0];
    expect(call?.[1]).toBe("todo");
    expect(call?.[2]).toBe("done");
    expect(call?.[3]).toBe(0);
  });

  it("does not move cards when disabled", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useKanban({ columns: makeColumns(), onChange, disabled: true }),
    );

    act(() => {
      result.current.getDragProps("card-1", "todo").onDragStart(makeDragEvent());
    });
    expect(result.current.dragging).toBeNull();

    act(() => {
      result.current.getDropProps("done").onDrop(makeDragEvent());
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(result.current.columns[0]?.cards).toHaveLength(3);
  });

  it("does not call onChange when dropping in same column without reorderable", () => {
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
    expect(result.current.columns[0]?.cards.map((c) => c.id)).toEqual([
      "card-1",
      "card-2",
      "card-3",
    ]);
  });

  it("reorders within column when reorderable and fires onCardReorder", () => {
    const onChange = vi.fn();
    const onCardReorder = vi.fn();
    const { result } = renderHook(() =>
      useKanban({
        columns: makeColumns(),
        onChange,
        onCardReorder,
        reorderable: true,
      }),
    );

    const target = makeColumnEl([
      { id: "card-2", top: 0, height: 30 },
      { id: "card-3", top: 40, height: 30 },
    ]);

    act(() => {
      result.current.getDragProps("card-1", "todo").onDragStart(makeDragEvent());
    });

    act(() => {
      const dropProps = result.current.getDropProps("todo");
      dropProps.onDragOver(makeDragEvent({ currentTarget: target, clientY: 100 }));
      dropProps.onDrop(makeDragEvent({ currentTarget: target, clientY: 100 }));
    });

    expect(result.current.columns[0]?.cards.map((c) => c.id)).toEqual([
      "card-2",
      "card-3",
      "card-1",
    ]);
    expect(onCardReorder).toHaveBeenCalledOnce();
    expect(onCardReorder.mock.calls[0]?.[2]).toBe(0);
    expect(onCardReorder.mock.calls[0]?.[3]).toBe(2);
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("does not reorder when targetIndex equals source index", () => {
    const onChange = vi.fn();
    const onCardReorder = vi.fn();
    const { result } = renderHook(() =>
      useKanban({
        columns: makeColumns(),
        onChange,
        onCardReorder,
        reorderable: true,
      }),
    );

    const target = makeColumnEl([
      { id: "card-1", top: 0, height: 30 },
      { id: "card-3", top: 80, height: 30 },
    ]);

    act(() => {
      result.current.getDragProps("card-2", "todo").onDragStart(makeDragEvent());
    });

    act(() => {
      result.current
        .getDropProps("todo")
        .onDrop(makeDragEvent({ currentTarget: target, clientY: 60 }));
    });

    expect(onCardReorder).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
    expect(result.current.columns[0]?.cards.map((c) => c.id)).toEqual([
      "card-1",
      "card-2",
      "card-3",
    ]);
  });

  it("rejects drop when canDrop returns false and fires onDropRejected", () => {
    const onChange = vi.fn();
    const onDropRejected = vi.fn();
    const canDrop = vi.fn(() => false);
    const { result } = renderHook(() =>
      useKanban({ columns: makeColumns(), onChange, canDrop, onDropRejected }),
    );

    act(() => {
      result.current.getDragProps("card-1", "todo").onDragStart(makeDragEvent());
    });

    act(() => {
      result.current.getDropProps("done").onDrop(makeDragEvent());
    });

    expect(canDrop).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
    expect(onDropRejected).toHaveBeenCalledOnce();
    expect(onDropRejected.mock.calls[0]?.[3]).toBe("canDrop");
    expect(result.current.rejectedColumn).toBe("done");
  });

  it("rejects drop when destination column is at wipLimit and fires onDropRejected", async () => {
    const columns: KanbanColumn[] = [
      { id: "todo", title: "To Do", cards: [{ id: "a", content: "A" }] },
      {
        id: "done",
        title: "Done",
        cards: [{ id: "b", content: "B" }],
        wipLimit: 1,
      },
    ];
    const onChange = vi.fn();
    const onDropRejected = vi.fn();
    const { result } = renderHook(() =>
      useKanban({ columns, onChange, onDropRejected }),
    );

    act(() => {
      result.current.getDragProps("a", "todo").onDragStart(makeDragEvent());
    });

    act(() => {
      result.current.getDropProps("done").onDrop(makeDragEvent());
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(onDropRejected).toHaveBeenCalledOnce();
    expect(onDropRejected.mock.calls[0]?.[3]).toBe("limit");
  });

  it("addCard appends and fires onCardAdd", () => {
    const onCardAdd = vi.fn();
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useKanban({ columns: makeColumns(), onCardAdd, onChange }),
    );

    act(() => {
      result.current.addCard("New task", "done");
    });

    expect(result.current.columns[1]?.cards).toHaveLength(1);
    expect(result.current.columns[1]?.cards[0]?.content).toBe("New task");
    expect(onCardAdd).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("removeCard removes and fires onCardRemove with the card", () => {
    const onCardRemove = vi.fn();
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useKanban({ columns: makeColumns(), onCardRemove, onChange }),
    );

    act(() => {
      result.current.removeCard("card-2", "todo");
    });

    expect(result.current.columns[0]?.cards.map((c) => c.id)).toEqual([
      "card-1",
      "card-3",
    ]);
    expect(onCardRemove).toHaveBeenCalledOnce();
    expect(onCardRemove.mock.calls[0]?.[0]?.id).toBe("card-2");
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("sets dragOver and dragOverIndex on dragOver and clears on dragLeave", () => {
    const { result } = renderHook(() =>
      useKanban({ columns: makeColumns() }),
    );

    act(() => {
      result.current.getDragProps("card-1", "todo").onDragStart(makeDragEvent());
    });

    const target = makeColumnEl([{ id: "x", top: 0, height: 30 }]);
    act(() => {
      result.current
        .getDropProps("done")
        .onDragOver(makeDragEvent({ currentTarget: target, clientY: 100 }));
    });
    expect(result.current.dragOver).toBe("done");
    expect(result.current.dragOverIndex).toBe(1);

    const outside = document.createElement("div");
    act(() => {
      result.current
        .getDropProps("done")
        .onDragLeave(
          makeDragEvent({ currentTarget: target, relatedTarget: outside }),
        );
    });
    expect(result.current.dragOver).toBeNull();
    expect(result.current.dragOverIndex).toBeNull();
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
