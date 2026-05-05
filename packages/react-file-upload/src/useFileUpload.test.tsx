import { renderHook, act } from "@testing-library/react";
import { useFileUpload } from "./useFileUpload";

function makeFile(name: string, size: number, type: string): File {
  const file = new File(["x".repeat(size)], name, { type });
  return file;
}

describe("useFileUpload", () => {
  it("returns initial empty state", () => {
    const { result } = renderHook(() => useFileUpload());
    expect(result.current.files).toEqual([]);
    expect(result.current.isDragOver).toBe(false);
    expect(result.current.isDragReject).toBe(false);
  });

  it("getRootProps includes required accessibility attributes", () => {
    const { result } = renderHook(() => useFileUpload());
    const rootProps = result.current.getRootProps();
    expect(rootProps.role).toBe("button");
    expect(rootProps.tabIndex).toBe(0);
    expect(rootProps["aria-disabled"]).toBeUndefined();
  });

  it("getRootProps sets aria-disabled and tabIndex=-1 when disabled", () => {
    const { result } = renderHook(() => useFileUpload({ disabled: true }));
    const rootProps = result.current.getRootProps();
    expect(rootProps.tabIndex).toBe(-1);
    expect(rootProps["aria-disabled"]).toBe(true);
  });

  it("getInputProps returns correct type and hidden style", () => {
    const { result } = renderHook(() =>
      useFileUpload({ multiple: true, accept: "image/*" }),
    );
    const inputProps = result.current.getInputProps();
    expect(inputProps.type).toBe("file");
    expect(inputProps.multiple).toBe(true);
    expect(inputProps.accept).toBe("image/*");
    expect(inputProps.style).toEqual({ display: "none" });
    expect(inputProps["aria-hidden"]).toBe(true);
  });

  it("clearFiles removes all accepted files", () => {
    const { result } = renderHook(() => useFileUpload({ multiple: true }));

    const file1 = makeFile("a.txt", 100, "text/plain");
    const file2 = makeFile("b.txt", 200, "text/plain");

    const mockEvent = {
      preventDefault: () => {},
      stopPropagation: () => {},
      dataTransfer: { files: [file1, file2], items: [] },
    } as unknown as React.DragEvent<HTMLElement>;

    act(() => {
      result.current.getRootProps().onDrop?.(mockEvent);
    });

    expect(result.current.files).toHaveLength(2);

    act(() => {
      result.current.clearFiles();
    });

    expect(result.current.files).toHaveLength(0);
  });

  it("removeFile removes a single file by index", () => {
    const { result } = renderHook(() => useFileUpload({ multiple: true }));

    const file1 = makeFile("a.txt", 100, "text/plain");
    const file2 = makeFile("b.txt", 200, "text/plain");

    act(() => {
      result.current.getRootProps().onDrop?.({
        preventDefault: () => {},
        stopPropagation: () => {},
        dataTransfer: { files: [file1, file2], items: [] },
      } as unknown as React.DragEvent<HTMLElement>);
    });

    expect(result.current.files).toHaveLength(2);

    act(() => {
      result.current.removeFile(0);
    });

    expect(result.current.files).toHaveLength(1);
    expect(result.current.files[0]?.name).toBe("b.txt");
  });

  it("onDrop calls onFiles with accepted and rejected arrays", () => {
    const onFiles = vi.fn();
    const { result } = renderHook(() =>
      useFileUpload({
        multiple: true,
        accept: "image/*",
        onFiles,
      }),
    );

    const imageFile = makeFile("photo.jpg", 1000, "image/jpeg");
    const textFile = makeFile("doc.txt", 500, "text/plain");

    act(() => {
      result.current.getRootProps().onDrop?.({
        preventDefault: () => {},
        stopPropagation: () => {},
        dataTransfer: { files: [imageFile, textFile], items: [] },
      } as unknown as React.DragEvent<HTMLElement>);
    });

    expect(onFiles).toHaveBeenCalledOnce();
    const callArg = onFiles.mock.calls[0]![0];
    expect(callArg.accepted).toHaveLength(1);
    expect(callArg.accepted[0]!.name).toBe("photo.jpg");
    expect(callArg.rejected).toHaveLength(1);
    expect(callArg.rejected[0]!.file.name).toBe("doc.txt");
    expect(callArg.rejected[0].reasons).toContain("File type not accepted");
  });

  it("rejects files that exceed maxSize", () => {
    const onFiles = vi.fn();
    const { result } = renderHook(() =>
      useFileUpload({
        multiple: true,
        maxSize: 100,
        onFiles,
      }),
    );

    const smallFile = makeFile("small.txt", 50, "text/plain");
    const largeFile = makeFile("large.txt", 500, "text/plain");

    act(() => {
      result.current.getRootProps().onDrop?.({
        preventDefault: () => {},
        stopPropagation: () => {},
        dataTransfer: { files: [smallFile, largeFile], items: [] },
      } as unknown as React.DragEvent<HTMLElement>);
    });

    const callArg = onFiles.mock.calls[0]![0];
    expect(callArg.accepted).toHaveLength(1);
    expect(callArg.accepted[0]!.name).toBe("small.txt");
    expect(callArg.rejected).toHaveLength(1);
    expect(callArg.rejected[0].reasons[0]).toMatch(/exceeds maximum size/);
  });

  it("respects maxFiles limit", () => {
    const { result } = renderHook(() =>
      useFileUpload({ multiple: true, maxFiles: 2 }),
    );

    const files = [
      makeFile("a.txt", 10, "text/plain"),
      makeFile("b.txt", 10, "text/plain"),
      makeFile("c.txt", 10, "text/plain"),
    ];

    act(() => {
      result.current.getRootProps().onDrop?.({
        preventDefault: () => {},
        stopPropagation: () => {},
        dataTransfer: { files, items: [] },
      } as unknown as React.DragEvent<HTMLElement>);
    });

    expect(result.current.files).toHaveLength(2);
  });

  it("does not accept multiple files when multiple is false", () => {
    const { result } = renderHook(() => useFileUpload({ multiple: false }));

    const files = [
      makeFile("a.txt", 10, "text/plain"),
      makeFile("b.txt", 10, "text/plain"),
    ];

    act(() => {
      result.current.getRootProps().onDrop?.({
        preventDefault: () => {},
        stopPropagation: () => {},
        dataTransfer: { files, items: [] },
      } as unknown as React.DragEvent<HTMLElement>);
    });

    expect(result.current.files).toHaveLength(1);
    expect(result.current.files[0]?.name).toBe("a.txt");
  });

  it("does not process files when disabled", () => {
    const onFiles = vi.fn();
    const { result } = renderHook(() =>
      useFileUpload({ disabled: true, onFiles }),
    );

    act(() => {
      result.current.getRootProps().onDrop?.({
        preventDefault: () => {},
        stopPropagation: () => {},
        dataTransfer: { files: [makeFile("a.txt", 10, "text/plain")], items: [] },
      } as unknown as React.DragEvent<HTMLElement>);
    });

    expect(result.current.files).toHaveLength(0);
    expect(onFiles).not.toHaveBeenCalled();
  });

  it("sets isDragOver on dragenter and clears on dragleave", () => {
    const { result } = renderHook(() => useFileUpload());

    act(() => {
      result.current.getRootProps().onDragEnter?.({
        preventDefault: () => {},
        stopPropagation: () => {},
        dataTransfer: { items: [] },
        relatedTarget: null,
        currentTarget: document.createElement("div"),
      } as unknown as React.DragEvent<HTMLElement>);
    });

    expect(result.current.isDragOver).toBe(true);

    const container = document.createElement("div");
    act(() => {
      result.current.getRootProps().onDragLeave?.({
        preventDefault: () => {},
        stopPropagation: () => {},
        relatedTarget: null,
        currentTarget: container,
      } as unknown as React.DragEvent<HTMLElement>);
    });

    expect(result.current.isDragOver).toBe(false);
  });
});

describe("useFileUpload — async uploader", () => {
  it("creates upload items and reports progress + success", async () => {
    let resolve!: (value: { url: string }) => void;
    let captured!: { signal: AbortSignal; onProgress: (n: number) => void };
    const uploader = vi.fn(
      (_file: File, ctx: { signal: AbortSignal; onProgress: (n: number) => void }) =>
        new Promise<{ url: string }>((r) => {
          captured = ctx;
          resolve = r;
        }),
    );

    const { result } = renderHook(() => useFileUpload({ uploader, multiple: true }));
    const file = makeFile("a.txt", 10, "text/plain");

    await act(async () => {
      const input = { target: { files: [file], value: "" } } as unknown as React.ChangeEvent<HTMLInputElement>;
      result.current.getInputProps().onChange(input);
    });

    expect(result.current.uploads).toHaveLength(1);
    expect(["queued", "uploading"]).toContain(result.current.uploads[0]!.status);

    await act(async () => {
      captured.onProgress(0.5);
      await Promise.resolve();
    });
    expect(result.current.uploads[0]!.progress).toBe(0.5);

    await act(async () => {
      resolve({ url: "/cdn/a.txt" });
      await Promise.resolve();
    });
    expect(result.current.uploads[0]!.status).toBe("success");
    expect((result.current.uploads[0]!.result as { url: string }).url).toBe("/cdn/a.txt");
  });

  it("transitions to error when uploader rejects", async () => {
    let reject!: (e: Error) => void;
    const uploader = vi.fn(
      () =>
        new Promise<{ url: string }>((_, r) => {
          reject = r;
        }),
    );
    const { result } = renderHook(() => useFileUpload({ uploader, multiple: true }));
    const file = makeFile("b.txt", 5, "text/plain");
    await act(async () => {
      const input = { target: { files: [file], value: "" } } as unknown as React.ChangeEvent<HTMLInputElement>;
      result.current.getInputProps().onChange(input);
    });

    await act(async () => {
      reject(new Error("nope"));
      await Promise.resolve();
    });
    const item = result.current.uploads[0]!;
    expect(item.status).toBe("error");
    expect(item.error?.message).toBe("nope");
  });

  it("retryUpload requeues an errored upload", async () => {
    let attempts = 0;
    const uploader = vi.fn(() => {
      attempts++;
      if (attempts === 1) return Promise.reject(new Error("first"));
      return Promise.resolve({ url: "ok" });
    });
    const { result } = renderHook(() => useFileUpload({ uploader, multiple: true }));
    const file = makeFile("c.txt", 5, "text/plain");
    await act(async () => {
      const input = { target: { files: [file], value: "" } } as unknown as React.ChangeEvent<HTMLInputElement>;
      result.current.getInputProps().onChange(input);
      await Promise.resolve();
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.uploads[0]!.status).toBe("error");

    const id = result.current.uploads[0]!.id;
    await act(async () => {
      result.current.retryUpload(id);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(result.current.uploads[0]!.status).toBe("success");
    expect(uploader).toHaveBeenCalledTimes(2);
  });

  it("abortUpload marks an in-flight item aborted", async () => {
    let captured!: { signal: AbortSignal };
    const uploader = vi.fn(
      (_file: File, ctx: { signal: AbortSignal }) =>
        new Promise<void>((_, reject) => {
          captured = ctx;
          ctx.signal.addEventListener("abort", () => reject(new Error("aborted")));
        }),
    );
    const { result } = renderHook(() => useFileUpload({ uploader, multiple: true }));
    const file = makeFile("d.txt", 5, "text/plain");
    await act(async () => {
      const input = { target: { files: [file], value: "" } } as unknown as React.ChangeEvent<HTMLInputElement>;
      result.current.getInputProps().onChange(input);
    });
    const id = result.current.uploads[0]!.id;
    expect(captured.signal.aborted).toBe(false);

    await act(async () => {
      result.current.abortUpload(id);
      await Promise.resolve();
    });
    expect(result.current.uploads[0]!.status).toBe("aborted");
  });
});
