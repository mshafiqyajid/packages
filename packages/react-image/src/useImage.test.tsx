import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useImage } from "./useImage";

describe("useImage", () => {
  it("isLoading is true initially", () => {
    const { result } = renderHook(() =>
      useImage({ src: "https://example.com/img.jpg", alt: "Test" }),
    );
    expect(result.current.isLoading).toBe(true);
  });

  it("isLoaded is true after load event", () => {
    const { result } = renderHook(() =>
      useImage({ src: "https://example.com/img.jpg", alt: "Test" }),
    );
    act(() => {
      result.current.imgProps.onLoad();
    });
    expect(result.current.isLoaded).toBe(true);
  });

  it("isLoading is false after load event", () => {
    const { result } = renderHook(() =>
      useImage({ src: "https://example.com/img.jpg", alt: "Test" }),
    );
    act(() => {
      result.current.imgProps.onLoad();
    });
    expect(result.current.isLoading).toBe(false);
  });

  it("isError is true after error event when no fallbackSrc", () => {
    const { result } = renderHook(() =>
      useImage({ src: "https://example.com/img.jpg", alt: "Test" }),
    );
    act(() => {
      result.current.imgProps.onError();
    });
    expect(result.current.isError).toBe(true);
  });

  it("switches to fallbackSrc after error", () => {
    const { result } = renderHook(() =>
      useImage({
        src: "https://example.com/img.jpg",
        alt: "Test",
        fallbackSrc: "https://example.com/fallback.jpg",
      }),
    );
    act(() => {
      result.current.imgProps.onError();
    });
    expect(result.current.imgProps.src).toBe("https://example.com/fallback.jpg");
  });

  it("alt='' sets aria-hidden to true", () => {
    const { result } = renderHook(() =>
      useImage({ src: "https://example.com/img.jpg", alt: "" }),
    );
    expect(result.current.imgProps["aria-hidden"]).toBe(true);
  });

  it("non-empty alt does not set aria-hidden", () => {
    const { result } = renderHook(() =>
      useImage({ src: "https://example.com/img.jpg", alt: "A photo" }),
    );
    expect(result.current.imgProps["aria-hidden"]).toBeUndefined();
  });

  it("lazy=true sets loading to 'lazy'", () => {
    const { result } = renderHook(() =>
      useImage({ src: "https://example.com/img.jpg", alt: "Test", lazy: true }),
    );
    expect(result.current.imgProps.loading).toBe("lazy");
  });

  it("lazy=false sets loading to 'eager'", () => {
    const { result } = renderHook(() =>
      useImage({ src: "https://example.com/img.jpg", alt: "Test", lazy: false }),
    );
    expect(result.current.imgProps.loading).toBe("eager");
  });

  it("calls onLoad callback after load event", () => {
    const onLoad = vi.fn();
    const { result } = renderHook(() =>
      useImage({ src: "https://example.com/img.jpg", alt: "Test", onLoad }),
    );
    act(() => {
      result.current.imgProps.onLoad();
    });
    expect(onLoad).toHaveBeenCalledOnce();
  });
});
