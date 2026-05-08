# @mshafiqyajid/react-avatar-group

## 0.1.2

### Patch Changes

- 56380e9: Fix gap prop having no effect. CSS variable --ravg-gap was defined at :root where the inline --ravg-gap-override was not visible. Now --ravg-gap-override defaults at :root and children consume it directly so the component's inline style correctly overrides the gap.

## 0.1.1

### Patch Changes

- a178779: Remove dead spacing prop CSS (data-spacing selectors) now that gap prop is the sole overlap control.

## 0.1.0

### Minor Changes

- b3b293e: Initial release of 24 new packages covering feedback, layout, data display, overlays, form inputs, navigation, and interaction.
