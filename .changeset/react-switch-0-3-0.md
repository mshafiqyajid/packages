---
"@mshafiqyajid/react-switch": minor
---

Add `confirm` guard, track labels (`onLabel`/`offLabel`), and thumb icon slots (`thumbIconOn`/`thumbIconOff`).

- `confirm?: (next: boolean) => boolean | Promise<boolean>` — intercept a toggle before committing; returning/resolving `false` reverts the optimistic change. A Promise triggers a pending/grey state on the track while awaiting.
- `onLabel` / `offLabel` — `ReactNode` rendered inside the track halves; hidden behind the thumb's shadow zone and revealed on the opposite side via opacity transition.
- `thumbIconOn` / `thumbIconOff` — icon rendered inside the thumb circle that cross-fades (180 ms ease) between on and off states.
- Track background crossfades through a brief grey during `confirm` pending state.
- All transitions respect `prefers-reduced-motion`.
- No breaking changes — all new props are optional.
