# @mshafiqyajid/react-phone-input

Phone number input with country selector for React. Headless hook + styled drop-in. Auto-formatting, flag emoji, validation, dark mode. Zero runtime dependencies.

**[Full docs →](https://docs.shafiqyajid.com/react/phone-input/)**

## Install

```bash
npm install @mshafiqyajid/react-phone-input
```

## Headless usage

```tsx
import { usePhoneInput } from "@mshafiqyajid/react-phone-input";

function MyPhoneInput() {
  const { inputProps, country, setCountry, dialCode, formattedValue, isValid } =
    usePhoneInput({ defaultCountry: "US" });

  return (
    <div>
      <select value={country} onChange={(e) => setCountry(e.target.value)}>
        <option value="US">🇺🇸 +1</option>
        <option value="GB">🇬🇧 +44</option>
      </select>
      <input {...inputProps} placeholder={`+${dialCode}`} />
      {isValid && <span>Valid</span>}
    </div>
  );
}
```

## Styled usage

```tsx
import { PhoneInputStyled } from "@mshafiqyajid/react-phone-input/styled";
import "@mshafiqyajid/react-phone-input/styles.css";

function App() {
  return (
    <PhoneInputStyled
      defaultCountry="US"
      label="Phone number"
      hint="We'll only use this for account recovery"
      size="md"
      tone="primary"
      showFlag
    />
  );
}
```

## Country dropdown

```tsx
<PhoneInputStyled
  defaultCountry="MY"
  preferredCountries={["MY", "SG", "ID"]}  // pinned to the top
  searchable                                // search input on top
  searchPlaceholder="Search countries..."
/>
```

## Props (additions)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `preferredCountries` | `string[]` | — | ISO-2 codes pinned to the top of the dropdown (rendered above a divider) |
| `searchable` | `boolean` | `true` | Show a search field at the top of the country dropdown |
| `searchPlaceholder` | `string` | `"Search..."` | Placeholder for the country search input |
| `disableCountrySelector` | `boolean` | `false` | Lock to `defaultCountry` — hides the dropdown trigger |

## License

MIT
