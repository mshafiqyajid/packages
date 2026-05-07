import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { OTPInputStyled } from "./OTPInputStyled";

describe("<OTPInputStyled /> — mask prop", () => {
  test('mask="always" masks filled cells immediately', async () => {
    const user = userEvent.setup();
    render(<OTPInputStyled length={4} mask="always" />);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[0]!.focus();
    await user.keyboard("12");
    expect(inputs[0]!.value).toBe("•");
    expect(inputs[1]!.value).toBe("•");
    expect(inputs[2]!.value).toBe("");
  });

  test("mask=true (legacy boolean) behaves like always", async () => {
    const user = userEvent.setup();
    render(<OTPInputStyled length={4} mask />);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[0]!.focus();
    await user.keyboard("9");
    expect(inputs[0]!.value).toBe("•");
  });

  test('mask="always" adds rotp-cell--masked class on filled slots', async () => {
    const user = userEvent.setup();
    const { container } = render(<OTPInputStyled length={4} mask="always" />);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[0]!.focus();
    await user.keyboard("1");
    const slots = container.querySelectorAll(".rotp-slot");
    expect(slots[0]).toHaveClass("rotp-cell--masked");
    expect(slots[1]).not.toHaveClass("rotp-cell--masked");
  });

  test('mask="after-complete" only masks when all slots filled', async () => {
    const user = userEvent.setup();
    render(<OTPInputStyled length={3} mask="after-complete" />);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[0]!.focus();
    await user.keyboard("12");
    // Not yet complete — should not mask
    expect(inputs[0]!.value).toBe("1");
    expect(inputs[1]!.value).toBe("2");

    await user.keyboard("3");
    // Now complete — all filled slots should be masked
    expect(inputs[0]!.value).toBe("•");
    expect(inputs[1]!.value).toBe("•");
    expect(inputs[2]!.value).toBe("•");
  });

  test("mask=false shows plain characters (no masking)", async () => {
    const user = userEvent.setup();
    render(<OTPInputStyled length={4} mask={false} />);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[0]!.focus();
    await user.keyboard("5");
    expect(inputs[0]!.value).toBe("5");
  });

  test("maskChar customises the masking character", async () => {
    const user = userEvent.setup();
    render(<OTPInputStyled length={4} mask="always" maskChar="*" />);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[0]!.focus();
    await user.keyboard("7");
    expect(inputs[0]!.value).toBe("*");
  });

  test("empty cells are never masked", async () => {
    render(<OTPInputStyled length={4} mask="always" />);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    // No typing — all empty
    inputs.forEach((input) => {
      expect(input.value).toBe("");
      expect(input).not.toHaveClass("rotp-cell--masked");
    });
  });
});
