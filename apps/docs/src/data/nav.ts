export interface NavItem {
  slug: string;
  label: string;
  icon: string;
  description: string;
}

export interface NavCategory {
  label: string;
  items: NavItem[];
}

export const NEW_SLUGS = new Set([
  "alert", "spinner", "radio", "textarea", "card", "divider",
  "pagination", "breadcrumb", "empty-state", "chip",
  "avatar-group", "stat", "image",
  "range", "combobox", "multi-select", "form",
  "sheet", "hover-card", "context-menu", "lightbox",
  "navbar", "sidebar", "sortable",
  "carousel", "calendar",
  "code-block", "skeleton",
  "drawer",
  "input-mask",
  "time-picker",
  "split",
  "signature",
  "mention",
  "spotlight",
]);

export const categories: NavCategory[] = [
  {
    label: "Actions",
    items: [
      { slug: "button",            label: "Button",            icon: "⬜", description: "Trigger actions, submit forms, navigate — your standard click target." },
      { slug: "segmented-control", label: "Segmented Control", icon: "🎚️", description: "Pick one option from a small set, shown as connected side-by-side buttons." },
      { slug: "copy-button",       label: "Copy Button",       icon: "📋", description: "One-click copy-to-clipboard with success and error feedback states." },
    ],
  },
  {
    label: "Inputs",
    items: [
      { slug: "checkbox",          label: "Checkbox",          icon: "☑️", description: "Toggle one or many options on or off, with indeterminate state." },
      { slug: "radio",             label: "Radio",             icon: "🔵", description: "Pick exactly one option from a short list of choices." },
      { slug: "switch",            label: "Switch",            icon: "🔘", description: "On/off toggle for a single boolean setting." },
      { slug: "text-input",        label: "Text Input",        icon: "✏️", description: "Single-line text field with built-in label, hint, and error states." },
      { slug: "textarea",          label: "Textarea",          icon: "📄", description: "Multi-line text field with auto-resize and character counter." },
      { slug: "number-input",      label: "Number Input",      icon: "🔢", description: "Numeric field with stepper buttons, min/max, and locale formatting." },
      { slug: "phone-input",       label: "Phone Input",       icon: "📞", description: "International phone field with country picker and live formatting." },
      { slug: "otp-input",         label: "OTP Input",         icon: "🔐", description: "Multi-cell one-time-password field with auto-advance and paste." },
      { slug: "input-mask",        label: "Input Mask",        icon: "🎭", description: "Text field that enforces a fixed format — dates, IDs, license plates." },
      { slug: "color-input",       label: "Color Input",       icon: "🖌️", description: "Hex/RGB text field paired with a color swatch and inline picker." },
      { slug: "tag-input",         label: "Tag Input",         icon: "🏷️", description: "Type to add removable chips — tags, emails, keywords." },
      { slug: "rating",            label: "Rating",            icon: "⭐", description: "Star (or icon) rating selector, with read-only display mode." },
      { slug: "rich-text",         label: "Rich Text",         icon: "✍️", description: "WYSIWYG editor with toolbar, formatting, lists, and links." },
      { slug: "mention",           label: "Mention",           icon: "💬", description: "Type @ in a textarea to pick from a list of users or items." },
      { slug: "signature",         label: "Signature",         icon: "✒️", description: "Mouse and touch pad to capture a hand-drawn signature as an image." },
      { slug: "form",              label: "Form",              icon: "📋", description: "Schema-driven wrapper that ties fields, validation, and submit together." },
    ],
  },
  {
    label: "Selection",
    items: [
      { slug: "select",            label: "Select",            icon: "📝", description: "Single-select dropdown with search and keyboard navigation." },
      { slug: "combobox",          label: "Combobox",          icon: "🔍", description: "Searchable input that filters a list of options as you type." },
      { slug: "multi-select",      label: "Multi Select",      icon: "☑️", description: "Pick several options at once, shown as removable chips." },
      { slug: "slider",            label: "Slider",            icon: "🎛️", description: "Drag a handle along a track to pick a single number." },
      { slug: "range",             label: "Range",             icon: "↔️", description: "Two-handle slider for picking a min/max numeric range." },
      { slug: "date-picker",       label: "Date Picker",       icon: "📆", description: "Calendar dropdown for picking a single date or a date range." },
      { slug: "time-picker",       label: "Time Picker",       icon: "🕐", description: "Hour, minute, and second picker with 12- or 24-hour formats." },
      { slug: "calendar",          label: "Calendar",          icon: "📅", description: "Inline month grid for date selection or read-only display." },
      { slug: "color",             label: "Color Picker",      icon: "🎨", description: "Full color picker with hue, saturation, alpha, and hex/RGB inputs." },
      { slug: "file-upload",       label: "File Upload",       icon: "📁", description: "Drag-and-drop or click to upload one or many files, with previews." },
    ],
  },
  {
    label: "Overlays",
    items: [
      { slug: "modal",             label: "Modal",             icon: "🪟", description: "Centered dialog that blocks the page until dismissed." },
      { slug: "sheet",             label: "Sheet",             icon: "📄", description: "Side panel that slides in from any edge of the screen." },
      { slug: "drawer",            label: "Drawer",            icon: "📂", description: "Bottom-sheet style panel for mobile-first overlays." },
      { slug: "tooltip",           label: "Tooltip",           icon: "💬", description: "Tiny label that appears on hover to explain an icon or button." },
      { slug: "popover",           label: "Popover",           icon: "💭", description: "Click-triggered floating panel for forms or extra actions." },
      { slug: "hover-card",        label: "Hover Card",        icon: "🃏", description: "Rich preview card that appears on hover — like the one you're seeing now." },
      { slug: "dropdown-menu",     label: "Dropdown Menu",     icon: "📋", description: "Click a button to reveal a menu of related actions." },
      { slug: "context-menu",      label: "Context Menu",      icon: "🖱️", description: "Right-click menu for in-place actions on an element." },
      { slug: "command-palette",   label: "Command Palette",   icon: "⌘",  description: "⌘K-style fuzzy-searchable command launcher with sections and shortcuts." },
      { slug: "spotlight",         label: "Spotlight",         icon: "🔦", description: "Highlight elements with a dimmed backdrop — for tours and onboarding." },
    ],
  },
  {
    label: "Navigation",
    items: [
      { slug: "navbar",            label: "Navbar",            icon: "🧭", description: "Top app bar with brand, links, search, and right-side actions." },
      { slug: "sidebar",           label: "Sidebar",           icon: "◀️", description: "Left or right rail of nav links, collapsible and grouped." },
      { slug: "tabs",              label: "Tabs",              icon: "🗂️", description: "Switch between sibling views without leaving the page." },
      { slug: "accordion",         label: "Accordion",         icon: "🪗", description: "Stack of collapsible panels — one or many open at a time." },
      { slug: "breadcrumb",        label: "Breadcrumb",        icon: "🔗", description: "Trail of links showing where you are in the page hierarchy." },
      { slug: "pagination",        label: "Pagination",        icon: "📑", description: "Page-number controls for splitting long lists across pages." },
      { slug: "stepper",           label: "Stepper",           icon: "📶", description: "Multi-step flow indicator with current, done, and upcoming states." },
      { slug: "sortable",          label: "Sortable",          icon: "↕️", description: "Drag-and-drop list reordering with smooth animation and keyboard support." },
    ],
  },
  {
    label: "Data",
    items: [
      { slug: "table",             label: "Table",             icon: "📊", description: "Sortable, selectable, paginated data grid with custom cell rendering." },
      { slug: "chart",             label: "Chart",             icon: "📉", description: "Line, bar, area, and pie charts for tabular data." },
      { slug: "kanban",            label: "Kanban",            icon: "🗂️", description: "Pointer-event drag with touch + keyboard, column reorder, multi-select, search, rich card metadata." },
      { slug: "timeline",          label: "Timeline",          icon: "📅", description: "Vertical chronological list of events with icons and rich content." },
      { slug: "tree",              label: "Tree",              icon: "🌳", description: "Expandable nested folder/file tree with selection and keyboard nav." },
    ],
  },
  {
    label: "Media",
    items: [
      { slug: "image",             label: "Image",             icon: "🖼️", description: "Smart image with placeholder, lazy-load, and aspect-ratio handling." },
      { slug: "carousel",          label: "Carousel",          icon: "🎠", description: "Swipeable gallery of slides with autoplay, dots, and arrows." },
      { slug: "lightbox",          label: "Lightbox",          icon: "🖼️", description: "Click an image to open it full-screen with zoom and gallery nav." },
      { slug: "avatar",            label: "Avatar",            icon: "👤", description: "Circular profile image with initials fallback and status dot." },
      { slug: "avatar-group",      label: "Avatar Group",      icon: "👥", description: "Stack of overlapping avatars with a +N overflow indicator." },
    ],
  },
  {
    label: "Display",
    items: [
      { slug: "badge",             label: "Badge",             icon: "🏷️", description: "Tiny counter or status pill that sits beside another element." },
      { slug: "chip",              label: "Chip",              icon: "🔖", description: "Compact tag for filters, attributes, or removable selections." },
      { slug: "stat",              label: "Stat",              icon: "📈", description: "Large dashboard number with label and trend delta." },
      { slug: "progress",          label: "Progress",          icon: "📊", description: "Linear or circular progress bar — determinate or indeterminate." },
      { slug: "card",              label: "Card",              icon: "🃏", description: "Generic content container with header, body, and footer slots." },
      { slug: "divider",           label: "Divider",           icon: "➖", description: "Horizontal or vertical line, with optional inline label." },
      { slug: "code-block",        label: "Code Block",        icon: "💻", description: "Syntax-highlighted code with copy button and optional line numbers." },
      { slug: "split",             label: "Split",             icon: "⬛", description: "Resizable two-pane layout with a draggable divider." },
    ],
  },
  {
    label: "Feedback",
    items: [
      { slug: "toast",             label: "Toast",             icon: "🍞", description: "Brief auto-dismiss notification stacked in a corner of the screen." },
      { slug: "alert",             label: "Alert",             icon: "🔔", description: "Inline banner for info, success, warning, or error messages." },
      { slug: "spinner",           label: "Spinner",           icon: "⏳", description: "Loading indicator — dots, ring, or bars in multiple sizes." },
      { slug: "skeleton",          label: "Skeleton",          icon: "💀", description: "Gray placeholder shapes shown while real content loads." },
      { slug: "empty-state",       label: "Empty State",       icon: "📭", description: "Friendly message and illustration shown when there's no data yet." },
    ],
  },
];

/** Flat list of every slug — single source of truth for total count. */
export const allSlugs = categories.flatMap((c) => c.items.map((i) => i.slug));
