import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

export type TimeFormat = "12h" | "24h";
export type TimePeriod = "AM" | "PM";

export interface UseTimePickerOptions {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  format?: TimeFormat;
  showSeconds?: boolean;
  min?: string;
  max?: string;
  step?: number;
  disabled?: boolean;
  readOnly?: boolean;
}

export interface UseTimePickerReturn {
  inputProps: {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    onFocus: () => void;
    onBlur: () => void;
    readOnly?: boolean;
    disabled?: boolean;
    "aria-haspopup": "listbox";
    "aria-expanded": boolean;
  };
  hourProps: {
    value: number;
    onChange: (h: number) => void;
  };
  minuteProps: {
    value: number;
    onChange: (m: number) => void;
  };
  secondProps: {
    value: number;
    onChange: (s: number) => void;
  };
  periodProps: {
    value: TimePeriod;
    onChange: (p: TimePeriod) => void;
  };
  value: string;
  setValue: (v: string) => void;
  hours: number;
  minutes: number;
  seconds: number;
  period: TimePeriod;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  isFocused: boolean;
}

function parseTimeString(
  raw: string,
  fmt: TimeFormat,
): { h: number; m: number; s: number; period: TimePeriod } {
  const fallback = { h: 0, m: 0, s: 0, period: "AM" as TimePeriod };
  if (!raw) return fallback;

  const trimmed = raw.trim();

  // Try "hh:mm AM/PM" or "hh:mm:ss AM/PM"
  const period12Match = trimmed.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i,
  );
  if (period12Match) {
    let h = parseInt(period12Match[1] ?? "0", 10);
    const m = parseInt(period12Match[2] ?? "0", 10);
    const s = period12Match[3] ? parseInt(period12Match[3], 10) : 0;
    const p = (period12Match[4] ?? "AM").toUpperCase() as TimePeriod;
    if (h < 1 || h > 12 || m > 59 || s > 59) return fallback;
    return { h, m, s, period: p };
  }

  // Try "HH:mm" or "HH:mm:ss"
  const parts = trimmed.split(":");
  if (parts.length < 2) return fallback;
  const h24 = parseInt(parts[0] ?? "0", 10);
  const m = parseInt(parts[1] ?? "0", 10);
  const s = parts[2] ? parseInt(parts[2], 10) : 0;
  if (isNaN(h24) || isNaN(m) || h24 > 23 || m > 59 || s > 59) return fallback;

  if (fmt === "12h") {
    const period = h24 >= 12 ? "PM" : "AM";
    let h = h24 % 12;
    if (h === 0) h = 12;
    return { h, m, s, period };
  }
  return { h: h24, m, s, period: h24 >= 12 ? "PM" : "AM" };
}

function buildTimeString(
  h: number,
  m: number,
  s: number,
  period: TimePeriod,
  fmt: TimeFormat,
  showSeconds: boolean,
): string {
  let h24 = h;
  if (fmt === "12h") {
    if (period === "AM") {
      h24 = h === 12 ? 0 : h;
    } else {
      h24 = h === 12 ? 12 : h + 12;
    }
  }
  const hh = String(h24).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return showSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
}

function formatDisplayValue(
  h: number,
  m: number,
  s: number,
  period: TimePeriod,
  fmt: TimeFormat,
  showSeconds: boolean,
): string {
  if (fmt === "12h") {
    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");
    return showSeconds ? `${hh}:${mm}:${ss} ${period}` : `${hh}:${mm} ${period}`;
  }
  let h24 = h;
  const hh = String(h24).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return showSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
}

function parseMinuteString(raw: string): { h: number; m: number } | null {
  const parts = raw.split(":");
  if (parts.length < 2) return null;
  const h = parseInt(parts[0] ?? "0", 10);
  const m = parseInt(parts[1] ?? "0", 10);
  if (isNaN(h) || isNaN(m) || h > 23 || m > 59) return null;
  return { h, m };
}

function toMinutes(h: number, m: number): number {
  return h * 60 + m;
}

export function useTimePicker(opts: UseTimePickerOptions = {}): UseTimePickerReturn {
  const {
    value: controlledValue,
    defaultValue,
    onChange,
    format = "24h",
    showSeconds = false,
    min,
    max,
    step: _step = 1,
    disabled = false,
    readOnly = false,
  } = opts;

  const isControlled = controlledValue !== undefined;

  const getInitialState = useCallback(() => {
    const raw = isControlled ? controlledValue! : (defaultValue ?? "");
    return parseTimeString(raw, format);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const initial = getInitialState();
  const [internalHours, setInternalHours] = useState(initial.h);
  const [internalMinutes, setInternalMinutes] = useState(initial.m);
  const [internalSeconds, setInternalSeconds] = useState(initial.s);
  const [internalPeriod, setInternalPeriod] = useState<TimePeriod>(initial.period);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Sync with controlled value changes
  useEffect(() => {
    if (!isControlled) return;
    const parsed = parseTimeString(controlledValue!, format);
    setInternalHours(parsed.h);
    setInternalMinutes(parsed.m);
    setInternalSeconds(parsed.s);
    setInternalPeriod(parsed.period);
  }, [isControlled, controlledValue, format]);

  const computedH = internalHours;
  const computedM = internalMinutes;
  const computedS = internalSeconds;
  const computedPeriod = internalPeriod;

  const displayValue = formatDisplayValue(
    computedH,
    computedM,
    computedS,
    computedPeriod,
    format,
    showSeconds,
  );

  const canonicalValue = buildTimeString(
    computedH,
    computedM,
    computedS,
    computedPeriod,
    format,
    showSeconds,
  );

  const isWithinBounds = useCallback(
    (h24: number, m: number): boolean => {
      const total = toMinutes(h24, m);
      if (min) {
        const p = parseMinuteString(min);
        if (p && total < toMinutes(p.h, p.m)) return false;
      }
      if (max) {
        const p = parseMinuteString(max);
        if (p && total > toMinutes(p.h, p.m)) return false;
      }
      return true;
    },
    [min, max],
  );

  const applyChange = useCallback(
    (h: number, m: number, s: number, period: TimePeriod) => {
      setInternalHours(h);
      setInternalMinutes(m);
      setInternalSeconds(s);
      setInternalPeriod(period);

      const canonical = buildTimeString(h, m, s, period, format, showSeconds);
      onChange?.(canonical);
    },
    [format, showSeconds, onChange],
  );

  const setValue = useCallback(
    (v: string) => {
      const parsed = parseTimeString(v, format);
      applyChange(parsed.h, parsed.m, parsed.s, parsed.period);
    },
    [format, applyChange],
  );

  const changeHours = useCallback(
    (h: number) => {
      if (disabled || readOnly) return;
      let h24 = h;
      if (format === "12h") {
        h24 = computedPeriod === "AM" ? (h === 12 ? 0 : h) : h === 12 ? 12 : h + 12;
      }
      if (!isWithinBounds(h24, computedM)) return;
      applyChange(h, computedM, computedS, computedPeriod);
    },
    [disabled, readOnly, format, computedPeriod, computedM, computedS, isWithinBounds, applyChange],
  );

  const changeMinutes = useCallback(
    (m: number) => {
      if (disabled || readOnly) return;
      let h24 = computedH;
      if (format === "12h") {
        h24 = computedPeriod === "AM" ? (computedH === 12 ? 0 : computedH) : computedH === 12 ? 12 : computedH + 12;
      }
      if (!isWithinBounds(h24, m)) return;
      applyChange(computedH, m, computedS, computedPeriod);
    },
    [disabled, readOnly, format, computedH, computedPeriod, computedS, isWithinBounds, applyChange],
  );

  const changeSeconds = useCallback(
    (s: number) => {
      if (disabled || readOnly) return;
      applyChange(computedH, computedM, s, computedPeriod);
    },
    [disabled, readOnly, computedH, computedM, computedPeriod, applyChange],
  );

  const changePeriod = useCallback(
    (p: TimePeriod) => {
      if (disabled || readOnly) return;
      let h24 = computedH;
      if (p === "AM") {
        h24 = computedH === 12 ? 0 : computedH;
      } else {
        h24 = computedH === 12 ? 12 : computedH + 12;
      }
      if (!isWithinBounds(h24, computedM)) return;
      applyChange(computedH, computedM, computedS, p);
    },
    [disabled, readOnly, computedH, computedM, computedS, isWithinBounds, applyChange],
  );

  const inputRef = useRef<string>("");

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (disabled || readOnly) return;
      const raw = e.target.value;
      inputRef.current = raw;
      const parsed = parseTimeString(raw, format);
      const canonical = buildTimeString(
        parsed.h,
        parsed.m,
        parsed.s,
        parsed.period,
        format,
        showSeconds,
      );
      if (!isControlled) {
        setInternalHours(parsed.h);
        setInternalMinutes(parsed.m);
        setInternalSeconds(parsed.s);
        setInternalPeriod(parsed.period);
      }
      onChange?.(canonical);
    },
    [disabled, readOnly, format, showSeconds, isControlled, onChange],
  );

  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      } else if (e.key === "ArrowDown" && !isOpen) {
        e.preventDefault();
        if (!disabled && !readOnly) setIsOpen(true);
      } else if (e.key === "Tab") {
        setIsOpen(false);
      }
    },
    [isOpen, disabled, readOnly],
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (!disabled && !readOnly) setIsOpen(true);
  }, [disabled, readOnly]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const openDropdown = useCallback(() => {
    if (disabled || readOnly) return;
    setIsOpen(true);
  }, [disabled, readOnly]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    inputProps: {
      value: displayValue,
      onChange: handleInputChange,
      onKeyDown: handleInputKeyDown,
      onFocus: handleFocus,
      onBlur: handleBlur,
      readOnly: readOnly || undefined,
      disabled: disabled || undefined,
      "aria-haspopup": "listbox",
      "aria-expanded": isOpen,
    },
    hourProps: {
      value: computedH,
      onChange: changeHours,
    },
    minuteProps: {
      value: computedM,
      onChange: changeMinutes,
    },
    secondProps: {
      value: computedS,
      onChange: changeSeconds,
    },
    periodProps: {
      value: computedPeriod,
      onChange: changePeriod,
    },
    value: canonicalValue,
    setValue,
    hours: computedH,
    minutes: computedM,
    seconds: computedS,
    period: computedPeriod,
    isOpen,
    open: openDropdown,
    close: closeDropdown,
    isFocused,
  };
}
