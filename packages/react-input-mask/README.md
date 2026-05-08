# @mshafiqyajid/react-input-mask

Headless input mask hook and styled masked input for React.

**[Full docs →](https://docs.shafiqyajid.com/react/input-mask/)**

## Install

```bash
npm install @mshafiqyajid/react-input-mask
```

## Quick start

```tsx
import { InputMaskStyled } from "@mshafiqyajid/react-input-mask/styled";
import "@mshafiqyajid/react-input-mask/styles.css";

const [phone, setPhone] = useState("");

<InputMaskStyled
  mask="(___) ___-____"
  label="Phone"
  value={phone}
  onChange={(value, rawValue) => setPhone(value)}
/>
```

## Mask format

| Character | Accepts |
|-----------|---------|
| `_` | Digit (0–9) |
| `a` | Letter (a–z, A–Z) |
| `*` | Alphanumeric |
| Any other | Fixed literal |

## Headless usage

```tsx
import { useInputMask } from "@mshafiqyajid/react-input-mask";

const { inputProps, value, rawValue, isComplete } = useInputMask({
  mask: "__/__/____",
  onChange: (value, rawValue) => console.log(value, rawValue),
});

return <input {...inputProps} />;
```

## License

MIT
