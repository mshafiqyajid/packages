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

describe("useKanban", () => {
  it("returns the initial columns when controlled", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useKanban({ columns: makeColumns(), onChange }),
    );
    expect(result.current.columns[0]?.cards).toHaveLength(3);
    expect(result.current.columns[1]?.cards).toHaveLength(0);
  });

  it("supports uncontrolled mode via defaultColumns", () => {
    const { result } = renderHook(() =>
      useKanban({ defaultColumns: makeColumns() }),
    );
    expect(result.current.columns[0]?.cards).toHaveLength(3);
    act(() => {
      result.current.addCard("Hello", "todo");
    });
    expect(result.current.columns[0]?.cards).toHaveLength(4);
  });

  it("addCard appends to bottom by default and prepends with addCardPosition top", () => {
    const onChange = vi.fn();
    const initialProps: { pos: "top" | "bottom" } = { pos: "bottom" };
    const { result, rerender } = renderHook(
      ({ pos }: { pos: "top" | "bottom" }) =>
        useKanban({
          defaultColumns: makeColumns(),
          onChange,
          addCardPosition: pos,
        }),
      { initialProps },
    );

    act(() => result.current.addCard("Bottom", "todo"));
    expect(
      result.current.columns[0]?.cards[result.current.columns[0]!.cards.length - 1]
        ?.content,
    ).toBe("Bottom");

    rerender({ pos: "top" });
    act(() => result.current.addCard("Top", "todo"));
    expect(result.current.columns[0]?.cards[0]?.content).toBe("Top");
  });

  it("removeCard fires onCardRemove and updates state", () => {
    const onCardRemove = vi.fn();
    const { result } = renderHook(() =>
      useKanban({ defaultColumns: makeColumns(), onCardRemove }),
    );
    act(() => result.current.removeCard("card-2", "todo"));
    expect(result.current.columns[0]?.cards.map((c) => c.id)).toEqual([
      "card-1",
      "card-3",
    ]);
    expect(onCardRemove).toHaveBeenCalledOnce();
  });

  it("moveCard moves between columns and fires onCardMove", () => {
    const onCardMove = vi.fn();
    const { result } = renderHook(() =>
      useKanban({ defaultColumns: makeColumns(), onCardMove }),
    );
    act(() => result.current.moveCard("card-1", "todo", "done", 0));
    expect(result.current.columns[1]?.cards.map((c) => c.id)).toEqual(["card-1"]);
    expect(result.current.columns[0]?.cards.map((c) => c.id)).toEqual([
      "card-2",
      "card-3",
    ]);
    expect(onCardMove).toHaveBeenCalledOnce();
  });

  it("reorderColumn moves columns and fires onColumnReorder", () => {
    const onColumnReorder = vi.fn();
    const { result } = renderHook(() =>
      useKanban({ defaultColumns: makeColumns(), onColumnReorder }),
    );
    act(() => result.current.reorderColumn("done", 0));
    expect(result.current.columns.map((c) => c.id)).toEqual(["done", "todo"]);
    expect(onColumnReorder).toHaveBeenCalledWith("done", 1, 0);
  });

  it("canDrop=false rejects moves and emits onDropRejected with reason canDrop", () => {
    const onDropRejected = vi.fn();
    const { result } = renderHook(() =>
      useKanban({
        defaultColumns: makeColumns(),
        canDrop: () => false,
        onDropRejected,
      }),
    );
    act(() => result.current.moveCard("card-1", "todo", "done", 0));
    expect(result.current.columns[0]?.cards).toHaveLength(3);
    expect(onDropRejected).toHaveBeenCalledOnce();
    expect(onDropRejected.mock.calls[0]?.[3]).toBe("canDrop");
  });

  it("respects column wipLimit and emits onDropRejected with reason limit", () => {
    const onDropRejected = vi.fn();
    const cols: KanbanColumn[] = [
      {
        id: "a",
        title: "A",
        cards: [{ id: "x", content: "x" }],
      },
      {
        id: "b",
        title: "B",
        cards: [{ id: "y", content: "y" }],
        wipLimit: 1,
      },
    ];
    const { result } = renderHook(() =>
      useKanban({ defaultColumns: cols, onDropRejected }),
    );
    act(() => result.current.moveCard("x", "a", "b", 0));
    expect(result.current.columns[1]?.cards).toHaveLength(1);
    expect(onDropRejected.mock.calls[0]?.[3]).toBe("limit");
  });

  it("rejects drops on locked columns with reason locked", () => {
    const onDropRejected = vi.fn();
    const cols: KanbanColumn[] = [
      { id: "a", title: "A", cards: [{ id: "x", content: "x" }] },
      { id: "b", title: "B", cards: [], locked: true },
    ];
    const { result } = renderHook(() =>
      useKanban({ defaultColumns: cols, onDropRejected }),
    );
    act(() => result.current.moveCard("x", "a", "b", 0));
    expect(result.current.columns[1]?.cards).toHaveLength(0);
    expect(onDropRejected.mock.calls[0]?.[3]).toBe("locked");
  });

  it("toggleSelect with single replaces selection", () => {
    const { result } = renderHook(() =>
      useKanban({ defaultColumns: makeColumns() }),
    );
    act(() => result.current.toggleSelect("card-1", "single"));
    expect(result.current.selection).toEqual(["card-1"]);
    act(() => result.current.toggleSelect("card-2", "single"));
    expect(result.current.selection).toEqual(["card-2"]);
  });

  it("toggleSelect with toggle adds/removes ids", () => {
    const { result } = renderHook(() =>
      useKanban({ defaultColumns: makeColumns() }),
    );
    act(() => result.current.toggleSelect("card-1", "toggle"));
    act(() => result.current.toggleSelect("card-2", "toggle"));
    expect(result.current.selection).toEqual(["card-1", "card-2"]);
    act(() => result.current.toggleSelect("card-1", "toggle"));
    expect(result.current.selection).toEqual(["card-2"]);
  });

  it("toggleSelect with range selects between anchor and target in same column", () => {
    const { result } = renderHook(() =>
      useKanban({ defaultColumns: makeColumns() }),
    );
    act(() => result.current.toggleSelect("card-1", "single"));
    act(() => result.current.toggleSelect("card-3", "range"));
    expect(result.current.selection.sort()).toEqual([
      "card-1",
      "card-2",
      "card-3",
    ]);
  });

  it("clearSelection empties the selection", () => {
    const { result } = renderHook(() =>
      useKanban({ defaultColumns: makeColumns() }),
    );
    act(() => result.current.toggleSelect("card-1", "single"));
    expect(result.current.selection).toHaveLength(1);
    act(() => result.current.clearSelection());
    expect(result.current.selection).toHaveLength(0);
  });

  it("disabled mode does not call onCardAdd through addCard helper (helper is a writer; disabled gates UI)", () => {
    const onCardAdd = vi.fn();
    const { result } = renderHook(() =>
      useKanban({
        defaultColumns: makeColumns(),
        disabled: true,
        onCardAdd,
      }),
    );
    act(() => result.current.addCard("Still works programmatically", "todo"));
    expect(onCardAdd).toHaveBeenCalledOnce();
  });

  it("getCardProps returns ref and ARIA attributes", () => {
    const { result } = renderHook(() =>
      useKanban({ defaultColumns: makeColumns() }),
    );
    const props = result.current.getCardProps("card-1", "todo");
    expect(props.role).toBe("button");
    expect(props.tabIndex).toBe(0);
    expect(props["data-card-id"]).toBe("card-1");
    expect(props["data-column-id"]).toBe("todo");
    expect(typeof props.onPointerDown).toBe("function");
    expect(typeof props.onKeyDown).toBe("function");
  });

  it("addCard with object includes priority/tags/dueDate", () => {
    const { result } = renderHook(() =>
      useKanban({ defaultColumns: makeColumns() }),
    );
    act(() =>
      result.current.addCard(
        {
          content: "Rich card",
          priority: "high",
          tags: ["a", "b"],
          dueDate: "2026-06-01",
        },
        "done",
      ),
    );
    const newCard = result.current.columns[1]?.cards[0];
    expect(newCard?.content).toBe("Rich card");
    expect(newCard?.priority).toBe("high");
    expect(newCard?.tags).toEqual(["a", "b"]);
    expect(newCard?.dueDate).toBe("2026-06-01");
  });
});
