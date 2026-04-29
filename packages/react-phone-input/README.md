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

## License

MIT
