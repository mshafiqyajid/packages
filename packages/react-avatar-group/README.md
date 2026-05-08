# @mshafiqyajid/react-avatar-group

Avatar group with overflow indicator, tooltips, and stacking variants.

**[Full docs →](https://docs.shafiqyajid.com/react/avatar-group/)**

## Install

```bash
npm install @mshafiqyajid/react-avatar-group
```

## Quick start

```tsx
import { AvatarGroupStyled } from "@mshafiqyajid/react-avatar-group/styled";
import "@mshafiqyajid/react-avatar-group/styles.css";

const avatars = [
  { name: "Alice", src: "https://i.pravatar.cc/150?u=alice" },
  { name: "Bob" },
  { name: "Carol", src: "https://i.pravatar.cc/150?u=carol" },
  { name: "Dave" },
  { name: "Eve", src: "https://i.pravatar.cc/150?u=eve" },
];

<AvatarGroupStyled avatars={avatars} max={4} size="md" shape="circle" />
```

## Headless

```tsx
import { useAvatarGroup } from "@mshafiqyajid/react-avatar-group";

const { groupProps, visibleAvatars, overflowCount, overflowProps, getAvatarProps } =
  useAvatarGroup({ avatars, max: 4 });

return (
  <div {...groupProps}>
    {visibleAvatars.map((avatar, i) => (
      <span key={i} {...getAvatarProps(avatar, i)}>
        {avatar.name}
      </span>
    ))}
    {overflowCount > 0 && <span {...overflowProps}>+{overflowCount}</span>}
  </div>
);
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| avatars | AvatarGroupItem[] | — | Array of avatar data objects |
| max | number | 4 | Maximum avatars before overflow |
| size | "xs" \| "sm" \| "md" \| "lg" \| "xl" | "md" | Avatar size |
| shape | "circle" \| "square" | "circle" | Avatar shape |
| spacing | "tight" \| "normal" \| "loose" | "normal" | Overlap amount |
| showTooltip | boolean | true | Show name on hover via title |
| overflow | "count" \| "avatars" | "count" | Overflow display mode |
| onOverflowClick | () => void | — | Click handler for overflow badge |

## License

MIT
