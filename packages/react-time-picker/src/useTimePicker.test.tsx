import { renderHook, act } from "@testing-library/react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useTimePicker } from "./useTimePicker";
import { TimePickerStyled } from "./styled/TimePickerStyled";

// ── useTimePicker hook ────────────────────────────────────────────────────

describe("useTimePicker — default value parsing", () => {
  it("starts at 00:00 with no defaultValue", () => {
    const { result } = renderHook(() => useTimePicker());
    expect(result.current.hours).toBe(0);
    expect(result.current.minutes).toBe(0);
    expect(result.current.seconds).toBe(0);
  });

  it("parses a 24h defaultValue correctly", () => {
    const { result } = renderHook(() =>
      useTimePicker({ defaultValue: "14:30" }),
    );
    expect(result.current.hours).toBe(14);
    expect(result.current.minutes).toBe(30);
  });

  it("parses HH:mm:ss with showSeconds", () => {
    const { result } = renderHook(() =>
      useTimePicker({ defaultValue: "09:15:45", showSeconds: true }),
    );
    expect(result.current.hours).toBe(9);
    expect(result.current.minutes).toBe(15);
    expect(result.current.seconds).toBe(45);
  });

  it("parses 12h format defaultValue AM", () => {
    const { result } = renderHook(() =>
      useTimePicker({ defaultValue: "09:00 AM", format: "12h" }),
    );
    expect(result.current.hours).toBe(9);
    expect(result.current.period).toBe("AM");
  });

  it("parses 12h format defaultValue PM", () => {
    const { result } = renderHook(() =>
      useTimePicker({ defaultValue: "02:30 PM", format: "12h" }),
    );
    expect(result.current.hours).toBe(2);
    expect(result.current.minutes).toBe(30);
    expect(result.current.period).toBe("PM");
  });

  it("parses a 24h string into 12h internal representation", () => {
    const { result } = renderHook(() =>
      useTimePicker({ defaultValue: "14:00", format: "12h" }),
    );
    expect(result.current.hours).toBe(2);
    expect(result.current.period).toBe("PM");
  });
});

describe("useTimePicker — onChange", () => {
  it("calls onChange with HH:mm when hour changes in 24h mode", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useTimePicker({ defaultValue: "10:00", onChange }),
    );
    act(() => {
      result.current.hourProps.onChange(15);
    });
    expect(onChange).toHaveBeenCalledWith("15:00");
  });

  it("calls onChange with HH:mm when minute changes", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useTimePicker({ defaultValue: "10:00", onChange }),
    );
    act(() => {
      result.current.minuteProps.onChange(45);
    });
    expect(onChange).toHaveBeenCalledWith("10:45");
  });

  it("calls onChange with HH:mm:ss when showSeconds and second changes", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useTimePicker({ defaultValue: "10:00:00", onChange, showSeconds: true }),
    );
    act(() => {
      result.current.secondProps.onChange(30);
    });
    expect(onChange).toHaveBeenCalledWith("10:00:30");
  });

  it("emits 24h canonical value from 12h mode", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useTimePicker({ defaultValue: "02:00 PM", format: "12h", onChange }),
    );
    act(() => {
      result.current.hourProps.onChange(3);
    });
    expect(onChange).toHaveBeenCalledWith("15:00");
  });
});

describe("useTimePicker — 12h format", () => {
  it("toggles period AM->PM and emits correct canonical value", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useTimePicker({ defaultValue: "09:00 AM", format: "12h", onChange }),
    );
    act(() => {
      result.current.periodProps.onChange("PM");
    });
    expect(result.current.period).toBe("PM");
    expect(onChange).toHaveBeenCalledWith("21:00");
  });

  it("converts 12:00 AM to 00:00 in canonical", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useTimePicker({ defaultValue: "12:00 AM", format: "12h", onChange }),
    );
    expect(result.current.value).toBe("00:00");
  });

  it("converts 12:00 PM to 12:00 in canonical", () => {
    const { result } = renderHook(() =>
      useTimePicker({ defaultValue: "12:00 PM", format: "12h" }),
    );
    expect(result.current.value).toBe("12:00");
  });
});

describe("useTimePicker — showSeconds", () => {
  it("canonical value includes seconds when showSeconds=true", () => {
    const { result } = renderHook(() =>
      useTimePicker({ defaultValue: "10:30", showSeconds: true }),
    );
    expect(result.current.value).toBe("10:30:00");
  });

  it("canonical value excludes seconds when showSeconds=false", () => {
    const { result } = renderHook(() =>
      useTimePicker({ defaultValue: "10:30:45", showSeconds: false }),
    );
    expect(result.current.value).toBe("10:30");
  });
});

describe("useTimePicker — step", () => {
  it("step does not affect minute values set directly", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useTimePicker({ defaultValue: "10:00", step: 15, onChange }),
    );
    act(() => {
      result.current.minuteProps.onChange(15);
    });
    expect(onChange).toHaveBeenCalledWith("10:15");
  });
});

describe("useTimePicker — disabled", () => {
  it("does not call onChange when disabled and hour changes", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useTimePicker({ defaultValue: "10:00", onChange, disabled: true }),
    );
    act(() => {
      result.current.hourProps.onChange(15);
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not open dropdown when disabled", () => {
    const { result } = renderHook(() =>
      useTimePicker({ defaultValue: "10:00", disabled: true }),
    );
    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(false);
  });
});

describe("useTimePicker — min/max enforcement", () => {
  it("rejects hours before min", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useTimePicker({ defaultValue: "10:00", onChange, min: "10:00" }),
    );
    act(() => {
      result.current.hourProps.onChange(8);
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("rejects hours after max", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useTimePicker({ defaultValue: "10:00", onChange, max: "17:00" }),
    );
    act(() => {
      result.current.hourProps.onChange(18);
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("allows hours within bounds", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useTimePicker({ defaultValue: "10:00", onChange, min: "09:00", max: "17:00" }),
    );
    act(() => {
      result.current.hourProps.onChange(12);
    });
    expect(onChange).toHaveBeenCalledWith("12:00");
  });
});

describe("useTimePicker — keyboard navigation (isOpen)", () => {
  it("ArrowDown on input opens dropdown", () => {
    const { result } = renderHook(() => useTimePicker({ defaultValue: "10:00" }));
    expect(result.current.isOpen).toBe(false);
    act(() => {
      result.current.inputProps.onKeyDown({
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>);
    });
    expect(result.current.isOpen).toBe(true);
  });

  it("Escape closes dropdown", () => {
    const { result } = renderHook(() => useTimePicker({ defaultValue: "10:00" }));
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
    act(() => {
      result.current.inputProps.onKeyDown({
        key: "Escape",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>);
    });
    expect(result.current.isOpen).toBe(false);
  });
});

// ── TimePickerStyled component (ARIA) ────────────────────────────────────

describe("TimePickerStyled — ARIA attributes", () => {
  it("renders the input with aria-haspopup=listbox", () => {
    render(<TimePickerStyled defaultValue="10:00" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-haspopup", "listbox");
  });

  it("renders label element when label prop given", () => {
    render(<TimePickerStyled label="Meeting time" defaultValue="09:00" />);
    expect(screen.getByText("Meeting time")).toBeInTheDocument();
  });

  it("renders error message when error prop given", () => {
    render(<TimePickerStyled error="Time required" defaultValue="00:00" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Time required");
  });

  it("renders hint text when hint prop given", () => {
    render(<TimePickerStyled hint="Use 24h format" defaultValue="00:00" />);
    expect(screen.getByText("Use 24h format")).toBeInTheDocument();
  });

  it("sets data-disabled on root when disabled", () => {
    const { container } = render(<TimePickerStyled disabled defaultValue="00:00" />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute("data-disabled", "true");
  });

  it("sets data-invalid on root when invalid", () => {
    const { container } = render(<TimePickerStyled invalid defaultValue="00:00" />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute("data-invalid", "true");
  });

  it("sets data-invalid when error prop given", () => {
    const { container } = render(<TimePickerStyled error="Oops" defaultValue="00:00" />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute("data-invalid", "true");
  });

  it("input has aria-invalid when invalid", () => {
    render(<TimePickerStyled invalid defaultValue="00:00" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid");
  });

  it("renders required asterisk when required=true and label given", () => {
    render(<TimePickerStyled required label="Time" defaultValue="00:00" />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });
});

describe("TimePickerStyled — controlled value", () => {
  it("displays formatted value from controlled value prop", () => {
    render(<TimePickerStyled value="14:30" />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("14:30");
  });

  it("calls onChange when input changes", () => {
    const onChange = vi.fn();
    render(<TimePickerStyled value="10:00" onChange={onChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "11:00" } });
    expect(onChange).toHaveBeenCalled();
  });
});
