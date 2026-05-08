export interface AvatarGroupItem {
  src?: string;
  name?: string;
  fallback?: string;
  href?: string;
}

export interface UseAvatarGroupOptions {
  avatars: AvatarGroupItem[];
  max?: number;
  overflow?: "count" | "avatars";
  onOverflowClick?: () => void;
}

export interface UseAvatarGroupResult {
  groupProps: {
    role: "group";
    "aria-label": string;
  };
  getAvatarProps: (avatar: AvatarGroupItem, index: number) => {
    "aria-label": string | undefined;
  };
  overflowProps: {
    "aria-label": string;
    onClick?: () => void;
    role: "button" | undefined;
    tabIndex: number | undefined;
  };
  visibleAvatars: AvatarGroupItem[];
  overflowCount: number;
}

export function useAvatarGroup(options: UseAvatarGroupOptions): UseAvatarGroupResult {
  const { avatars, max = 4, onOverflowClick } = options;
  const total = avatars.length;
  const hasOverflow = total > max;
  const overflowCount = hasOverflow ? total - (max - 1) : 0;
  const visibleAvatars = hasOverflow ? avatars.slice(0, max - 1) : avatars.slice(0, max);

  return {
    groupProps: {
      role: "group",
      "aria-label": `${total} ${total === 1 ? "member" : "members"}`,
    },
    getAvatarProps: (avatar) => ({
      "aria-label": avatar.name,
    }),
    overflowProps: {
      "aria-label": `+${overflowCount} more`,
      onClick: onOverflowClick,
      role: onOverflowClick ? "button" : undefined,
      tabIndex: onOverflowClick ? 0 : undefined,
    },
    visibleAvatars,
    overflowCount,
  };
}
