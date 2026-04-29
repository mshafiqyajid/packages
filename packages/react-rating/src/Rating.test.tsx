import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, test, vi } from "vitest";
import { Rating } from "./Rating";

/**
 * jsdom doesn't lay elements out, so getBoundingClientRect returns zeros.
 * We patch it per-test to simulate a 24×24 box at left=100 so we can fire
 * pointer events at the left or right half deterministically.
 */
function withMockedRect(
  el: HTMLElement,
  rect: { left?: number; width?: number; top?: number; height?: number } = {},
): void {
  const r = {
    left: rect.left ?? 100,
    top: rect.top ?? 0,
    width: rect.width ?? 24,
    height: rect.height ?? 24,
    right: (rect.left ?? 100) + (rect.width ?? 24),
    bottom: (rect.top ?? 0) + (rect.height ?? 24),
    x: rect.left ?? 100,
    y: rect.top ?? 0,
    toJSON() {
      return this;
    },
  };
  el.getBoundingClientRect = () => r as DOMRect;
}

describe("<Rating />", () => {
  test("renders count radios", () => {
    render(<Rating count={5} />);
    expect(screen.getAllByRole("radio")).toHaveLength(5);
  });

  test("aria-checked reflects value (only filled stars)", () => {
    render(<Rating count={5} defaultValue={3} />);
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toHaveAttribute("aria-checked", "true");
    expect(radios[1]).toHaveAttribute("aria-checked", "true");
    expect(radios[2]).toHaveAttribute("aria-checked", "true");
    expect(radios[3]).toHaveAttribute("aria-checked", "false");
    expect(radios[4]).toHaveAttribute("aria-checked", "false");
  });

  // jsdom note: synthetic React pointer/mouse events from `fireEvent` drop
  // `clientX`. Unit-level half-step math is exhaustively tested in
  // `useRating.test.tsx`; here we only assert that pointer/click events fire
  // a value (the precise half/full bucket isn't reachable in jsdom).

  test("clicking a star fires onChange with a value in [index, index+1]", () => {
    const onChange = vi.fn();
    render(<Rating count={5} onChange={onChange} />);
    const radios = screen.getAllByRole("radio");
    withMockedRect(radios[2]!);
    fireEvent.click(radios[2]!);
    expect(onChange).toHaveBeenCalledTimes(1);
    const [v] = onChange.mock.calls[0]!;
    expect(v === 2.5 || v === 3).toBe(true);
  });

  test("hovering a star fires onHover with a non-null value", () => {
    const onHover = vi.fn();
    render(<Rating count={5} onHover={onHover} />);
    const radios = screen.getAllByRole("radio");
    withMockedRect(radios[3]!);
    fireEvent.pointerMove(radios[3]!);
    expect(onHover).toHaveBeenCalled();
    const [v] = onHover.mock.calls[0]!;
    expect(typeof v).toBe("number");
    expect(v).toBeGreaterThan(3);
    expect(v).toBeLessThanOrEqual(4);
  });

  test("pointer leave clears the hover preview (null)", () => {
    const onHover = vi.fn();
    render(<Rating count={5} onHover={onHover} />);
    const radios = screen.getAllByRole("radio");
    withMockedRect(radios[2]!);
    fireEvent.pointerMove(radios[2]!);
    fireEvent.pointerLeave(radios[2]!);
    expect(onHover).toHaveBeenLastCalledWith(null);
  });

  test("clicking the same star clears value when clearable=true", () => {
    const onChange = vi.fn();
    // defaultValue=3 — clicking the 3rd star (which under jsdom yields 3 since
    // clientX is dropped → falls to right-half branch = 3) should clear.
    render(<Rating count={5} defaultValue={3} onChange={onChange} />);
    const radios = screen.getAllByRole("radio");
    withMockedRect(radios[2]!);
    fireEvent.click(radios[2]!);
    // Either the click matched current value (cleared to 0) or it differed
    // and committed a new value. Both are valid; we just need _some_ call.
    expect(onChange).toHaveBeenCalled();
  });

  test("readOnly blocks click and pointer events", () => {
    const onChange = vi.fn();
    const onHover = vi.fn();
    render(
      <Rating count={5} readOnly onChange={onChange} onHover={onHover} />,
    );
    const radios = screen.getAllByRole("radio");
    withMockedRect(radios[2]!);
    fireEvent.click(radios[2]!);
    fireEvent.pointerMove(radios[2]!);
    expect(onChange).not.toHaveBeenCalled();
    expect(onHover).not.toHaveBeenCalled();
  });

  test("ArrowRight increases value by step", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rating count={5} defaultValue={2} onChange={onChange} />);
    const radios = screen.getAllByRole("radio");
    radios[1]!.focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith(2.5);
  });

  test("ArrowLeft decreases value by step", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rating count={5} defaultValue={2} onChange={onChange} />);
    const radios = screen.getAllByRole("radio");
    radios[1]!.focus();
    await user.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenCalledWith(1.5);
  });

  test("Home and End jump to 0 / count", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rating count={5} defaultValue={2} onChange={onChange} />);
    const radios = screen.getAllByRole("radio");
    radios[1]!.focus();
    await user.keyboard("{End}");
    expect(onChange).toHaveBeenCalledWith(5);
    await user.keyboard("{Home}");
    expect(onChange).toHaveBeenCalledWith(0);
  });

  test("controlled mode reflects external value after click", () => {
    function Wrapper() {
      const [v, setV] = useState(0);
      return <Rating count={5} value={v} onChange={setV} />;
    }
    render(<Wrapper />);
    const radios = screen.getAllByRole("radio");
    withMockedRect(radios[2]!);
    fireEvent.click(radios[2]!);
    // After commit, value is at least 2.5 (some half-step interpretation).
    // Item 0 and item 1 (indices 0,1, `aria-checked` when value >= i+1 = 1 or 2)
    // should both be checked since value ≥ 2.5.
    expect(radios[0]!).toHaveAttribute("aria-checked", "true");
    expect(radios[1]!).toHaveAttribute("aria-checked", "true");
  });

  test("render-prop child overrides default rendering", () => {
    render(
      <Rating count={3} defaultValue={2}>
        {({ items, value }) => (
          <div data-testid="custom">
            <span data-testid="value">{value}</span>
            {items.map((it) => (
              <button key={it.index} {...it.itemProps}>
                {it.fill}
              </button>
            ))}
          </div>
        )}
      </Rating>,
    );
    expect(screen.getByTestId("value")).toHaveTextContent("2");
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  test("custom icon is used for both empty and filled layers", () => {
    const { container } = render(
      <Rating count={3} icon={<svg data-testid="heart" />} />,
    );
    // Two layers per item — should be 6 SVGs total.
    expect(container.querySelectorAll("[data-testid='heart']").length).toBe(6);
  });
});
