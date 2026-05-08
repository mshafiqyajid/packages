import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useSidebar } from "./useSidebar";
import type { SidebarSection } from "./useSidebar";
import type React from "react";

const sections: SidebarSection[] = [
  {
    label: "Main",
    items: [
      { id: "dashboard", label: "Dashboard" },
      {
        id: "projects",
        label: "Projects",
        children: [
          { id: "active", label: "Active" },
          { id: "archived", label: "Archived" },
        ],
      },
      { id: "settings", label: "Settings", disabled: true },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "profile", label: "Profile", badge: "3" },
      { id: "billing", label: "Billing" },
    ],
  },
];

describe("useSidebar", () => {
  it("defaults to expanded (not collapsed)", () => {
    const { result } = renderHook(() => useSidebar({ sections }));
    expect(result.current.isCollapsed).toBe(false);
  });

  it("defaultCollapsed=true starts collapsed", () => {
    const { result } = renderHook(() =>
      useSidebar({ sections, defaultCollapsed: true }),
    );
    expect(result.current.isCollapsed).toBe(true);
  });

  it("toggle() flips collapsed state", () => {
    const { result } = renderHook(() => useSidebar({ sections }));
    expect(result.current.isCollapsed).toBe(false);
    act(() => result.current.toggle());
    expect(result.current.isCollapsed).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.isCollapsed).toBe(false);
  });

  it("controlled collapsed prop is respected", () => {
    const { result } = renderHook(() =>
      useSidebar({ sections, collapsed: true }),
    );
    expect(result.current.isCollapsed).toBe(true);
    // toggle fires onCollapse but does NOT flip internal state when controlled
    act(() => result.current.toggle());
    expect(result.current.isCollapsed).toBe(true);
  });

  it("onCollapse callback fires with new value on toggle", () => {
    const onCollapse = vi.fn();
    const { result } = renderHook(() =>
      useSidebar({ sections, onCollapse }),
    );
    act(() => result.current.toggle());
    expect(onCollapse).toHaveBeenCalledWith(true);
    act(() => result.current.toggle());
    expect(onCollapse).toHaveBeenCalledWith(false);
  });

  it("onItemClick fires with correct id and item", () => {
    const onItemClick = vi.fn();
    const { result } = renderHook(() => useSidebar({ sections, onItemClick }));
    const props = result.current.getItemProps(sections[0]!.items[0]!);
    act(() => props.onClick());
    expect(onItemClick).toHaveBeenCalledWith(
      "dashboard",
      expect.objectContaining({ id: "dashboard" }),
    );
  });

  it("disabled item does not trigger onItemClick", () => {
    const onItemClick = vi.fn();
    const { result } = renderHook(() => useSidebar({ sections, onItemClick }));
    const settingsItem = sections[0]!.items[2]!; // disabled: true
    const props = result.current.getItemProps(settingsItem);
    act(() => props.onClick());
    expect(onItemClick).not.toHaveBeenCalled();
  });

  it("active item gets aria-current='page' via activeId", () => {
    const { result } = renderHook(() =>
      useSidebar({ sections, activeId: "dashboard" }),
    );
    const dashProps = result.current.getItemProps(sections[0]!.items[0]!);
    expect(dashProps["aria-current"]).toBe("page");
    const profileProps = result.current.getItemProps(sections[1]!.items[0]!);
    expect(profileProps["aria-current"]).toBeUndefined();
  });

  it("nested section toggleSection expands and collapses", () => {
    const { result } = renderHook(() => useSidebar({ sections }));
    expect(result.current.isExpanded("projects")).toBe(false);
    act(() => result.current.toggleSection("projects"));
    expect(result.current.isExpanded("projects")).toBe(true);
    act(() => result.current.toggleSection("projects"));
    expect(result.current.isExpanded("projects")).toBe(false);
  });

  it("clicking a parent item with children toggles its section, not onItemClick", () => {
    const onItemClick = vi.fn();
    const { result } = renderHook(() => useSidebar({ sections, onItemClick }));
    const projectsItem = sections[0]!.items[1]!; // has children
    const props = result.current.getItemProps(projectsItem);
    act(() => props.onClick());
    expect(result.current.isExpanded("projects")).toBe(true);
    expect(onItemClick).not.toHaveBeenCalled();
  });

  it("ArrowDown navigates to next visible item", () => {
    const { result } = renderHook(() => useSidebar({ sections }));
    const mockEls: Record<string, { focus: ReturnType<typeof vi.fn> }> = {
      dashboard: { focus: vi.fn() },
      projects: { focus: vi.fn() },
      profile: { focus: vi.fn() },
      billing: { focus: vi.fn() },
    };
    act(() => {
      for (const [id, el] of Object.entries(mockEls)) {
        result.current.registerItemRef(id, el as unknown as HTMLElement);
      }
    });
    const dashProps = result.current.getItemProps(sections[0]!.items[0]!);
    act(() => {
      dashProps.onKeyDown({
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(mockEls["projects"]!.focus).toHaveBeenCalled();
  });

  it("ArrowUp navigates to previous visible item", () => {
    const { result } = renderHook(() => useSidebar({ sections }));
    const mockEls: Record<string, { focus: ReturnType<typeof vi.fn> }> = {
      dashboard: { focus: vi.fn() },
      projects: { focus: vi.fn() },
    };
    act(() => {
      for (const [id, el] of Object.entries(mockEls)) {
        result.current.registerItemRef(id, el as unknown as HTMLElement);
      }
    });
    const projectsItem = sections[0]!.items[1]!;
    const projectsProps = result.current.getItemProps(projectsItem);
    act(() => {
      projectsProps.onKeyDown({
        key: "ArrowUp",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(mockEls["dashboard"]!.focus).toHaveBeenCalled();
  });

  it("getSectionProps returns aria-expanded matching isExpanded", () => {
    const { result } = renderHook(() => useSidebar({ sections }));
    const props = result.current.getSectionProps("projects", "Projects");
    expect(props["aria-expanded"]).toBe(false);
    act(() => result.current.toggleSection("projects"));
    const propsAfter = result.current.getSectionProps("projects", "Projects");
    expect(propsAfter["aria-expanded"]).toBe(true);
  });
});
