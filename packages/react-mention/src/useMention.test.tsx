import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useMention } from "./useMention";
import type { MentionTrigger, MentionSuggestion } from "./useMention";

const USERS: MentionSuggestion[] = [
  { id: "1", label: "Alice" },
  { id: "2", label: "Bob" },
  { id: "3", label: "Carol" },
];

function makeTrigger(overrides?: Partial<MentionTrigger>): MentionTrigger {
  return {
    char: "@",
    loadSuggestions: () => USERS,
    ...overrides,
  };
}

describe("useMention — value state", () => {
  it("starts with defaultValue", () => {
    const { result } = renderHook(() =>
      useMention({ defaultValue: "hello", triggers: [makeTrigger()] }),
    );
    expect(result.current.value).toBe("hello");
  });

  it("is controlled when value prop is provided", () => {
    const { result } = renderHook(() =>
      useMention({ value: "controlled", onChange: vi.fn(), triggers: [makeTrigger()] }),
    );
    expect(result.current.value).toBe("controlled");
  });

  it("calls onChange when text changes", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger()], onChange }),
    );
    act(() => {
      result.current.textareaProps.onChange({
        target: { value: "hello", selectionStart: 5 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    expect(onChange).toHaveBeenCalledWith("hello");
  });
});

describe("useMention — trigger detection", () => {
  it("opens dropdown when trigger char is typed", async () => {
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger()] }),
    );
    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "hello @", selectionStart: 7 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.triggerChar).toBe("@");
  });

  it("sets query from text after trigger", async () => {
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger()] }),
    );
    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "@ali", selectionStart: 4 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    expect(result.current.query).toBe("ali");
  });

  it("does not trigger if trigger char is mid-word", async () => {
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger()] }),
    );
    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "email@domain", selectionStart: 12 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("closes dropdown when space is typed (allowSpaces=false)", async () => {
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger({ allowSpaces: false })] }),
    );
    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "@alice ", selectionStart: 7 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("keeps dropdown open with spaces when allowSpaces=true", async () => {
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger({ allowSpaces: true })] }),
    );
    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "@alice b", selectionStart: 8 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    expect(result.current.isOpen).toBe(true);
  });

  it("respects minChars — stays closed when query is too short", async () => {
    const loadSuggestions = vi.fn(() => USERS);
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger({ minChars: 2, loadSuggestions })] }),
    );
    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "@a", selectionStart: 2 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    expect(result.current.isOpen).toBe(false);
    expect(loadSuggestions).not.toHaveBeenCalled();
  });

  it("opens when query meets minChars", async () => {
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger({ minChars: 2 })] }),
    );
    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "@al", selectionStart: 3 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    expect(result.current.isOpen).toBe(true);
  });
});

describe("useMention — suggestions loading", () => {
  it("loads synchronous suggestions", async () => {
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger()] }),
    );
    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "@", selectionStart: 1 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    expect(result.current.suggestions).toEqual(USERS);
  });

  it("loads async suggestions", async () => {
    const asyncTrigger = makeTrigger({
      loadSuggestions: () => Promise.resolve(USERS),
    });
    const { result } = renderHook(() =>
      useMention({ triggers: [asyncTrigger] }),
    );
    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "@", selectionStart: 1 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    expect(result.current.suggestions).toEqual(USERS);
  });

  it("respects maxSuggestions", async () => {
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger({ maxSuggestions: 2 })] }),
    );
    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "@", selectionStart: 1 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    expect(result.current.suggestions).toHaveLength(2);
  });
});

describe("useMention — keyboard navigation", () => {
  it("ArrowDown moves activeSuggestion down", async () => {
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger()] }),
    );
    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "@", selectionStart: 1 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    act(() => {
      result.current.textareaProps.onKeyDown({
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLTextAreaElement>);
    });
    expect(result.current.activeSuggestion).toBe(1);
  });

  it("ArrowUp moves activeSuggestion up (min 0)", async () => {
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger()] }),
    );
    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "@", selectionStart: 1 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    act(() => {
      result.current.textareaProps.onKeyDown({
        key: "ArrowUp",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLTextAreaElement>);
    });
    expect(result.current.activeSuggestion).toBe(0);
  });

  it("ArrowDown clamps at last suggestion", async () => {
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger()] }),
    );
    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "@", selectionStart: 1 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    const len = result.current.suggestions.length;
    for (let i = 0; i < len + 5; i++) {
      act(() => {
        result.current.textareaProps.onKeyDown({
          key: "ArrowDown",
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLTextAreaElement>);
      });
    }
    expect(result.current.activeSuggestion).toBe(len - 1);
  });

  it("Escape closes dropdown", async () => {
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger()] }),
    );
    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "@", selectionStart: 1 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    act(() => {
      result.current.textareaProps.onKeyDown({
        key: "Escape",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLTextAreaElement>);
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("Tab closes dropdown", async () => {
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger()] }),
    );
    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "@", selectionStart: 1 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    act(() => {
      result.current.textareaProps.onKeyDown({
        key: "Tab",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLTextAreaElement>);
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("Enter selects active suggestion and inserts it", async () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger()], onChange }),
    );
    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "@", selectionStart: 1 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    act(() => {
      result.current.textareaProps.onKeyDown({
        key: "Enter",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLTextAreaElement>);
    });
    expect(result.current.isOpen).toBe(false);
    expect(onChange).toHaveBeenCalledWith(expect.stringContaining("@Alice"));
  });
});

describe("useMention — selectSuggestion", () => {
  it("inserts the suggestion value into text", async () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger()], onChange }),
    );
    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "hello @", selectionStart: 7 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    act(() => {
      result.current.selectSuggestion(1);
    });
    expect(onChange).toHaveBeenCalledWith(expect.stringContaining("@Bob"));
    expect(result.current.isOpen).toBe(false);
  });

  it("uses suggestion.value when provided", async () => {
    const customTrigger = makeTrigger({
      loadSuggestions: () => [{ id: "x", label: "Alice Smith", value: "AliceS" }],
    });
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useMention({ triggers: [customTrigger], onChange }),
    );
    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "@", selectionStart: 1 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    act(() => {
      result.current.selectSuggestion(0);
    });
    expect(onChange).toHaveBeenCalledWith(expect.stringContaining("@AliceS"));
  });
});

describe("useMention — close()", () => {
  it("close() hides the dropdown", async () => {
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger()] }),
    );
    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "@", selectionStart: 1 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
  });
});

describe("useMention — ARIA props", () => {
  it("textareaProps has role=combobox", () => {
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger()] }),
    );
    expect(result.current.textareaProps.role).toBe("combobox");
  });

  it("aria-expanded is false when closed", () => {
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger()] }),
    );
    expect(result.current.textareaProps["aria-expanded"]).toBe(false);
  });

  it("aria-expanded is true when open", async () => {
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger()] }),
    );
    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "@", selectionStart: 1 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    expect(result.current.textareaProps["aria-expanded"]).toBe(true);
  });

  it("getItemProps returns correct role and aria-selected", async () => {
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger()] }),
    );
    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "@", selectionStart: 1 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    const itemProps = result.current.getItemProps(0);
    expect(itemProps.role).toBe("option");
    expect(itemProps["aria-selected"]).toBe(true);
    const otherProps = result.current.getItemProps(1);
    expect(otherProps["aria-selected"]).toBe(false);
  });

  it("dropdownProps has role=listbox", () => {
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger()] }),
    );
    expect(result.current.dropdownProps.role).toBe("listbox");
  });
});

describe("useMention — multiple triggers", () => {
  it("detects # trigger", async () => {
    const hashTrigger: MentionTrigger = {
      char: "#",
      loadSuggestions: () => [{ id: "t1", label: "react" }, { id: "t2", label: "typescript" }],
    };
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger(), hashTrigger] }),
    );
    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "#re", selectionStart: 3 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.triggerChar).toBe("#");
  });
});

describe("useMention — disabled/readOnly", () => {
  it("textareaProps.disabled is true when disabled", () => {
    const { result } = renderHook(() =>
      useMention({ disabled: true, triggers: [makeTrigger()] }),
    );
    expect(result.current.textareaProps.disabled).toBe(true);
  });

  it("textareaProps.readOnly is true when readOnly", () => {
    const { result } = renderHook(() =>
      useMention({ readOnly: true, triggers: [makeTrigger()] }),
    );
    expect(result.current.textareaProps.readOnly).toBe(true);
  });
});

describe("useMention — onMentionAdd", () => {
  it("calls onMentionAdd with correct triggerChar and suggestion on selection", async () => {
    const onMentionAdd = vi.fn();
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger()], onMentionAdd }),
    );
    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "@", selectionStart: 1 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    act(() => {
      result.current.selectSuggestion(0);
    });
    expect(onMentionAdd).toHaveBeenCalledWith("@", USERS[0]);
  });

  it("onMentionAdd is NOT called when dropdown closed with Escape", async () => {
    const onMentionAdd = vi.fn();
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger()], onMentionAdd }),
    );
    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "@", selectionStart: 1 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    act(() => {
      result.current.textareaProps.onKeyDown({
        key: "Escape",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLTextAreaElement>);
    });
    expect(onMentionAdd).not.toHaveBeenCalled();
  });

  it("onMentionAdd receives correct triggerChar when using # trigger", async () => {
    const onMentionAdd = vi.fn();
    const hashTrigger: MentionTrigger = {
      char: "#",
      loadSuggestions: () => [{ id: "t1", label: "react" }],
    };
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger(), hashTrigger], onMentionAdd }),
    );
    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "#", selectionStart: 1 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    act(() => {
      result.current.selectSuggestion(0);
    });
    expect(onMentionAdd).toHaveBeenCalledWith("#", { id: "t1", label: "react" });
  });
});

describe("useMention — isLoading", () => {
  it("isLoading is false initially", () => {
    const { result } = renderHook(() =>
      useMention({ triggers: [makeTrigger()] }),
    );
    expect(result.current.isLoading).toBe(false);
  });

  it("isLoading is true while async loadSuggestions is pending", async () => {
    let resolveLoad!: (v: MentionSuggestion[]) => void;
    const asyncTrigger = makeTrigger({
      loadSuggestions: () =>
        new Promise<MentionSuggestion[]>((res) => {
          resolveLoad = res;
        }),
    });
    const { result } = renderHook(() =>
      useMention({ triggers: [asyncTrigger] }),
    );

    act(() => {
      result.current.textareaProps.onChange({
        target: { value: "@", selectionStart: 1 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveLoad(USERS);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("isLoading is false after async suggestions resolve", async () => {
    const asyncTrigger = makeTrigger({
      loadSuggestions: () => Promise.resolve(USERS),
    });
    const { result } = renderHook(() =>
      useMention({ triggers: [asyncTrigger] }),
    );
    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "@", selectionStart: 1 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.suggestions).toEqual(USERS);
  });

  it("stale async response is ignored when a newer query is made", async () => {
    const calls: Array<(v: MentionSuggestion[]) => void> = [];
    const asyncTrigger = makeTrigger({
      loadSuggestions: () =>
        new Promise<MentionSuggestion[]>((res) => {
          calls.push(res);
        }),
    });
    const { result } = renderHook(() =>
      useMention({ triggers: [asyncTrigger] }),
    );

    act(() => {
      result.current.textareaProps.onChange({
        target: { value: "@a", selectionStart: 2 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });

    act(() => {
      result.current.textareaProps.onChange({
        target: { value: "@al", selectionStart: 3 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });

    await act(async () => {
      calls[0]!([{ id: "stale", label: "Stale" }]);
    });

    expect(result.current.suggestions.map((s) => s.id)).not.toContain("stale");

    await act(async () => {
      calls[1]!([{ id: "fresh", label: "Fresh" }]);
    });

    expect(result.current.suggestions.map((s) => s.id)).toContain("fresh");
  });
});

describe("useMention — renderSuggestion (in trigger config)", () => {
  it("renderSuggestion field is accepted on MentionTrigger type", () => {
    const renderSuggestion = vi.fn((s: MentionSuggestion, active: boolean) => `${s.label}:${active}`);
    const trigger: MentionTrigger = {
      char: "@",
      loadSuggestions: () => USERS,
      renderSuggestion,
    };
    expect(trigger.renderSuggestion).toBeDefined();
  });

  it("renderSuggestion receives suggestion and isActive values", async () => {
    const renderSuggestion = vi.fn((_s: MentionSuggestion, _active: boolean) => null);
    const trigger: MentionTrigger = {
      char: "@",
      loadSuggestions: () => USERS,
      renderSuggestion,
    };

    const { result } = renderHook(() => useMention({ triggers: [trigger] }));

    await act(async () => {
      result.current.textareaProps.onChange({
        target: { value: "@", selectionStart: 1 },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });

    expect(result.current.suggestions.length).toBeGreaterThan(0);

    result.current.suggestions.forEach((suggestion, index) => {
      const isActive = index === result.current.activeSuggestion;
      trigger.renderSuggestion!(suggestion, isActive);
    });

    expect(renderSuggestion).toHaveBeenCalledWith(USERS[0], true);
    expect(renderSuggestion).toHaveBeenCalledWith(USERS[1], false);
  });
});
