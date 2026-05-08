import {
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
  type ClipboardEvent,
  type FocusEvent,
  type ChangeEvent,
} from "react";

// ── Segment types ────────────────────────────────────────────────────────────

export type SlotType = "digit" | "alpha" | "any" | "custom";

export interface MaskSegment {
  type: "fixed" | "slot";
  char: string;
  slotType?: SlotType;
  slotRegex?: RegExp;
}

// ── Format chars ─────────────────────────────────────────────────────────────

export type FormatChars = Record<string, RegExp>;

const DEFAULT_FORMAT_CHARS: FormatChars = {
  _: /\d/,
  a: /[a-zA-Z]/,
  "*": /[a-zA-Z0-9]/,
};

// ── Options / Result ─────────────────────────────────────────────────────────

export interface UseInputMaskOptions {
  mask: string;
  maskChar?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, rawValue: string) => void;
  onAccept?: (value: string, rawValue: string) => void;
  onComplete?: (value: string, rawValue: string) => void;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  allowedChars?: RegExp;
  formatChars?: FormatChars;
  lazy?: boolean;
  showMask?: boolean;
  autoUnmask?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

export interface UseInputMaskResult {
  inputProps: {
    value: string;
    disabled: boolean;
    readOnly: boolean;
    "aria-disabled": boolean | undefined;
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onPaste: (e: ClipboardEvent<HTMLInputElement>) => void;
    onFocus: (e: FocusEvent<HTMLInputElement>) => void;
    onBlur: (e: FocusEvent<HTMLInputElement>) => void;
  };
  value: string;
  rawValue: string;
  isComplete: boolean;
  isFocused: boolean;
}

// ── Mask parsing ─────────────────────────────────────────────────────────────

function parseMask(mask: string, formatChars: FormatChars): MaskSegment[] {
  return mask.split("").map((char) => {
    const regex = formatChars[char];
    if (regex) {
      // Determine a named slotType for built-in chars; custom otherwise
      let slotType: SlotType;
      if (char === "_" && regex === DEFAULT_FORMAT_CHARS._) {
        slotType = "digit";
      } else if (char === "a" && regex === DEFAULT_FORMAT_CHARS.a) {
        slotType = "alpha";
      } else if (char === "*" && regex === DEFAULT_FORMAT_CHARS["*"]) {
        slotType = "any";
      } else {
        slotType = "custom";
      }
      return { type: "slot", char, slotType, slotRegex: regex };
    }
    return { type: "fixed", char };
  });
}

function slotCount(segments: MaskSegment[]): number {
  return segments.filter((s) => s.type === "slot").length;
}

function charMatchesSlot(
  char: string,
  seg: MaskSegment,
  allowedChars?: RegExp,
): boolean {
  if (allowedChars) return allowedChars.test(char);
  if (seg.slotRegex) return seg.slotRegex.test(char);
  if (seg.slotType === "digit") return /\d/.test(char);
  if (seg.slotType === "alpha") return /[a-zA-Z]/.test(char);
  return /[a-zA-Z0-9]/.test(char);
}

// ── Build the display value from rawValue placed into mask ───────────────────

function buildDisplayValue(
  segments: MaskSegment[],
  raw: string,
  maskChar: string,
  lazy: boolean,
  showMask: boolean,
): string {
  // In lazy mode, find how far we need to show (up to lastFilledIndex + 1 slot)
  // In eager mode, show the full mask
  const filledCount = raw.length;

  let rawIdx = 0;
  let result = "";
  let slotIdx = 0;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    if (seg.type === "fixed") {
      // In lazy mode OR when showMask=false: only show fixed chars that sit
      // at or before the next slot to fill (i.e. adjacent to filled content).
      // In eager+showMask mode: always show all fixed chars.
      if (lazy || !showMask) {
        if (slotIdx <= filledCount) {
          result += seg.char;
        }
      } else {
        result += seg.char;
      }
    } else {
      // slot
      if (rawIdx < raw.length) {
        result += raw[rawIdx++];
      } else {
        if (!showMask) {
          // hide maskChar entirely — don't add anything
        } else if (lazy && slotIdx > filledCount) {
          // In lazy mode, stop showing mask beyond the next-to-fill slot
        } else {
          result += maskChar;
        }
      }
      slotIdx++;
    }
  }

  return result;
}

// ── Cursor helpers ───────────────────────────────────────────────────────────

function nextSlotPosition(segments: MaskSegment[], filledSlots: number): number {
  let count = 0;
  for (let i = 0; i < segments.length; i++) {
    if (segments[i]!.type === "slot") {
      if (count === filledSlots) return i;
      count++;
    }
  }
  return segments.length;
}

function displayPositionForCursor(segments: MaskSegment[], rawIndex: number): number {
  let count = 0;
  for (let i = 0; i < segments.length; i++) {
    if (segments[i]!.type === "slot") {
      if (count === rawIndex) return i;
      count++;
    }
  }
  return segments.length;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useInputMask({
  mask,
  maskChar = "_",
  value,
  defaultValue = "",
  onChange,
  onAccept,
  onComplete,
  onFocus,
  onBlur,
  allowedChars,
  formatChars,
  lazy = false,
  showMask = true,
  autoUnmask = false,
  disabled = false,
  readOnly = false,
}: UseInputMaskOptions): UseInputMaskResult {
  const mergedFormatChars: FormatChars = { ...DEFAULT_FORMAT_CHARS, ...formatChars };
  const segments = parseMask(mask, mergedFormatChars);
  const totalSlots = slotCount(segments);
  const isControlled = value !== undefined;

  // Extract raw value from a formatted/display string by stripping mask chars
  const extractRaw = useCallback(
    (formatted: string): string => {
      let raw = "";
      for (let i = 0; i < segments.length && i < formatted.length; i++) {
        const seg = segments[i]!;
        if (seg.type === "slot") {
          const ch = formatted[i];
          if (ch && ch !== maskChar) {
            raw += ch;
          }
        }
      }
      return raw;
    },
    [segments, maskChar],
  );

  const initRaw = extractRaw(defaultValue || value || "");
  const [internalRaw, setInternalRaw] = useState(initRaw);
  const currentRaw = isControlled ? extractRaw(value!) : internalRaw;

  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const buildDisplay = useCallback(
    (raw: string) => buildDisplayValue(segments, raw, maskChar, lazy, showMask),
    [segments, maskChar, lazy, showMask],
  );

  const setRaw = useCallback(
    (raw: string) => {
      const display = buildDisplay(raw);
      const outValue = autoUnmask ? raw : display;
      if (!isControlled) setInternalRaw(raw);
      onChange?.(outValue, raw);
    },
    [isControlled, buildDisplay, autoUnmask, onChange],
  );

  const displayValue = buildDisplay(currentRaw);
  const isComplete = currentRaw.length === totalSlots;

  const setCursor = useCallback((pos: number) => {
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (el) {
        el.setSelectionRange(pos, pos);
      }
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (disabled || readOnly) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        if (currentRaw.length === 0) return;
        const newRaw = currentRaw.slice(0, -1);
        setRaw(newRaw);
        const cursorPos = displayPositionForCursor(segments, newRaw.length);
        setCursor(cursorPos);
        return;
      }

      if (e.key === "Delete") {
        e.preventDefault();
        return;
      }

      // Ignore modifier/special keys
      if (
        e.key.length !== 1 ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey
      ) return;

      if (currentRaw.length >= totalSlots) return;

      const slotIdx = currentRaw.length;
      // Find the slot at this index
      let sCount = 0;
      let targetSeg: MaskSegment | undefined;
      for (const seg of segments) {
        if (seg.type === "slot") {
          if (sCount === slotIdx) {
            targetSeg = seg;
            break;
          }
          sCount++;
        }
      }

      if (!targetSeg || targetSeg.slotType === undefined) return;

      if (!charMatchesSlot(e.key, targetSeg, allowedChars)) return;

      e.preventDefault();
      const newRaw = currentRaw + e.key;
      const newDisplay = buildDisplay(newRaw);
      const outValue = autoUnmask ? newRaw : newDisplay;
      if (!isControlled) setInternalRaw(newRaw);
      onChange?.(outValue, newRaw);
      onAccept?.(outValue, newRaw);

      if (newRaw.length === totalSlots) {
        onComplete?.(outValue, newRaw);
      }

      const cursorPos = displayPositionForCursor(segments, newRaw.length);
      // Move cursor past any trailing fixed chars
      let displayPos = cursorPos;
      if (newRaw.length < totalSlots) {
        displayPos = nextSlotPosition(segments, newRaw.length);
      } else {
        displayPos = segments.length;
      }
      setCursor(displayPos);
    },
    [
      disabled,
      readOnly,
      currentRaw,
      totalSlots,
      segments,
      allowedChars,
      isControlled,
      autoUnmask,
      buildDisplay,
      setRaw,
      onChange,
      onAccept,
      onComplete,
      setCursor,
    ],
  );

  const handleChange = useCallback(
    (_e: ChangeEvent<HTMLInputElement>) => {
      // We handle all input via onKeyDown and onPaste; this prevents React
      // from overriding our controlled value.
    },
    [],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      if (disabled || readOnly) return;
      e.preventDefault();
      const pasted = e.clipboardData.getData("text");
      let newRaw = currentRaw;

      for (const ch of pasted) {
        if (newRaw.length >= totalSlots) break;
        const slotIdx = newRaw.length;
        let sCount = 0;
        let targetSeg: MaskSegment | undefined;
        for (const seg of segments) {
          if (seg.type === "slot") {
            if (sCount === slotIdx) {
              targetSeg = seg;
              break;
            }
            sCount++;
          }
        }
        if (!targetSeg || targetSeg.slotType === undefined) break;
        if (!charMatchesSlot(ch, targetSeg, allowedChars)) continue;
        newRaw += ch;
      }

      if (newRaw === currentRaw) return;
      const newDisplay = buildDisplay(newRaw);
      const outValue = autoUnmask ? newRaw : newDisplay;
      if (!isControlled) setInternalRaw(newRaw);
      onChange?.(outValue, newRaw);
      onAccept?.(outValue, newRaw);

      if (newRaw.length === totalSlots) {
        onComplete?.(outValue, newRaw);
      }

      const displayPos =
        newRaw.length < totalSlots
          ? nextSlotPosition(segments, newRaw.length)
          : segments.length;
      setCursor(displayPos);
    },
    [
      disabled,
      readOnly,
      currentRaw,
      totalSlots,
      segments,
      allowedChars,
      isControlled,
      autoUnmask,
      buildDisplay,
      onChange,
      onAccept,
      onComplete,
      setCursor,
    ],
  );

  const handleFocus = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // Place cursor at the first empty slot
      const displayPos = nextSlotPosition(segments, currentRaw.length);
      setCursor(displayPos);
      onFocus?.(e);
    },
    [segments, currentRaw, setCursor, onFocus],
  );

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    },
    [onBlur],
  );

  // Sync ref so setCursor can find the element
  const refCallback = useCallback((el: HTMLInputElement | null) => {
    inputRef.current = el;
  }, []);

  // Expose refCallback via a symbol property on inputProps so InputMaskStyled
  // can forward both its own ref and this internal ref.
  const inputProps = {
    value: displayValue,
    disabled,
    readOnly,
    "aria-disabled": disabled || undefined,
    onKeyDown: handleKeyDown,
    onChange: handleChange,
    onPaste: handlePaste,
    onFocus: handleFocus,
    onBlur: handleBlur,
    // Attach internal ref via data property (consumed by styled component)
    ref: refCallback,
  } as UseInputMaskResult["inputProps"] & { ref: (el: HTMLInputElement | null) => void };

  return {
    inputProps,
    value: displayValue,
    rawValue: currentRaw,
    isComplete,
    isFocused,
  };
}
