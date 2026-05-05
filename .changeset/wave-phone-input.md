---
"@mshafiqyajid/react-phone-input": minor
---

Country selector polish (non-breaking):

- Searchable country list — typing in the dropdown filters by name / ISO code / dial code. `searchable` (default true) and `searchPlaceholder` props.
- `preferredCountries: string[]` — render these ISO2 codes at the top of the list, separated from the rest by a divider.
- `disableCountrySelector` — lock the picker to the current country (still surfaces dial code, but no dropdown).
- New CSS classes / hooks: `.rphi-search`, `.rphi-divider`, `.rphi-empty`, `[data-locked]`. Dark-mode tokens included.
