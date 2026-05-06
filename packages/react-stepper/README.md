# @mshafiqyajid/react-stepper

Multi-step wizard / stepper for React. Headless `useStepper` hook + styled component. Linear or non-linear progression, validation gates, async-aware, horizontal or vertical layout. Zero dependencies, fully typed.

**[Full docs →](https://docs.shafiqyajid.com/react/stepper/)**

## Install

```bash
npm install @mshafiqyajid/react-stepper
```

## Quick start (styled)

```tsx
import { StepperStyled } from "@mshafiqyajid/react-stepper/styled";
import "@mshafiqyajid/react-stepper/styles.css";

<StepperStyled
  steps={[
    { id: "account", label: "Account", description: "Email + password" },
    {
      id: "billing",
      label: "Billing",
      description: "Card details",
      validate: () => formIsValid || "Add a payment method",
    },
    { id: "review", label: "Review" },
  ]}
  content={{
    account: <AccountForm />,
    billing: <BillingForm />,
    review: <ReviewSummary />,
  }}
  onFinish={() => submit()}
/>
```

## Headless

```tsx
import { useStepper } from "@mshafiqyajid/react-stepper";

const stepper = useStepper({ steps, mode: "linear" });

<>
  {steps.map((s, i) => (
    <button
      key={s.id}
      onClick={() => stepper.goTo(i)}
      aria-current={stepper.activeStep === i ? "step" : undefined}
      disabled={s.disabled}
    >
      {s.label}
    </button>
  ))}

  <div>{content[stepper.activeStepId]}</div>

  <button onClick={() => void stepper.goNext()}>Next</button>
</>
```

## Features

- **Linear / non-linear** — `mode: "linear"` (default) requires sequential progression; `"non-linear"` allows arbitrary jumps.
- **Validation gates** — each step accepts a `validate: () => boolean | string | Promise<...>`. Return `true` to allow `goNext`; return a string to set `error`.
- **Async-aware** — `validate` may return a `Promise`. The hook tracks `isPending` so the UI can disable controls while validating.
- **Horizontal or vertical** layout via `orientation`.
- **Disabled steps** — set `disabled: true` on a step to skip it during prev/next navigation.
- **Reset** — `stepper.reset()` returns to the first step + clears completed/visited state.

## Props (styled)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | `StepperStep[]` | — | Required |
| `content` | `Record<id, ReactNode>` | — | Step content keyed by step id |
| `renderContent` | `(ctx) => ReactNode` | — | Alternative to `content` |
| `renderStep` | `(ctx) => ReactNode` | — | Custom step indicator |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Layout direction |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Indicator size |
| `tone` | `"neutral" \| "primary"` | `"primary"` | Active accent |
| `mode` | `"linear" \| "non-linear"` | `"linear"` | Navigation mode |
| `defaultStep` / `step` / `onStepChange` | controlled state | — | Active step |
| `defaultCompleted` / `completed` / `onCompletedChange` | controlled completed ids | — | — |
| `onFinish` | `() => void` | — | Fires on Finish (after final-step validate) |
| `showFooter` | `boolean` | `true` | Built-in Back / Next / Finish buttons |
| `labels` | `{ back?, next?, finish? }` | — | Customise footer button labels |

### StepperStep

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Required, unique |
| `label` | `ReactNode` | Required |
| `description` | `ReactNode?` | Sub-text below label |
| `icon` | `ReactNode?` | Custom indicator icon |
| `disabled` | `boolean?` | Skipped by prev/next |
| `validate` | `() => boolean \| string \| Promise<...>` | Run before leaving this step |

## License

MIT
