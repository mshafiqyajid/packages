---
"@mshafiqyajid/react-number-input": patch
"@mshafiqyajid/react-tag-input": patch
"@mshafiqyajid/react-phone-input": patch
"@mshafiqyajid/react-color": patch
"@mshafiqyajid/react-color-input": patch
"@mshafiqyajid/react-progress": patch
"@mshafiqyajid/react-avatar": patch
"@mshafiqyajid/react-badge": patch
"@mshafiqyajid/react-copy-button": patch
"@mshafiqyajid/react-rich-text": patch
"@mshafiqyajid/react-file-upload": patch
"@mshafiqyajid/react-switch": patch
"@mshafiqyajid/react-slider": patch
"@mshafiqyajid/react-toast": patch
---

docs: sync README with current API surface (no code changes).

The README is bundled into the npm tarball at publish time, so updates to README.md only reach npm with a republish. This patch-bump republishes 14 packages whose READMEs had drifted behind props/features that already shipped — so the npm package pages now match the current API.

What's covered per package:

- **number-input**: `bigStep`, `wheelEnabled`, hold-to-repeat, keyboard table.
- **tag-input**: `pasteDelimiters`, `transform`, `backspaceEditsLastTag`; corrected `tagVariant` values (`subtle`, not `soft`).
- **phone-input**: `preferredCountries`, `searchable`, `searchPlaceholder`, `disableCountrySelector`.
- **color**: `presets`, `disabled`.
- **color-input**: `presets`, `recentColors`, `onRecentColorsChange`, `recentColorsLimit`, `eyeDropper`, `format="hsl"`.
- **progress**: `segments`, `formatValue`.
- **avatar**: `autoColor`, `showLoading`.
- **badge**: `maxCount`, `pulse`, `uppercase`, `hideOnZero`, `showZero`.
- **copy-button**: `errorLabel`.
- **rich-text**: `sanitizePaste`, `allowedTags`, `transformPaste`.
- **file-upload**: full Props table (`variant`, `multiple`, `accept`, `maxSize`, `maxFiles`, `uploader`, `concurrency`, `autoUpload`, callbacks, `renderPreview`).
- **switch**: full Props table including async-pending semantics.
- **slider**: full Props table (`range`, `marks`, `transform`, etc.).
- **toast**: Toast options table (`type`, `title`, `duration`, `action`, `id`).
