import { renderHook, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useCopyToClipboard } from "./useCopyToClipboard";

function installClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  Object.defineProperty(window, "isSecureContext", {
    value: true,
    configurable: true,
  });
  return writeText;
}

describe("useCopyToClipboard — new features", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("timeout alias works like resetAfter", async () => {
    installClipboard();
    const { result } = renderHook(() =>
      useCopyToClipboard({ timeout: 1000 }),
    );

    await act(async () => {
      await result.current.copy("hello");
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1001);
    });
    expect(result.current.copied).toBe(false);
  });

  test("resetAfter takes precedence over timeout", async () => {
    installClipboard();
    const { result } = renderHook(() =>
      useCopyToClipboard({ resetAfter: 500, timeout: 9999 }),
    );

    await act(async () => {
      await result.current.copy("hello");
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(501);
    });
    expect(result.current.copied).toBe(false);
  });

  test("transform mutates the text before it reaches the clipboard", async () => {
    const writeText = installClipboard();
    const { result } = renderHook(() =>
      useCopyToClipboard({ transform: (t) => t.toUpperCase() }),
    );

    await act(async () => {
      await result.current.copy("hello");
    });

    expect(writeText).toHaveBeenCalledWith("HELLO");
  });

  test("async transform is awaited before clipboard write", async () => {
    const writeText = installClipboard();
    const { result } = renderHook(() =>
      useCopyToClipboard({
        transform: async (t) => {
          return `[${t}]`;
        },
      }),
    );

    await act(async () => {
      await result.current.copy("world");
    });

    expect(writeText).toHaveBeenCalledWith("[world]");
  });

  test("onCopy receives the transformed text", async () => {
    installClipboard();
    const onCopy = vi.fn();
    const { result } = renderHook(() =>
      useCopyToClipboard({
        transform: (t) => `trimmed:${t.trim()}`,
        onCopy,
      }),
    );

    await act(async () => {
      await result.current.copy("  spaces  ");
    });

    expect(onCopy).toHaveBeenCalledWith("trimmed:spaces");
  });
});
