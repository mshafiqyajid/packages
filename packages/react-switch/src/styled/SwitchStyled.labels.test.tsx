import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SwitchStyled } from "./SwitchStyled";

describe("SwitchStyled — track labels", () => {
  it("renders onLabel inside the track with correct classes", () => {
    render(<SwitchStyled onLabel="ON" />);
    const label = document.querySelector(".rsw-track-label--on");
    expect(label).toBeTruthy();
    expect(label?.textContent).toBe("ON");
  });

  it("renders offLabel inside the track with correct classes", () => {
    render(<SwitchStyled offLabel="OFF" />);
    const label = document.querySelector(".rsw-track-label--off");
    expect(label).toBeTruthy();
    expect(label?.textContent).toBe("OFF");
  });

  it("renders both onLabel and offLabel together", () => {
    render(<SwitchStyled onLabel="ON" offLabel="OFF" />);
    expect(document.querySelector(".rsw-track-label--on")?.textContent).toBe("ON");
    expect(document.querySelector(".rsw-track-label--off")?.textContent).toBe("OFF");
  });

  it("does not render track label spans when labels are omitted", () => {
    render(<SwitchStyled />);
    expect(document.querySelector(".rsw-track-label")).toBeNull();
  });

  it("track labels are aria-hidden", () => {
    render(<SwitchStyled onLabel="ON" offLabel="OFF" />);
    const labels = document.querySelectorAll(".rsw-track-label");
    labels.forEach((el) => {
      expect(el.getAttribute("aria-hidden")).toBe("true");
    });
  });
});

describe("SwitchStyled — thumb icons", () => {
  it("renders thumbIconOn and thumbIconOff inside the thumb", () => {
    render(<SwitchStyled thumbIconOn={<span data-testid="icon-on" />} thumbIconOff={<span data-testid="icon-off" />} />);
    expect(screen.getByTestId("icon-on")).toBeTruthy();
    expect(screen.getByTestId("icon-off")).toBeTruthy();
  });

  it("wraps thumb icons in rsw-thumb-icon container", () => {
    render(<SwitchStyled thumbIconOn="✓" />);
    expect(document.querySelector(".rsw-thumb-icon")).toBeTruthy();
    expect(document.querySelector(".rsw-thumb-icon__on")).toBeTruthy();
    expect(document.querySelector(".rsw-thumb-icon__off")).toBeTruthy();
  });

  it("does not render rsw-thumb-icon when neither thumb icon is provided", () => {
    render(<SwitchStyled />);
    expect(document.querySelector(".rsw-thumb-icon")).toBeNull();
  });

  it("hides thumb icon when loading state is active (spinner takes precedence)", () => {
    render(<SwitchStyled loading thumbIconOn="✓" thumbIconOff="✗" />);
    expect(document.querySelector(".rsw-thumb-icon")).toBeNull();
    expect(document.querySelector(".rsw-spinner")).toBeTruthy();
  });
});
