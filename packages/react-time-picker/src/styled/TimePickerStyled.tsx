import {
  forwardRef,
  useRef,
  useState,
  useCallback,
  useEffect,
  useId,
  type KeyboardEvent,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { useTimePicker } from "../useTimePicker";
import type { TimeFormat, TimePeriod } from "../useTimePicker";

export type TimePickerSize = "sm" | "md" | "lg";
export type TimePickerTone = "neutral" | "primary" | "success" | "danger";

export interface TimePickerStyledProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  format?: TimeFormat;
  showSeconds?: boolean;
  min?: string;
  max?: string;
  step?: number;
  size?: TimePickerSize;
  tone?: TimePickerTone;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
}

function buildHourOptions(fmt: TimeFormat): number[] {
  if (fmt === "12h") {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  }
  return Array.from({ length: 24 }, (_, i) => i);
}

function buildMinuteOptions(step: number): number[] {
  const options: number[] = [];
  for (let m = 0; m < 60; m += step) options.push(m);
  return options;
}

function buildSecondOptions(): number[] {
  return Array.from({ length: 60 }, (_, i) => i);
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function useScrollToSelected(
  ref: React.RefObject<HTMLDivElement | null>,
  selectedIndex: number,
  isOpen: boolean,
) {
  useEffect(() => {
    if (!isOpen || !ref.current) return;
    const item = ref.current.querySelectorAll<HTMLElement>('[role="option"]')[selectedIndex];
    if (item) {
      item.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, selectedIndex]); // eslint-disable-line react-hooks/exhaustive-deps
}

interface ColumnProps {
  options: (number | TimePeriod)[];
  selected: number | TimePeriod;
  onSelect: (v: number | TimePeriod) => void;
  label: string;
  format?: (v: number | TimePeriod) => string;
  isOpen: boolean;
}

function TimeColumn({ options, selected, onSelect, label, format: fmt, isOpen }: ColumnProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const selectedIndex = options.findIndex((o) => o === selected);

  useScrollToSelected(listRef as React.RefObject<HTMLDivElement | null>, selectedIndex, isOpen);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>, idx: number) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIdx = Math.min(idx + 1, options.length - 1);
        const items = listRef.current?.querySelectorAll<HTMLElement>('[role="option"]');
        items?.[nextIdx]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIdx = Math.max(idx - 1, 0);
        const items = listRef.current?.querySelectorAll<HTMLElement>('[role="option"]');
        items?.[prevIdx]?.focus();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const opt = options[idx];
        if (opt !== undefined) onSelect(opt);
      }
    },
    [options, onSelect],
  );

  return (
    <div
      className="rtp-column"
      role="listbox"
      aria-label={label}
      ref={listRef}
    >
      {options.map((opt, idx) => {
        const isSelected = opt === selected;
        const display = fmt ? fmt(opt) : String(opt);
        return (
          <div
            key={String(opt)}
            role="option"
            aria-selected={isSelected}
            className="rtp-option"
            data-selected={isSelected ? "true" : undefined}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onSelect(opt)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
          >
            {display}
          </div>
        );
      })}
    </div>
  );
}

export const TimePickerStyled = forwardRef<HTMLInputElement, TimePickerStyledProps>(
  function TimePickerStyled(
    {
      value,
      defaultValue,
      onChange,
      format = "24h",
      showSeconds = false,
      min,
      max,
      step = 1,
      size = "md",
      tone = "neutral",
      disabled = false,
      readOnly = false,
      required = false,
      invalid = false,
      label,
      hint,
      error,
      id,
      name,
      placeholder,
      className,
      style,
    },
    ref,
  ) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const hintId = `${inputId}-hint`;
    const errorId = `${inputId}-error`;

    const isInvalid = invalid || !!error;
    const effectiveTone = error ? "danger" : tone;

    const defaultPlaceholder =
      placeholder ??
      (format === "12h"
        ? showSeconds
          ? "hh:mm:ss AM"
          : "hh:mm AM"
        : showSeconds
        ? "HH:mm:ss"
        : "HH:mm");

    const picker = useTimePicker({
      value,
      defaultValue,
      onChange,
      format,
      showSeconds,
      min,
      max,
      step,
      disabled,
      readOnly,
    });

    const [mounted, setMounted] = useState(false);
    const [dropdownCoords, setDropdownCoords] = useState<{
      top: number;
      left: number;
      width: number;
    }>({ top: -9999, left: -9999, width: 240 });

    const rootRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setMounted(true);
    }, []);

    const updatePosition = useCallback(() => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const dropHeight = dropdownRef.current?.offsetHeight ?? 240;
      const vh = window.innerHeight;
      const sx = window.scrollX;
      const sy = window.scrollY;

      let top = rect.bottom + sy + 4;
      if (rect.bottom + dropHeight + 4 > vh && rect.top > dropHeight + 4) {
        top = rect.top + sy - dropHeight - 4;
      }

      setDropdownCoords({
        top,
        left: rect.left + sx,
        width: Math.max(rect.width, 240),
      });
    }, []);

    useEffect(() => {
      if (!picker.isOpen) return;
      requestAnimationFrame(() => updatePosition());
    }, [picker.isOpen, updatePosition]);

    useEffect(() => {
      if (!picker.isOpen) return;
      const onScroll = () => updatePosition();
      const onResize = () => updatePosition();
      const onKeyDown = (e: globalThis.KeyboardEvent) => {
        if (e.key === "Escape") picker.close();
      };
      const onMouseDown = (e: globalThis.MouseEvent) => {
        const target = e.target as Node;
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(target) &&
          wrapperRef.current &&
          !wrapperRef.current.contains(target)
        ) {
          picker.close();
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize, { passive: true });
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("mousedown", onMouseDown);
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        document.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("mousedown", onMouseDown);
      };
    }, [picker.isOpen, picker, updatePosition]);

    const hourOptions = buildHourOptions(format);
    const minuteOptions = buildMinuteOptions(step);
    const secondOptions = buildSecondOptions();

    const handleDropdownMouseDown = useCallback((e: MouseEvent) => {
      e.preventDefault();
    }, []);

    const handleSelectHour = useCallback(
      (v: number | TimePeriod) => {
        picker.hourProps.onChange(v as number);
      },
      [picker.hourProps],
    );

    const handleSelectMinute = useCallback(
      (v: number | TimePeriod) => {
        picker.minuteProps.onChange(v as number);
      },
      [picker.minuteProps],
    );

    const handleSelectSecond = useCallback(
      (v: number | TimePeriod) => {
        picker.secondProps.onChange(v as number);
      },
      [picker.secondProps],
    );

    const handleSelectPeriod = useCallback(
      (v: number | TimePeriod) => {
        picker.periodProps.onChange(v as TimePeriod);
      },
      [picker.periodProps],
    );

    const handleWrapperKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Tab") {
          picker.close();
        }
      },
      [picker],
    );

    const dropdownStyle: CSSProperties = {
      position: "absolute",
      top: dropdownCoords.top,
      left: dropdownCoords.left,
      width: dropdownCoords.width,
      zIndex: 9999,
    };

    const ariaDescribedBy = [
      hint && !error ? hintId : null,
      error ? errorId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <div
        ref={rootRef}
        className={["rtp-root", className].filter(Boolean).join(" ")}
        style={style}
        data-size={size}
        data-tone={effectiveTone}
        data-disabled={disabled ? "true" : undefined}
        data-readonly={readOnly ? "true" : undefined}
        data-invalid={isInvalid ? "true" : undefined}
        data-focused={picker.isFocused ? "true" : undefined}
        data-open={picker.isOpen ? "true" : undefined}
      >
        {label && (
          <label className="rtp-label" htmlFor={inputId}>
            {label}
            {required && (
              <span className="rtp-required" aria-hidden="true">
                {" "}*
              </span>
            )}
          </label>
        )}

        <div
          ref={wrapperRef}
          className="rtp-control"
          role="group"
          aria-label="Time picker"
          onKeyDown={handleWrapperKeyDown}
        >
          <span className="rtp-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="8" cy="8" r="6.5" />
              <path d="M8 4.5v3.5l2 1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>

          <input
            ref={ref}
            id={inputId}
            name={name}
            type="text"
            className="rtp-input"
            placeholder={defaultPlaceholder}
            required={required}
            aria-required={required || undefined}
            aria-invalid={isInvalid || undefined}
            aria-describedby={ariaDescribedBy}
            {...picker.inputProps}
          />
        </div>

        {hint && !error && (
          <span id={hintId} className="rtp-hint">
            {hint}
          </span>
        )}
        {error && (
          <span id={errorId} className="rtp-error" role="alert">
            {error}
          </span>
        )}

        {mounted &&
          picker.isOpen &&
          createPortal(
            <div
              ref={dropdownRef}
              className="rtp-dropdown"
              style={dropdownStyle}
              role="presentation"
              onMouseDown={handleDropdownMouseDown}
            >
              <div className="rtp-columns">
                <TimeColumn
                  options={hourOptions}
                  selected={picker.hours}
                  onSelect={handleSelectHour}
                  label="Hours"
                  format={(v) => pad(v as number)}
                  isOpen={picker.isOpen}
                />
                <div className="rtp-column-sep" aria-hidden="true">:</div>
                <TimeColumn
                  options={minuteOptions}
                  selected={picker.minutes}
                  onSelect={handleSelectMinute}
                  label="Minutes"
                  format={(v) => pad(v as number)}
                  isOpen={picker.isOpen}
                />
                {showSeconds && (
                  <>
                    <div className="rtp-column-sep" aria-hidden="true">:</div>
                    <TimeColumn
                      options={secondOptions}
                      selected={picker.seconds}
                      onSelect={handleSelectSecond}
                      label="Seconds"
                      format={(v) => pad(v as number)}
                      isOpen={picker.isOpen}
                    />
                  </>
                )}
                {format === "12h" && (
                  <TimeColumn
                    options={["AM", "PM"] as TimePeriod[]}
                    selected={picker.period}
                    onSelect={handleSelectPeriod}
                    label="Period"
                    isOpen={picker.isOpen}
                  />
                )}
              </div>
            </div>,
            document.body,
          )}
      </div>
    );
  },
);
