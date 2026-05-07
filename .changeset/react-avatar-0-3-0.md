---
"@mshafiqyajid/react-avatar": minor
---

Add `imagePosition` prop to `AvatarStyled` for focal-point control.

- New `imagePosition` prop — accepts any CSS `object-position` value (e.g. `"top"`, `"30% 20%"`) and forwards it to the avatar `<img>` element. Useful when the subject is off-center in the source photo. Defaults to the browser default (`"center"`).
