# @mshafiqyajid/react-sheet

## 0.1.1

### Patch Changes

- b2e394f: Fix close button (and all interactive children) not responding to clicks when swipeToDismiss is enabled. setPointerCapture on the panel was intercepting pointer events for child buttons. Now skips drag initiation when pointerdown originates from a button, link, input, or other interactive element.

## 0.1.0

### Minor Changes

- b3b293e: Initial release of 24 new packages covering feedback, layout, data display, overlays, form inputs, navigation, and interaction.
