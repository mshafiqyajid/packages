import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { OTPInputStyled } from "./OTPInputStyled";

describe("<OTPInputStyled />", () => {
  test("renders with default variant/size/tone data-attrs", () => {
    const { container } = render(<OTPInputStyled length={4} />);
    const group = container.querySelector(".rotp-group") as HTMLElement;
    expect(group).toHaveAttribute("data-variant", "solid");
    expect(group).toHaveAttribute("data-size", "md");
    expect(group).toHaveAttribute("data-tone", "neutral");
  });

  test("forwards variant/size/tone", () => {
    const { container } = render(
      <OTPInputStyled
        length={4}
        variant="outline"
        size="lg"
        tone="primary"
      />,
    );
    const group = container.querySelector(".rotp-group") as HTMLElement;
    expect(group).toHaveAttribute("data-variant", "outline");
    expect(group).toHaveAttribute("data-size", "lg");
    expect(group).toHaveAttribute("data-tone", "primary");
  });

  test("error state flips tone to danger and sets aria-invalid", () => {
    const { container } = render(
      <OTPInputStyled length={4} error="Invalid code" />,
    );
    const group = container.querySelector(".rotp-group") as HTMLElement;
    expect(group).toHaveAttribute("data-tone", "danger");
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid code");
  });

  test("hint is shown when no error", () => {
    render(<OTPInputStyled length={4} hint="Check your email" />);
    expect(screen.getByText("Check your email")).toBeInTheDocument();
  });

  test("error replaces hint", () => {
    render(
      <OTPInputStyled length={4} hint="hint here" error="error here" />,
    );
    expect(screen.queryByText("hint here")).toBeNull();
    expect(screen.getByText("error here")).toBeInTheDocument();
  });

  test("label is rendered above the inputs", () => {
    render(<OTPInputStyled length={4} label="Verification code" />);
    expect(screen.getByText("Verification code")).toBeInTheDocument();
  });

  test("masks characters when mask=true", async () => {
    const user = userEvent.setup();
    render(<OTPInputStyled length={4} mask />);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[0]!.focus();
    await user.keyboard("12");
    expect(inputs[0]!.value).toBe("•");
    expect(inputs[1]!.value).toBe("•");
  });

  test("uses custom maskChar", async () => {
    const user = userEvent.setup();
    render(<OTPInputStyled length={4} mask maskChar="*" />);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[0]!.focus();
    await user.keyboard("9");
    expect(inputs[0]!.value).toBe("*");
  });

  test("groupSize inserts separators between groups", () => {
    const { container } = render(
      <OTPInputStyled length={6} groupSize={3} />,
    );
    expect(container.querySelectorAll(".rotp-sep").length).toBe(1);
  });

  test("data-filled is set on filled slots", async () => {
    const user = userEvent.setup();
    const { container } = render(<OTPInputStyled length={4} />);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[0]!.focus();
    await user.keyboard("1");
    const slots = container.querySelectorAll(".rotp-slot");
    expect(slots[0]).toHaveAttribute("data-filled", "true");
    expect(slots[1]).not.toHaveAttribute("data-filled");
  });

  test("name renders hidden input that mirrors the OTP value", async () => {
    const user = userEvent.setup();
    const { container } = render(<OTPInputStyled length={4} name="code" />);
    const hidden = container.querySelector(
      "input[type='hidden'][name='code']",
    ) as HTMLInputElement;
    expect(hidden).not.toBeNull();
    expect(hidden.value).toBe("");
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[0]!.focus();
    await user.keyboard("12");
    expect(hidden.value).toBe("12");
  });

  test("name + controlled value posts current value", () => {
    const { container } = render(
      <OTPInputStyled length={4} name="code" value="9876" onChange={() => {}} />,
    );
    const hidden = container.querySelector(
      "input[type='hidden'][name='code']",
    ) as HTMLInputElement;
    expect(hidden.value).toBe("9876");
  });
});
