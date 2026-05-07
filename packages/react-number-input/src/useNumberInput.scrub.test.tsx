import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { NumberInputStyled } from "./styled/NumberInputStyled";

function ScrubWrapper({
  onChange,
  scrubPixels = 4,
}: {
  onChange?: (v: number) => void;
  scrubPixels?: number;
}) {
  const [value, setValue] = useState<number | undefined>(10);
  return (
    <NumberInputStyled
      label="Amount"
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
      step={1}
      min={0}
      max={100}
      scrubable
      scrubPixels={scrubPixels}
    />
  );
}

function firePointerMoveWithMovement(el: Element, movementX: number) {
  const event = Object.assign(
    new MouseEvent("pointermove", { bubbles: true, cancelable: true }),
    { movementX },
  );
  act(() => { el.dispatchEvent(event); });
}

describe("scrubable label", () => {
  it("renders label with rni-label--scrubable class when scrubable is true", () => {
    render(
      <NumberInputStyled
        label="Value"
        defaultValue={5}
        scrubable
      />,
    );
    const label = screen.getByText("Value");
    expect(label).toHaveClass("rni-label--scrubable");
  });

  it("does not apply rni-label--scrubable when scrubable is false", () => {
    render(
      <NumberInputStyled
        label="Value"
        defaultValue={5}
        scrubable={false}
      />,
    );
    const label = screen.getByText("Value");
    expect(label).not.toHaveClass("rni-label--scrubable");
  });

  it("increments value when dragging right by scrubPixels", () => {
    const onChange = vi.fn();
    render(<ScrubWrapper onChange={onChange} scrubPixels={4} />);

    const label = screen.getByText("Amount");

    act(() => { fireEvent.pointerDown(label, { pointerId: 1 }); });
    firePointerMoveWithMovement(label, 4);
    act(() => { fireEvent.pointerUp(label, { pointerId: 1 }); });

    expect(onChange).toHaveBeenCalledWith(11);
  });

  it("decrements value when dragging left by scrubPixels", () => {
    const onChange = vi.fn();
    render(<ScrubWrapper onChange={onChange} scrubPixels={4} />);

    const label = screen.getByText("Amount");

    act(() => { fireEvent.pointerDown(label, { pointerId: 1 }); });
    firePointerMoveWithMovement(label, -4);
    act(() => { fireEvent.pointerUp(label, { pointerId: 1 }); });

    expect(onChange).toHaveBeenCalledWith(9);
  });

  it("does not change value for sub-threshold movement", () => {
    const onChange = vi.fn();
    render(<ScrubWrapper onChange={onChange} scrubPixels={4} />);

    const label = screen.getByText("Amount");

    act(() => { fireEvent.pointerDown(label, { pointerId: 1 }); });
    firePointerMoveWithMovement(label, 3);
    act(() => { fireEvent.pointerUp(label, { pointerId: 1 }); });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("accumulates movement across multiple pointer move events", () => {
    const onChange = vi.fn();
    render(<ScrubWrapper onChange={onChange} scrubPixels={4} />);

    const label = screen.getByText("Amount");

    act(() => { fireEvent.pointerDown(label, { pointerId: 1 }); });
    firePointerMoveWithMovement(label, 2);
    firePointerMoveWithMovement(label, 2);
    act(() => { fireEvent.pointerUp(label, { pointerId: 1 }); });

    expect(onChange).toHaveBeenCalledWith(11);
  });

  it("stops scrubbing after pointerUp", () => {
    const onChange = vi.fn();
    render(<ScrubWrapper onChange={onChange} scrubPixels={4} />);

    const label = screen.getByText("Amount");

    act(() => { fireEvent.pointerDown(label, { pointerId: 1 }); });
    act(() => { fireEvent.pointerUp(label, { pointerId: 1 }); });
    firePointerMoveWithMovement(label, 8);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("stops scrubbing on pointerCancel", () => {
    const onChange = vi.fn();
    render(<ScrubWrapper onChange={onChange} scrubPixels={4} />);

    const label = screen.getByText("Amount");

    act(() => { fireEvent.pointerDown(label, { pointerId: 1 }); });
    act(() => { fireEvent.pointerCancel(label, { pointerId: 1 }); });
    firePointerMoveWithMovement(label, 8);

    expect(onChange).not.toHaveBeenCalled();
  });
});
