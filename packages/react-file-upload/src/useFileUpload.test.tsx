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
