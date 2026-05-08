# @mshafiqyajid/react-form

Headless form state management with validation, error handling, and accessible field wrappers.

**[Full docs →](https://docs.shafiqyajid.com/react/form/)**

## Features

- Headless `useForm` hook — bring your own UI
- Styled `<Form>` component with render-prop support
- Sync and async validation
- `validateOn` / `revalidateOn` strategies
- Full ARIA wiring — `aria-invalid`, `aria-describedby`, `aria-required`, `aria-busy`
- Error slide-in animation + field shake on failed submit
- Controlled and uncontrolled modes
- Zero runtime dependencies — pure React

## Install

```bash
npm install @mshafiqyajid/react-form
```

## Headless usage

```tsx
import { useForm } from "@mshafiqyajid/react-form";

function LoginForm() {
  const { register, handleSubmit, formState } = useForm({
    defaultValues: { email: "", password: "" },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.email) errors.email = "Email is required";
      if (!values.password) errors.password = "Password is required";
      return errors;
    },
    onSubmit: async (values) => {
      await login(values.email as string, values.password as string);
    },
  });

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="rfrm-field-email">Email</label>
        <input type="email" {...register("email")} />
        {formState.errors.email && <span role="alert">{formState.errors.email}</span>}
      </div>
      <div>
        <label htmlFor="rfrm-field-password">Password</label>
        <input type="password" {...register("password")} />
        {formState.errors.password && <span role="alert">{formState.errors.password}</span>}
      </div>
      <button type="submit" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
```

## Styled usage

```tsx
import { Form } from "@mshafiqyajid/react-form/styled";
import "@mshafiqyajid/react-form/styles.css";

function LoginForm() {
  return (
    <Form
      defaultValues={{ email: "", password: "" }}
      validate={(values) => {
        const errors: Record<string, string> = {};
        if (!values.email) errors.email = "Email is required";
        if (String(values.password).length < 8)
          errors.password = "At least 8 characters";
        return errors;
      }}
      onSubmit={async (values) => {
        await login(values.email as string, values.password as string);
      }}
    >
      <Form.Field name="email" label="Email" required>
        <input type="email" {.../* register via render prop below */undefined} />
      </Form.Field>
      <Form.Submit>Sign in</Form.Submit>
    </Form>
  );
}
```

### Render prop — access the form controller inside children

```tsx
<Form defaultValues={{ email: "", password: "" }} onSubmit={handleLogin}>
  {(form) => (
    <>
      <Form.Field name="email" label="Email" hint="We'll never share your email." required>
        <input
          type="email"
          {...form.register("email", { required: true })}
          className="my-input"
        />
      </Form.Field>

      <Form.Field name="password" label="Password" required>
        <input
          type="password"
          {...form.register("password", { required: true })}
          className="my-input"
        />
      </Form.Field>

      <Form.Submit>Sign in</Form.Submit>
    </>
  )}
</Form>
```

## API

### `useForm(options)`

| Option | Type | Default | Description |
|---|---|---|---|
| `defaultValues` | `Record<string, unknown>` | `{}` | Initial uncontrolled values |
| `values` | `Record<string, unknown>` | — | Fully controlled values |
| `validate` | `(values) => Record<string, string> \| Promise<…>` | — | Validation function |
| `validateOn` | `"blur" \| "change" \| "submit"` | `"submit"` | When to run validation initially |
| `revalidateOn` | `"blur" \| "change"` | `"change"` | When to re-validate after first error |
| `onSubmit` | `(values, helpers) => void \| Promise<void>` | — | Submit handler (only called when valid) |
| `onError` | `(errors) => void` | — | Called when validation fails on submit |

### `useForm` return value

| Property | Type | Description |
|---|---|---|
| `register(name, opts?)` | `RegisterResult` | Returns props to spread onto an input element |
| `watch(name?)` | `unknown` | Returns current value(s) |
| `setValue(name, value, opts?)` | `void` | Programmatically update a field |
| `setError(name, message)` | `void` | Set a field error |
| `clearErrors(name?)` | `void` | Clear one or all errors |
| `reset(values?)` | `void` | Reset to defaults or given values |
| `handleSubmit` | `FormEventHandler` | Form submit handler — wire to `<form onSubmit>` |
| `formState` | `FormState` | Current form state object |

### `formState`

| Field | Type | Description |
|---|---|---|
| `isSubmitting` | `boolean` | True while `onSubmit` promise is pending |
| `isValid` | `boolean` | No validation errors present |
| `isDirty` | `boolean` | Any value differs from `defaultValues` |
| `errors` | `Record<string, string>` | Current field errors |
| `touchedFields` | `Record<string, boolean>` | Fields that have been blurred |
| `dirtyFields` | `Record<string, boolean>` | Fields that differ from their default |

### `<Form>` (FormStyled) props

Extends all `useForm` options plus:

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode \| ((form) => ReactNode)` | — | Static or render-prop children |
| `className` | `string` | — | Extra class on the `<form>` element |
| `style` | `CSSProperties` | — | Inline style on the `<form>` element |
| `ref` | `Ref<HTMLFormElement>` | — | Forwarded to the `<form>` element |

Data attributes on the form root: `data-submitting`, `data-valid`, `data-dirty`.

### Sub-components

| Component | Key props | Description |
|---|---|---|
| `Form.Field` | `name`, `label?`, `hint?`, `required?` | Wrapper: label + children + hint/error |
| `Form.Label` | — | Standalone `<label>` wired to field id |
| `Form.Hint` | — | Hint text with automatic id for `aria-describedby` |
| `Form.Error` | `name?` | Error text with `role="alert"` + slide-in animation |
| `Form.Submit` | `disabled?` | Submit button with spinner and `aria-busy` |

### CSS variables

| Variable | Default | Description |
|---|---|---|
| `--rfrm-submit-bg` | `#6366f1` | Submit button background |
| `--rfrm-submit-fg` | `#ffffff` | Submit button text |
| `--rfrm-submit-radius` | `8px` | Submit button border radius |
| `--rfrm-label-fg` | `#3f3f46` | Label text color |
| `--rfrm-hint-fg` | `#71717a` | Hint text color |
| `--rfrm-error-fg` | `#dc2626` | Error text color |
| `--rfrm-error-border` | `#dc2626` | Error border color |
| `--rfrm-form-gap` | `1.25rem` | Gap between fields |
| `--rfrm-field-gap` | `0.3rem` | Gap within a field (label → input → hint) |
| `--rfrm-duration` | `150ms` | Animation duration |

Dark mode is applied automatically via a `[data-theme="dark"]` ancestor.
