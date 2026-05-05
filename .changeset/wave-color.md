---
"@mshafiqyajid/react-color": minor
---

Color picker polish (non-breaking):

- `presets: string[]` — render a row of click-to-apply swatches below the saturation field. Active swatch lands `data-active="true"`.
- `disabled` prop locks the picker (`data-disabled="true"`, `pointer-events: none`).
- Both apply to all three picker variants (`HexColorPicker`, `RgbaColorPicker`, `HslaColorPicker`).
- New CSS hooks: `.rcp-presets`, `.rcp-preset`, `.rcp-picker[data-disabled]`.
