import PropPlayground from "../PropPlayground";
import { OTPInputStyled } from "@mshafiqyajid/react-otp-input/styled";
import "@mshafiqyajid/react-otp-input/styles.css";

export default function OTPInputDemo() {
  return (
    <PropPlayground
      componentName="OTPInputStyled"
      importLine={`import { OTPInputStyled } from "@mshafiqyajid/react-otp-input/styled";\nimport "@mshafiqyajid/react-otp-input/styles.css";`}
      props={[
        { name: "length",    control: { type: "slider", min: 3, max: 8 },                                              defaultValue: 6,        omitWhen: 6 },
        { name: "variant",   control: { type: "segmented", options: ["solid","outline","underline"] as const },         defaultValue: "solid",  omitWhen: "solid" },
        { name: "size",      control: { type: "segmented", options: ["sm","md","lg"] as const },                        defaultValue: "md",     omitWhen: "md" },
        { name: "tone",      control: { type: "segmented", options: ["neutral","primary","success","danger"] as const },defaultValue: "neutral",omitWhen: "neutral" },
        { name: "pattern",   control: { type: "segmented", options: ["numeric","alphanumeric"] as const },              defaultValue: "numeric",omitWhen: "numeric" },
        { name: "mask",      control: { type: "toggle" },                                                               defaultValue: false,    omitWhen: false },
        { name: "autoFocus", control: { type: "toggle" },                                                               defaultValue: false,    omitWhen: false },
      ]}
      staticProps={{ onComplete: "{handleComplete}" }}
      render={(v) => (
        <OTPInputStyled
          key={`${v.length}-${v.pattern}`}
          length={v.length as number}
          variant={v.variant as "solid"|"outline"|"underline"}
          size={v.size as "sm"|"md"|"lg"}
          tone={v.tone as "neutral"|"primary"|"success"|"danger"}
          pattern={v.pattern as "numeric"|"alphanumeric"}
          mask={v.mask as boolean}
          label="Verification code"
          hint="Type or paste to auto-fill"
        />
      )}
    />
  );
}
