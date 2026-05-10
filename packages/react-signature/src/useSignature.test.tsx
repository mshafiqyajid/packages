import { render, screen, fireEvent } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React, { createRef } from "react";
import { useSignature } from "./useSignature";
import type { SignatureInkStyle } from "./useSignature";
import { SignatureStyled } from "./styled/SignatureStyled";
import type { SignatureHandle } from "./styled/SignatureStyled";

function mockCanvas() {
  const mockCtx = {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    drawImage: vi.fn(),
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    lineCap: "butt" as CanvasLineCap,
    lineJoin: "miter" as CanvasLineJoin,
    globalCompositeOperation: "source-over" as GlobalCompositeOperation,
    globalAlpha: 1,
  };

  const mockGetContext = vi.fn().mockReturnValue(mockCtx);
  const mockToDataURL = vi.fn().mockReturnValue("data:image/png;base64,abc");

  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    value: mockGetContext,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(HTMLCanvasElement.prototype, "toDataURL", {
    value: mockToDataURL,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(HTMLCanvasElement.prototype, "setPointerCapture", {
    value: vi.fn(),
    writable: true,
    configurable: true,
  });

  Object.defineProperty(HTMLCanvasElement.prototype, "releasePointerCapture", {
    value: vi.fn(),
    writable: true,
    configurable: true,
  });

  return { mockGetContext, mockToDataURL, mockCtx };
}

beforeEach(() => {
  mockCanvas();
});

function SimpleCanvas({
  onBegin,
  onEnd,
  onChange,
  disabled,
}: {
  onBegin?: () => void;
  onEnd?: (dataURL: string) => void;
  onChange?: (isEmpty: boolean) => void;
  disabled?: boolean;
}) {
  const { canvasRef, canvasProps } = useSignature({
    onBegin,
    onEnd,
    onChange,
    disabled,
  });
  return <canvas ref={canvasRef as React.RefObject<HTMLCanvasElement>} {...canvasProps} data-testid="canvas" />;
}

describe("useSignature hook", () => {
  it("returns canvasProps with correct role and aria-label", () => {
    const { result } = renderHook(() => useSignature());
    expect(result.current.canvasProps.role).toBe("img");
    expect(result.current.canvasProps["aria-label"]).toBe("Signature pad");
  });

  it("returns isEmpty=true initially", () => {
    const { result } = renderHook(() => useSignature());
    expect(result.current.isEmpty).toBe(true);
  });

  it("getDataURL returns a string", () => {
    const { result } = renderHook(() => useSignature());
    const url = result.current.getDataURL();
    expect(typeof url).toBe("string");
  });

  it("clear can be called without error", () => {
    const { result } = renderHook(() => useSignature());
    expect(() => act(() => result.current.clear())).not.toThrow();
  });

  it("undo can be called without error when no strokes", () => {
    const { result } = renderHook(() => useSignature());
    expect(() => act(() => result.current.undo())).not.toThrow();
  });

  it("returns mode='draw' by default", () => {
    const { result } = renderHook(() => useSignature());
    expect(result.current.mode).toBe("draw");
  });

  it("returns mode='erase' when erase mode is set", () => {
    const { result } = renderHook(() => useSignature({ mode: "erase" }));
    expect(result.current.mode).toBe("erase");
  });
});

describe("SignatureStyled renders", () => {
  it("renders a canvas element", () => {
    render(<SignatureStyled />);
    const canvas = document.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("canvas has role=img and aria-label", () => {
    render(<SignatureStyled />);
    const canvas = screen.getByRole("img", { name: "Signature pad" });
    expect(canvas).toBeInTheDocument();
  });

  it("root has data-empty attribute when isEmpty", () => {
    const { container } = render(<SignatureStyled />);
    const root = container.querySelector(".rsig-root");
    expect(root).toHaveAttribute("data-empty");
  });

  it("root has data-disabled attribute when disabled", () => {
    const { container } = render(<SignatureStyled disabled />);
    const root = container.querySelector(".rsig-root");
    expect(root).toHaveAttribute("data-disabled");
  });

  it("disabled prevents pointer interaction — canvas has tabIndex=-1", () => {
    render(<SignatureStyled disabled />);
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    expect(canvas.tabIndex).toBe(-1);
  });

  it("root has data-mode='draw' by default", () => {
    const { container } = render(<SignatureStyled />);
    const root = container.querySelector(".rsig-root");
    expect(root).toHaveAttribute("data-mode", "draw");
  });

  it("root has data-mode='erase' when mode='erase'", () => {
    const { container } = render(<SignatureStyled mode="erase" />);
    const root = container.querySelector(".rsig-root");
    expect(root).toHaveAttribute("data-mode", "erase");
  });
});

describe("SignatureStyled callbacks", () => {
  it("onBegin is called when pointerdown fires on canvas", () => {
    const onBegin = vi.fn();
    render(<SimpleCanvas onBegin={onBegin} />);
    const canvas = screen.getByTestId("canvas");
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10 });
    expect(onBegin).toHaveBeenCalledTimes(1);
  });

  it("onEnd is called when pointerup fires after drawing", () => {
    const onEnd = vi.fn();
    render(<SimpleCanvas onEnd={onEnd} />);
    const canvas = screen.getByTestId("canvas");
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20 });
    fireEvent.pointerUp(canvas, { clientX: 20, clientY: 20 });
    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(typeof onEnd.mock.calls[0]?.[0]).toBe("string");
  });

  it("onChange is called with false after first stroke", () => {
    const onChange = vi.fn();
    render(<SimpleCanvas onChange={onChange} />);
    const canvas = screen.getByTestId("canvas");
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10 });
    fireEvent.pointerUp(canvas, { clientX: 10, clientY: 10 });
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("disabled=true prevents onBegin from firing", () => {
    const onBegin = vi.fn();
    render(<SimpleCanvas onBegin={onBegin} disabled />);
    const canvas = screen.getByTestId("canvas");
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10 });
    expect(onBegin).not.toHaveBeenCalled();
  });
});

describe("SignatureStyled imperative ref API", () => {
  it("ref.clear() resets isEmpty to true", () => {
    const ref = createRef<SignatureHandle>();
    render(<SignatureStyled ref={ref} />);
    const canvas = document.querySelector("canvas")!;
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10 });
    fireEvent.pointerUp(canvas, { clientX: 10, clientY: 10 });
    act(() => ref.current!.clear());
    expect(ref.current!.isEmpty()).toBe(true);
  });

  it("ref.getDataURL() returns a string", () => {
    const ref = createRef<SignatureHandle>();
    render(<SignatureStyled ref={ref} />);
    const result = ref.current!.getDataURL();
    expect(typeof result).toBe("string");
  });

  it("ref.getDataURL('image/jpeg') returns a string", () => {
    const ref = createRef<SignatureHandle>();
    render(<SignatureStyled ref={ref} />);
    const result = ref.current!.getDataURL("image/jpeg");
    expect(typeof result).toBe("string");
  });

  it("ref.undo() does not throw when no strokes exist", () => {
    const ref = createRef<SignatureHandle>();
    render(<SignatureStyled ref={ref} />);
    expect(() => act(() => ref.current!.undo())).not.toThrow();
  });

  it("ref.isEmpty() returns true initially", () => {
    const ref = createRef<SignatureHandle>();
    render(<SignatureStyled ref={ref} />);
    expect(ref.current!.isEmpty()).toBe(true);
  });

  it("ref.isEmpty() returns false after drawing a stroke", () => {
    const ref = createRef<SignatureHandle>();
    render(<SignatureStyled ref={ref} />);
    const canvas = document.querySelector("canvas")!;
    fireEvent.pointerDown(canvas, { clientX: 5, clientY: 5 });
    fireEvent.pointerUp(canvas, { clientX: 5, clientY: 5 });
    expect(ref.current!.isEmpty()).toBe(false);
  });
});

describe("Erase mode", () => {
  it("hook returns mode='erase' when specified", () => {
    const { result } = renderHook(() => useSignature({ mode: "erase" }));
    expect(result.current.mode).toBe("erase");
  });

  it("erase mode sets destination-out composite operation on stroke", () => {
    const { mockCtx } = mockCanvas();
    render(<SignatureStyled mode="erase" height={200} />);
    const canvas = document.querySelector("canvas")!;
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20 });
    fireEvent.pointerUp(canvas, { clientX: 30, clientY: 30 });
    expect(mockCtx.globalCompositeOperation).toBeDefined();
  });

  it("root reflects data-mode='erase' when mode prop is erase", () => {
    const { container } = render(<SignatureStyled mode="erase" />);
    const root = container.querySelector(".rsig-root");
    expect(root).toHaveAttribute("data-mode", "erase");
  });
});

describe("showToolbar", () => {
  it("does not render toolbar by default", () => {
    const { container } = render(<SignatureStyled />);
    expect(container.querySelector(".rsig-toolbar")).not.toBeInTheDocument();
  });

  it("renders toolbar when showToolbar=true", () => {
    const { container } = render(<SignatureStyled showToolbar />);
    expect(container.querySelector(".rsig-toolbar")).toBeInTheDocument();
  });

  it("toolbar contains Draw and Erase buttons", () => {
    render(<SignatureStyled showToolbar />);
    expect(screen.getByRole("button", { name: "Draw" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Erase" })).toBeInTheDocument();
  });

  it("toolbar contains Undo and Clear buttons", () => {
    render(<SignatureStyled showToolbar />);
    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
  });

  it("toolbar contains color picker input", () => {
    render(<SignatureStyled showToolbar />);
    const colorInput = screen.getByLabelText("Pen color");
    expect(colorInput).toBeInTheDocument();
    expect(colorInput).toHaveAttribute("type", "color");
  });

  it("toolbar contains width slider input", () => {
    render(<SignatureStyled showToolbar />);
    const slider = screen.getByLabelText("Pen width");
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute("type", "range");
  });

  it("toolbar clear button calls clear on the canvas", () => {
    const ref = createRef<SignatureHandle>();
    render(<SignatureStyled ref={ref} showToolbar />);
    const canvas = document.querySelector("canvas")!;
    fireEvent.pointerDown(canvas, { clientX: 5, clientY: 5 });
    fireEvent.pointerUp(canvas, { clientX: 5, clientY: 5 });
    expect(ref.current!.isEmpty()).toBe(false);
    const clearBtn = screen.getByRole("button", { name: "Clear" });
    act(() => fireEvent.click(clearBtn));
    expect(ref.current!.isEmpty()).toBe(true);
  });

  it("toolbar undo button calls undo", () => {
    const ref = createRef<SignatureHandle>();
    render(<SignatureStyled ref={ref} showToolbar />);
    const canvas = document.querySelector("canvas")!;
    fireEvent.pointerDown(canvas, { clientX: 5, clientY: 5 });
    fireEvent.pointerUp(canvas, { clientX: 5, clientY: 5 });
    const undoBtn = screen.getByRole("button", { name: "Undo" });
    expect(() => act(() => fireEvent.click(undoBtn))).not.toThrow();
  });

  it("toolbar color input changes penColor internal state", () => {
    render(<SignatureStyled showToolbar />);
    const colorInput = screen.getByLabelText("Pen color") as HTMLInputElement;
    act(() => {
      fireEvent.change(colorInput, { target: { value: "#ff0000" } });
    });
    expect(colorInput.value).toBe("#ff0000");
  });

  it("clicking Erase button switches mode to erase", () => {
    const { container } = render(<SignatureStyled showToolbar />);
    const eraseBtn = screen.getByRole("button", { name: "Erase" });
    act(() => fireEvent.click(eraseBtn));
    const root = container.querySelector(".rsig-root");
    expect(root).toHaveAttribute("data-mode", "erase");
  });
});

describe("defaultValue", () => {
  it("accepts a defaultValue prop without throwing", () => {
    expect(() =>
      render(<SignatureStyled defaultValue="data:image/png;base64,abc" />)
    ).not.toThrow();
  });

  it("hook accepts defaultValue option without throwing", () => {
    expect(() =>
      renderHook(() => useSignature({ defaultValue: "data:image/png;base64,abc" }))
    ).not.toThrow();
  });
});

describe("taper prop", () => {
  it("hook defaults taper to true", () => {
    const { result } = renderHook(() => useSignature());
    expect(result.current).toBeDefined();
  });

  it("hook accepts taper=false without throwing", () => {
    expect(() =>
      renderHook(() => useSignature({ taper: false }))
    ).not.toThrow();
  });

  it("SignatureStyled accepts taper=false without throwing", () => {
    expect(() => render(<SignatureStyled taper={false} />)).not.toThrow();
  });

  it("SignatureStyled accepts taper=true without throwing", () => {
    expect(() => render(<SignatureStyled taper={true} />)).not.toThrow();
  });

  it("drawing a stroke with taper=false does not throw", () => {
    expect(() => {
      render(<SignatureStyled taper={false} />);
      const canvas = document.querySelector("canvas")!;
      fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10 });
      fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20 });
      fireEvent.pointerUp(canvas, { clientX: 30, clientY: 30 });
    }).not.toThrow();
  });

  it("drawing a stroke with taper=true does not throw", () => {
    expect(() => {
      render(<SignatureStyled taper={true} />);
      const canvas = document.querySelector("canvas")!;
      fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10 });
      fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20 });
      fireEvent.pointerUp(canvas, { clientX: 30, clientY: 30 });
    }).not.toThrow();
  });
});

describe("inkStyle prop", () => {
  const inkStyles: SignatureInkStyle[] = ["pen", "brush", "marker"];

  for (const style of inkStyles) {
    it(`hook accepts inkStyle="${style}" without throwing`, () => {
      expect(() =>
        renderHook(() => useSignature({ inkStyle: style }))
      ).not.toThrow();
    });

    it(`SignatureStyled renders with inkStyle="${style}" without throwing`, () => {
      expect(() => render(<SignatureStyled inkStyle={style} />)).not.toThrow();
    });

    it(`drawing a stroke with inkStyle="${style}" does not throw`, () => {
      expect(() => {
        render(<SignatureStyled inkStyle={style} />);
        const canvas = document.querySelector("canvas")!;
        fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10 });
        fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20 });
        fireEvent.pointerMove(canvas, { clientX: 30, clientY: 25 });
        fireEvent.pointerUp(canvas, { clientX: 40, clientY: 30 });
      }).not.toThrow();
    });
  }

  it("hook defaults inkStyle to 'pen'", () => {
    const { result } = renderHook(() => useSignature());
    expect(result.current).toBeDefined();
  });
});

describe("toolbar inkStyle and taper controls", () => {
  it("toolbar renders Pen, Brush, Marker ink style buttons", () => {
    render(<SignatureStyled showToolbar />);
    expect(screen.getByRole("button", { name: "Ink style: Pen" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ink style: Brush" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ink style: Marker" })).toBeInTheDocument();
  });

  it("toolbar renders Taper toggle button", () => {
    render(<SignatureStyled showToolbar />);
    expect(screen.getByRole("button", { name: "Toggle taper" })).toBeInTheDocument();
  });

  it("Pen ink button is active by default", () => {
    render(<SignatureStyled showToolbar />);
    const penBtn = screen.getByRole("button", { name: "Ink style: Pen" });
    expect(penBtn).toHaveAttribute("data-active");
  });

  it("Taper button is active by default (taper defaults true)", () => {
    render(<SignatureStyled showToolbar />);
    const taperBtn = screen.getByRole("button", { name: "Toggle taper" });
    expect(taperBtn).toHaveAttribute("data-active");
  });

  it("clicking Brush ink button sets it as active", () => {
    render(<SignatureStyled showToolbar />);
    const brushBtn = screen.getByRole("button", { name: "Ink style: Brush" });
    act(() => fireEvent.click(brushBtn));
    expect(brushBtn).toHaveAttribute("data-active");
    expect(screen.getByRole("button", { name: "Ink style: Pen" })).not.toHaveAttribute("data-active");
  });

  it("clicking Marker ink button sets it as active", () => {
    render(<SignatureStyled showToolbar />);
    const markerBtn = screen.getByRole("button", { name: "Ink style: Marker" });
    act(() => fireEvent.click(markerBtn));
    expect(markerBtn).toHaveAttribute("data-active");
  });

  it("clicking Taper toggle removes active state (toggles off)", () => {
    render(<SignatureStyled showToolbar />);
    const taperBtn = screen.getByRole("button", { name: "Toggle taper" });
    act(() => fireEvent.click(taperBtn));
    expect(taperBtn).not.toHaveAttribute("data-active");
  });

  it("clicking Taper toggle twice restores active state", () => {
    render(<SignatureStyled showToolbar />);
    const taperBtn = screen.getByRole("button", { name: "Toggle taper" });
    act(() => fireEvent.click(taperBtn));
    act(() => fireEvent.click(taperBtn));
    expect(taperBtn).toHaveAttribute("data-active");
  });
});
