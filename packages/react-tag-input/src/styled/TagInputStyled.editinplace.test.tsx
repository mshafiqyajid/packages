import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TagInputStyled } from "./TagInputStyled";

describe("TagInputStyled — edit-in-place (double-click)", () => {
  it("double-clicking a tag opens an edit input pre-filled with the tag value", async () => {
    render(
      <TagInputStyled
        value={["react", "vue"]}
        onChange={() => {}}
      />,
    );
    const tagLabel = screen.getByText("react");
    const tagEl = tagLabel.closest(".rti-tag")!;
    fireEvent.dblClick(tagEl);

    const editInput = document.querySelector<HTMLInputElement>(".rti-tag-edit-input");
    expect(editInput).not.toBeNull();
    expect(editInput!.value).toBe("react");
  });

  it("adds rti-tag--editing class while editing", () => {
    render(
      <TagInputStyled
        value={["react", "vue"]}
        onChange={() => {}}
      />,
    );
    const tagEl = screen.getByText("react").closest(".rti-tag")!;
    fireEvent.dblClick(tagEl);
    expect(tagEl).toHaveClass("rti-tag--editing");
  });

  it("pressing Enter commits the edited value via onChange", () => {
    const onChange = vi.fn();
    render(
      <TagInputStyled
        value={["react", "vue"]}
        onChange={onChange}
      />,
    );
    const tagEl = screen.getByText("react").closest(".rti-tag")!;
    fireEvent.dblClick(tagEl);

    const editInput = document.querySelector<HTMLInputElement>(".rti-tag-edit-input")!;
    fireEvent.change(editInput, { target: { value: "React.js" } });
    fireEvent.keyDown(editInput, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith(["React.js", "vue"]);
  });

  it("pressing Escape cancels editing without calling onChange", () => {
    const onChange = vi.fn();
    render(
      <TagInputStyled
        value={["react", "vue"]}
        onChange={onChange}
      />,
    );
    const tagEl = screen.getByText("react").closest(".rti-tag")!;
    fireEvent.dblClick(tagEl);

    const editInput = document.querySelector<HTMLInputElement>(".rti-tag-edit-input")!;
    fireEvent.change(editInput, { target: { value: "changed" } });
    fireEvent.keyDown(editInput, { key: "Escape" });

    expect(onChange).not.toHaveBeenCalled();
    expect(document.querySelector(".rti-tag-edit-input")).toBeNull();
  });

  it("blurring the edit input commits the edit", () => {
    const onChange = vi.fn();
    render(
      <TagInputStyled
        value={["react", "vue"]}
        onChange={onChange}
      />,
    );
    const tagEl = screen.getByText("react").closest(".rti-tag")!;
    fireEvent.dblClick(tagEl);

    const editInput = document.querySelector<HTMLInputElement>(".rti-tag-edit-input")!;
    fireEvent.change(editInput, { target: { value: "React.js" } });
    fireEvent.blur(editInput);

    expect(onChange).toHaveBeenCalledWith(["React.js", "vue"]);
  });

  it("committing the same value does NOT call onChange", () => {
    const onChange = vi.fn();
    render(
      <TagInputStyled
        value={["react", "vue"]}
        onChange={onChange}
      />,
    );
    const tagEl = screen.getByText("react").closest(".rti-tag")!;
    fireEvent.dblClick(tagEl);

    const editInput = document.querySelector<HTMLInputElement>(".rti-tag-edit-input")!;
    fireEvent.keyDown(editInput, { key: "Enter" });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not open editor when disabled=true", () => {
    render(
      <TagInputStyled
        value={["react"]}
        onChange={() => {}}
        disabled
      />,
    );
    const tagEl = screen.getByText("react").closest(".rti-tag")!;
    fireEvent.dblClick(tagEl);
    expect(document.querySelector(".rti-tag-edit-input")).toBeNull();
  });

  it("does not open editor when readOnly=true", () => {
    render(
      <TagInputStyled
        value={["react"]}
        onChange={() => {}}
        readOnly
      />,
    );
    const tagEl = screen.getByText("react").closest(".rti-tag")!;
    fireEvent.dblClick(tagEl);
    expect(document.querySelector(".rti-tag-edit-input")).toBeNull();
  });
});

describe("TagInputStyled — async loadSuggestions", () => {
  it("shows spinner while loadSuggestions is loading", async () => {
    let resolve: (v: string[]) => void = () => {};
    const loadSuggestions = vi.fn(
      () => new Promise<string[]>((r) => { resolve = r; }),
    );

    render(
      <TagInputStyled
        value={[]}
        onChange={() => {}}
        loadSuggestions={loadSuggestions}
        debounceMs={0}
      />,
    );

    const input = document.querySelector<HTMLInputElement>(".rti-input")!;
    fireEvent.change(input, { target: { value: "al" } });

    await waitFor(() => {
      expect(document.querySelector(".rti-spinner")).not.toBeNull();
    });

    await waitFor(() => { resolve(["alice", "alan"]); });
  });

  it("shows suggestions returned by loadSuggestions", async () => {
    const loadSuggestions = vi.fn(() =>
      Promise.resolve(["alice", "alan"]),
    );

    render(
      <TagInputStyled
        value={[]}
        onChange={() => {}}
        loadSuggestions={loadSuggestions}
        debounceMs={0}
      />,
    );

    const input = document.querySelector<HTMLInputElement>(".rti-input")!;
    fireEvent.change(input, { target: { value: "al" } });

    await waitFor(() => {
      expect(screen.getByText("alice")).toBeInTheDocument();
      expect(screen.getByText("alan")).toBeInTheDocument();
    });
  });
});
