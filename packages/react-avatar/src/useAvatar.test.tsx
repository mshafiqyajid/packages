import { renderHook, act } from "@testing-library/react";
import { useAvatar } from "./useAvatar";

describe("useAvatar", () => {
  describe("initials derivation", () => {
    it("derives initials from a two-word name", () => {
      const { result } = renderHook(() =>
        useAvatar({ name: "Jane Doe" })
      );
      expect(result.current.initials).toBe("JD");
    });

    it("uses only the first two words for initials when name has more words", () => {
      const { result } = renderHook(() =>
        useAvatar({ name: "Mary Jane Watson" })
      );
      expect(result.current.initials).toBe("MJ");
    });

    it("returns a single initial for a single-word name", () => {
      const { result } = renderHook(() =>
        useAvatar({ name: "Alice" })
      );
      expect(result.current.initials).toBe("A");
    });

    it("returns empty initials when no name is provided", () => {
      const { result } = renderHook(() => useAvatar({}));
      expect(result.current.initials).toBe("");
    });

    it("uppercases initials regardless of input casing", () => {
      const { result } = renderHook(() =>
        useAvatar({ name: "bob smith" })
      );
      expect(result.current.initials).toBe("BS");
    });
  });

  describe("status", () => {
    it("starts as 'error' when no src is provided", () => {
      const { result } = renderHook(() => useAvatar({ name: "Jane Doe" }));
      expect(result.current.status).toBe("error");
    });

    it("starts as 'loading' when a src is provided", () => {
      const { result } = renderHook(() =>
        useAvatar({ src: "https://example.com/photo.jpg", name: "Jane Doe" })
      );
      expect(result.current.status).toBe("loading");
    });

    it("transitions to 'loaded' when onLoad fires on the img element", () => {
      const { result } = renderHook(() =>
        useAvatar({ src: "https://example.com/photo.jpg" })
      );
      act(() => {
        result.current.imgProps.onLoad?.({} as React.SyntheticEvent<HTMLImageElement>);
      });
      expect(result.current.status).toBe("loaded");
    });

    it("transitions to 'error' when onError fires on the img element", () => {
      const { result } = renderHook(() =>
        useAvatar({ src: "https://example.com/bad.jpg" })
      );
      act(() => {
        result.current.imgProps.onError?.({} as React.SyntheticEvent<HTMLImageElement>);
      });
      expect(result.current.status).toBe("error");
    });

    it("resets to 'loading' when src changes", () => {
      let src = "https://example.com/a.jpg";
      const { result, rerender } = renderHook(() =>
        useAvatar({ src })
      );

      act(() => {
        result.current.imgProps.onLoad?.({} as React.SyntheticEvent<HTMLImageElement>);
      });
      expect(result.current.status).toBe("loaded");

      src = "https://example.com/b.jpg";
      rerender();
      expect(result.current.status).toBe("loading");
    });
  });

  describe("imgProps", () => {
    it("sets src and alt on imgProps", () => {
      const { result } = renderHook(() =>
        useAvatar({ src: "https://example.com/photo.jpg", name: "Jane Doe" })
      );
      expect(result.current.imgProps.src).toBe("https://example.com/photo.jpg");
      expect(result.current.imgProps.alt).toBe("Jane Doe");
    });

    it("uses empty string for alt when no name is provided", () => {
      const { result } = renderHook(() =>
        useAvatar({ src: "https://example.com/photo.jpg" })
      );
      expect(result.current.imgProps.alt).toBe("");
    });
  });

  describe("fallbackProps", () => {
    it("sets role=img on fallbackProps", () => {
      const { result } = renderHook(() => useAvatar({ name: "Jane Doe" }));
      expect(result.current.fallbackProps.role).toBe("img");
    });

    it("sets aria-label to name on fallbackProps", () => {
      const { result } = renderHook(() => useAvatar({ name: "Jane Doe" }));
      expect(result.current.fallbackProps["aria-label"]).toBe("Jane Doe");
    });

    it("defaults aria-label to 'avatar' when no name is provided", () => {
      const { result } = renderHook(() => useAvatar({}));
      expect(result.current.fallbackProps["aria-label"]).toBe("avatar");
    });
  });
});
