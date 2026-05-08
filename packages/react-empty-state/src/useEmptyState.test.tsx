import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useEmptyState } from "./useEmptyState";
import { EmptyStateStyled } from "./styled/EmptyStateStyled";

describe("useEmptyState", () => {
  it("rootProps.role === 'status'", () => {
    const result = useEmptyState({});
    expect(result.rootProps.role).toBe("status");
  });

  it("rootProps['aria-label'] equals title when title is a string", () => {
    const result = useEmptyState({ title: "No items" });
    expect(result.rootProps["aria-label"]).toBe("No items");
  });

  it("rootProps['aria-label'] is undefined when no title provided", () => {
    const result = useEmptyState({});
    expect(result.rootProps["aria-label"]).toBeUndefined();
  });
});

describe("EmptyStateStyled", () => {
  it("renders title when provided", () => {
    render(<EmptyStateStyled title="My Title" />);
    expect(screen.getByText("My Title")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<EmptyStateStyled description="My description text" />);
    expect(screen.getByText("My description text")).toBeInTheDocument();
  });

  it("preset='no-data' renders default title 'No data yet' when no title prop", () => {
    render(<EmptyStateStyled preset="no-data" />);
    expect(screen.getByText("No data yet")).toBeInTheDocument();
  });

  it("preset='error' renders 'Something went wrong' when no title prop", () => {
    render(<EmptyStateStyled preset="error" />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("data-size matches size prop", () => {
    const { container } = render(<EmptyStateStyled size="lg" />);
    expect(container.firstChild).toHaveAttribute("data-size", "lg");
  });

  it("data-preset matches preset prop", () => {
    const { container } = render(<EmptyStateStyled preset="offline" />);
    expect(container.firstChild).toHaveAttribute("data-preset", "offline");
  });

  it("renders action slot when action provided", () => {
    render(<EmptyStateStyled action={<button>Take action</button>} />);
    expect(screen.getByRole("button", { name: "Take action" })).toBeInTheDocument();
  });

  it("title prop overrides preset title", () => {
    render(<EmptyStateStyled preset="no-data" title="Custom title" />);
    expect(screen.getByText("Custom title")).toBeInTheDocument();
    expect(screen.queryByText("No data yet")).not.toBeInTheDocument();
  });

  it("renders secondary action slot", () => {
    render(
      <EmptyStateStyled
        action={<button>Primary</button>}
        secondaryAction={<button>Secondary</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Secondary" })).toBeInTheDocument();
  });

  it("applies data-orientation attribute", () => {
    const { container } = render(<EmptyStateStyled orientation="horizontal" />);
    expect(container.firstChild).toHaveAttribute("data-orientation", "horizontal");
  });
});
