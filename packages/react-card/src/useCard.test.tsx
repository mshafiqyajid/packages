import { renderHook, act } from "@testing-library/react";
import { useCard } from "./useCard";

describe("useCard", () => {
  it("isSelected starts false by default", () => {
    const { result } = renderHook(() => useCard({ clickable: true }));
    expect(result.current.isSelected).toBe(false);
  });

  it("onClick is called when clicked (clickable=true)", () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useCard({ clickable: true, onClick }));
    act(() => {
      result.current.cardProps.onClick?.({} as React.MouseEvent);
    });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("Enter key triggers onClick when clickable", () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useCard({ clickable: true, onClick }));
    act(() => {
      result.current.cardProps.onKeyDown?.({
        key: "Enter",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("Space key triggers onClick when clickable", () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useCard({ clickable: true, onClick }));
    act(() => {
      result.current.cardProps.onKeyDown?.({
        key: " ",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("onClick is NOT called when disabled", () => {
    const onClick = vi.fn();
    const { result } = renderHook(() =>
      useCard({ clickable: true, disabled: true, onClick })
    );
    act(() => {
      result.current.cardProps.onClick?.({} as React.MouseEvent);
    });
    expect(onClick).not.toHaveBeenCalled();
  });

  it("cardProps.role is 'button' when clickable (and no href context)", () => {
    const { result } = renderHook(() => useCard({ clickable: true }));
    expect(result.current.cardProps.role).toBe("button");
  });

  it("controlled selected prop: isSelected follows prop", () => {
    const { result, rerender } = renderHook(
      ({ selected }: { selected: boolean }) => useCard({ clickable: true, selected }),
      { initialProps: { selected: false } }
    );
    expect(result.current.isSelected).toBe(false);
    rerender({ selected: true });
    expect(result.current.isSelected).toBe(true);
  });

  it("aria-pressed matches isSelected when selected and clickable", () => {
    const { result } = renderHook(() =>
      useCard({ clickable: true, selected: true })
    );
    expect(result.current.cardProps["aria-pressed"]).toBe(true);
  });

  it("aria-disabled is true when disabled", () => {
    const { result } = renderHook(() =>
      useCard({ clickable: true, disabled: true })
    );
    expect(result.current.cardProps["aria-disabled"]).toBe(true);
  });
});
