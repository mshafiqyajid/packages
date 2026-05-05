---
"@mshafiqyajid/react-number-input": minor
---

Spinbutton polish (non-breaking):

- `bigStep` option (default `step * 10`) used by Shift+ArrowUp/Down and PageUp/PageDown.
- Home/End jump to `min` / `max` when those bounds are set.
- Hold-to-repeat on the +/- stepper buttons (300 ms initial delay, 50 ms repeat).
- Wheel scroll only adjusts the value when the input is actually focused — no more accidental nudges from page scrolling.
- `wheelEnabled` opt-out for the wheel handler.
- `inputMode` is now derived from precision (`"decimal"` when fractional, otherwise `"numeric"`) for a better mobile keyboard.
- `aria-valuenow` reflects the clamped (committed) value rather than the raw input text.
