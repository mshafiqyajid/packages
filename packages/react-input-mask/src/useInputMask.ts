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

export type SlotType = "digit" | "alpha" | "any";

export interface MaskSegment {
  type: "fixed" | "slot";
  char: string;
  slotType?: SlotType;
}

// ── Options / Result ─────────────────────────────────────────────────────────

export interface UseInputMaskOptions {
  mask: string;
  maskChar?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, rawValue: string) => void;
  onAccept?: (value: string, rawValue: string) => void;
  onComplete?: (value: string, rawValue: string) => void;
  allowedChars?: RegExp;
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

function parseMask(mask: string): MaskSegment[] {
  return mask.split("").map((char) => {
    if (char === "_") return { type: "slot", char, slotType: "digit" };
    if (char === "a") return { type: "slot", char, slotType: "alpha" };
    if (char === "*") return { type: "slot", char, slotType: "any" };
    return { type: "fixed", char };
  });
}

function slotCount(segments: MaskSegment[]): number {
  return segments.filter((s) => s.type === "slot").length;
}

function charMatchesSlot(char: string, slotType: SlotType, allowedChars?: RegExp): boolean {
  if (allowedChars) return allowedChars.test(char);
  if (slotType === "digit") return /\d/.test(char);
  if (slotType === "alpha") return /[a-zA-Z]/.test(char);
  return /[a-zA-Z0-9]/.test(char);
}

// ── Build the display value from rawValue placed into mask ───────────────────

function buildDisplayValue(
  segments: MaskSegment[],
  raw: string,
  maskChar: string,
): string {
  let rawIdx = 0;
  return segments
    .map((seg) => {
      if (seg.type === "fixed") return seg.char;
      const ch = rawIdx < raw.length ? raw[rawIdx++] : maskChar;
      return ch;
    })
    .join("");
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
  allowedChars,
  disabled = false,
  readOnly = false,
}: UseInputMaskOptions): UseInputMaskResult {
  const segments = parseMask(mask);
  const totalSlots = slotCount(segments);
  const isControlled = value !== undefined;

  // Extract raw value from a formatted/display string by stripping mask chars
  const extractRaw = useCallback(
    (formatted: string): string => {
      let raw = "";
      let rawIdx = 0;
      for (let i = 0; i < segments.length && i < formatted.length; i++) {
        const seg = segments[i]!;
        if (seg.type === "slot") {
          const ch = formatted[i];
          if (ch && ch !== maskChar) {
            raw += ch;
          }
          rawIdx++;
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

  const setRaw = useCallback(
    (raw: string) => {
      const display = buildDisplayValue(segments, raw, maskChar);
      if (!isControlled) setInternalRaw(raw);
      onChange?.(display, raw);
    },
    [isControlled, segments, maskChar, onChange],
  );

  const displayValue = buildDisplayValue(segments, currentRaw, maskChar);
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
      let slotCount = 0;
      let targetSeg: MaskSegment | undefined;
      for (const seg of segments) {
        if (seg.type === "slot") {
          if (slotCount === slotIdx) {
            targetSeg = seg;
            break;
          }
          slotCount++;
        }
      }

      if (!targetSeg || targetSeg.slotType === undefined) return;

      if (!charMatchesSlot(e.key, targetSeg.slotType, allowedChars)) return;

      e.preventDefault();
      const newRaw = currentRaw + e.key;
      const newDisplay = buildDisplayValue(segments, newRaw, maskChar);
      if (!isControlled) setInternalRaw(newRaw);
      onChange?.(newDisplay, newRaw);
      onAccept?.(newDisplay, newRaw);

      if (newRaw.length === totalSlots) {
        onComplete?.(newDisplay, newRaw);
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
      maskChar,
      allowedChars,
      isControlled,
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
        if (!charMatchesSlot(ch, targetSeg.slotType, allowedChars)) continue;
        newRaw += ch;
      }

      if (newRaw === currentRaw) return;
      const newDisplay = buildDisplayValue(segments, newRaw, maskChar);
      if (!isControlled) setInternalRaw(newRaw);
      onChange?.(newDisplay, newRaw);
      onAccept?.(newDisplay, newRaw);

      if (newRaw.length === totalSlots) {
        onComplete?.(newDisplay, newRaw);
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
      maskChar,
      allowedChars,
      isControlled,
      onChange,
      onAccept,
      onComplete,
      setCursor,
    ],
  );

  const handleFocus = useCallback(
    (_e: FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // Place cursor at the first empty slot
      const displayPos = nextSlotPosition(segments, currentRaw.length);
      setCursor(displayPos);
    },
    [segments, currentRaw, setCursor],
  );

  const handleBlur = useCallback((_e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
  }, []);

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
