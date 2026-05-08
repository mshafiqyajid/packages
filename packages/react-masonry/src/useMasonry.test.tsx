import { renderHook } from "@testing-library/react";
import { render, screen } from "@testing-library/react";
import React from "react";
import { useMasonry } from "./useMasonry";
import { MasonryStyled } from "./styled/MasonryStyled";

describe("useMasonry — containerProps", () => {
  it("containerProps has role='list'", () => {
    const { result } = renderHook(() => useMasonry());
    expect(result.current.containerProps.role).toBe("list");
  });

  it("containerProps has data-columns matching default (3)", () => {
    const { result } = renderHook(() => useMasonry());
    expect(result.current.containerProps["data-columns"]).toBe(3);
  });

  it("containerProps style sets --rmsn-columns to custom column count", () => {
    const { result } = renderHook(() => useMasonry({ columns: 4 }));
    expect(result.current.containerProps.style["--rmsn-columns" as never]).toBe("4");
  });

  it("containerProps style sets --rmsn-gap from numeric spacing", () => {
    const { result } = renderHook(() => useMasonry({ spacing: 24 }));
    expect(result.current.containerProps.style["--rmsn-gap" as never]).toBe("24px");
  });

  it("containerProps style sets --rmsn-gap from string spacing", () => {
    const { result } = renderHook(() => useMasonry({ spacing: "2rem" }));
    expect(result.current.containerProps.style["--rmsn-gap" as never]).toBe("2rem");
  });

  it("default --rmsn-gap is '16px'", () => {
    const { result } = renderHook(() => useMasonry());
    expect(result.current.containerProps.style["--rmsn-gap" as never]).toBe("16px");
  });
});

describe("useMasonry — getItemProps", () => {
  it("getItemProps returns role='listitem'", () => {
    const { result } = renderHook(() => useMasonry());
    expect(result.current.getItemProps().role).toBe("listitem");
  });

  it("getItemProps returns className='rmsn-item'", () => {
    const { result } = renderHook(() => useMasonry());
    expect(result.current.getItemProps().className).toBe("rmsn-item");
  });
});

describe("useMasonry — activeColumns", () => {
  it("activeColumns defaults to 3", () => {
    const { result } = renderHook(() => useMasonry());
    expect(result.current.activeColumns).toBe(3);
  });

  it("activeColumns matches numeric columns prop", () => {
    const { result } = renderHook(() => useMasonry({ columns: 2 }));
    expect(result.current.activeColumns).toBe(2);
  });

  it("activeColumns resolves breakpoint map — small window uses 'default'", () => {
    const { result } = renderHook(() =>
      useMasonry({ columns: { default: 1, 768: 2, 1024: 4 } }, 400)
    );
    expect(result.current.activeColumns).toBe(1);
  });

  it("activeColumns resolves breakpoint map — medium window", () => {
    const { result } = renderHook(() =>
      useMasonry({ columns: { default: 1, 768: 2, 1024: 4 } }, 900)
    );
    expect(result.current.activeColumns).toBe(2);
  });

  it("activeColumns resolves breakpoint map — large window", () => {
    const { result } = renderHook(() =>
      useMasonry({ columns: { default: 1, 768: 2, 1024: 4 } }, 1200)
    );
    expect(result.current.activeColumns).toBe(4);
  });
});

describe("useMasonry — data-columns attribute reflects active columns", () => {
  it("data-columns updates when columns changes", () => {
    const { result, rerender } = renderHook(
      ({ cols }: { cols: number }) => useMasonry({ columns: cols }),
      { initialProps: { cols: 2 } }
    );
    expect(result.current.containerProps["data-columns"]).toBe(2);
    rerender({ cols: 5 });
    expect(result.current.containerProps["data-columns"]).toBe(5);
  });
});

describe("MasonryStyled — ref forwarding", () => {
  it("ref is forwarded to the container element", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <MasonryStyled ref={ref}>
        <div>item</div>
      </MasonryStyled>
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName.toLowerCase()).toBe("div");
  });
});

describe("MasonryStyled — children wrapped in rmsn-item", () => {
  it("each direct child is wrapped with role=listitem", () => {
    render(
      <MasonryStyled columns={2}>
        <div>Card A</div>
        <div>Card B</div>
        <div>Card C</div>
      </MasonryStyled>
    );
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
  });

  it("container has role=list", () => {
    render(
      <MasonryStyled>
        <div>Item</div>
      </MasonryStyled>
    );
    expect(screen.getByRole("list")).toBeInTheDocument();
  });
});
