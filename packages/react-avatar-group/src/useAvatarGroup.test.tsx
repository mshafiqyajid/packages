import { describe, it, expect } from "vitest";
import { useAvatarGroup } from "./useAvatarGroup";
import type { AvatarGroupItem } from "./useAvatarGroup";

const makeAvatars = (n: number): AvatarGroupItem[] =>
  Array.from({ length: n }, (_, i) => ({ name: `User ${i + 1}` }));

describe("useAvatarGroup", () => {
  it("groupProps.role is 'group'", () => {
    const { groupProps } = useAvatarGroup({ avatars: makeAvatars(3) });
    expect(groupProps.role).toBe("group");
  });

  it("groupProps aria-label includes total count", () => {
    const { groupProps } = useAvatarGroup({ avatars: makeAvatars(5) });
    expect(groupProps["aria-label"]).toContain("5");
  });

  it("visibleAvatars.length is max-1 when total > max", () => {
    const { visibleAvatars } = useAvatarGroup({ avatars: makeAvatars(6), max: 4 });
    expect(visibleAvatars.length).toBe(3);
  });

  it("overflowCount is total - (max-1) when total > max", () => {
    const { overflowCount } = useAvatarGroup({ avatars: makeAvatars(6), max: 4 });
    expect(overflowCount).toBe(3);
  });

  it("visibleAvatars.length equals total when total <= max", () => {
    const { visibleAvatars } = useAvatarGroup({ avatars: makeAvatars(3), max: 4 });
    expect(visibleAvatars.length).toBe(3);
  });

  it("overflowCount is 0 when total <= max", () => {
    const { overflowCount } = useAvatarGroup({ avatars: makeAvatars(3), max: 4 });
    expect(overflowCount).toBe(0);
  });

  it("overflowProps aria-label shows correct +N more", () => {
    const { overflowProps } = useAvatarGroup({ avatars: makeAvatars(6), max: 4 });
    expect(overflowProps["aria-label"]).toBe("+3 more");
  });

  it("getAvatarProps returns aria-label equal to avatar name", () => {
    const avatars = makeAvatars(2);
    const { getAvatarProps } = useAvatarGroup({ avatars });
    expect(getAvatarProps(avatars[0]!, 0)["aria-label"]).toBe("User 1");
    expect(getAvatarProps(avatars[1]!, 1)["aria-label"]).toBe("User 2");
  });
});
