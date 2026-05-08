# @mshafiqyajid/react-radio

Radio group form control with card and button-group variants.

**[Full docs →](https://docs.shafiqyajid.com/react/radio/)**

## Install

```bash
npm install @mshafiqyajid/react-radio
```

## Quick start

```tsx
import { RadioGroupStyled, RadioItem } from "@mshafiqyajid/react-radio/styled";
import "@mshafiqyajid/react-radio/styles.css";

<RadioGroupStyled defaultValue="a" label="Choose a plan">
  <RadioItem value="a" label="Starter" description="Up to 5 projects" />
  <RadioItem value="b" label="Pro" description="Unlimited projects" />
  <RadioItem value="c" label="Enterprise" description="Custom limits" />
</RadioGroupStyled>
```

## Headless

```tsx
import { useRadioGroup } from "@mshafiqyajid/react-radio";

const { groupProps, getItemProps, value } = useRadioGroup({ defaultValue: "a" });

return (
  <div {...groupProps}>
    {["a", "b", "c"].map((v) => (
      <div key={v} {...getItemProps(v)}>
        {v}
      </div>
    ))}
  </div>
);
```

## License

MIT
