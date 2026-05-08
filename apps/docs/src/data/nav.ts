export interface NavItem {
  slug: string;
  label: string;
  icon: string;
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
  "virtual-list", "scroll-area",
]);

export const categories: NavCategory[] = [
  {
    label: "Actions",
    items: [
      { slug: "button",            label: "Button",            icon: "⬜" },
      { slug: "segmented-control", label: "Segmented Control", icon: "🎚️" },
      { slug: "copy-button",       label: "Copy Button",       icon: "📋" },
    ],
  },
  {
    label: "Inputs",
    items: [
      { slug: "checkbox",          label: "Checkbox",          icon: "☑️" },
      { slug: "radio",             label: "Radio",             icon: "🔵" },
      { slug: "switch",            label: "Switch",            icon: "🔘" },
      { slug: "text-input",        label: "Text Input",        icon: "✏️" },
      { slug: "textarea",          label: "Textarea",          icon: "📄" },
      { slug: "number-input",      label: "Number Input",      icon: "🔢" },
      { slug: "phone-input",       label: "Phone Input",       icon: "📞" },
      { slug: "otp-input",         label: "OTP Input",         icon: "🔐" },
      { slug: "color-input",       label: "Color Input",       icon: "🖌️" },
      { slug: "tag-input",         label: "Tag Input",         icon: "🏷️" },
      { slug: "rating",            label: "Rating",            icon: "⭐" },
      { slug: "rich-text",         label: "Rich Text",         icon: "✍️" },
      { slug: "form",              label: "Form",              icon: "📋" },
    ],
  },
  {
    label: "Selection",
    items: [
      { slug: "select",            label: "Select",            icon: "📝" },
      { slug: "combobox",          label: "Combobox",          icon: "🔍" },
      { slug: "multi-select",      label: "Multi Select",      icon: "☑️" },
      { slug: "slider",            label: "Slider",            icon: "🎛️" },
      { slug: "range",             label: "Range",             icon: "↔️" },
      { slug: "date-picker",       label: "Date Picker",       icon: "📆" },
      { slug: "calendar",          label: "Calendar",          icon: "📅" },
      { slug: "color",             label: "Color Picker",      icon: "🎨" },
      { slug: "file-upload",       label: "File Upload",       icon: "📁" },
    ],
  },
  {
    label: "Overlays",
    items: [
      { slug: "modal",             label: "Modal",             icon: "🪟" },
      { slug: "sheet",             label: "Sheet",             icon: "📄" },
      { slug: "tooltip",           label: "Tooltip",           icon: "💬" },
      { slug: "popover",           label: "Popover",           icon: "💭" },
      { slug: "hover-card",        label: "Hover Card",        icon: "🃏" },
      { slug: "dropdown-menu",     label: "Dropdown Menu",     icon: "📋" },
      { slug: "context-menu",      label: "Context Menu",      icon: "🖱️" },
      { slug: "command-palette",   label: "Command Palette",   icon: "⌘"  },
      { slug: "lightbox",          label: "Lightbox",          icon: "🖼️" },
    ],
  },
  {
    label: "Navigation",
    items: [
      { slug: "navbar",            label: "Navbar",            icon: "🧭" },
      { slug: "sidebar",           label: "Sidebar",           icon: "◀️" },
      { slug: "tabs",              label: "Tabs",              icon: "🗂️" },
      { slug: "accordion",         label: "Accordion",         icon: "🪗" },
      { slug: "breadcrumb",        label: "Breadcrumb",        icon: "🔗" },
      { slug: "pagination",        label: "Pagination",        icon: "📑" },
      { slug: "stepper",           label: "Stepper",           icon: "📶" },
      { slug: "sortable",          label: "Sortable",          icon: "↕️" },
    ],
  },
  {
    label: "Data",
    items: [
      { slug: "table",             label: "Table",             icon: "📊" },
      { slug: "chart",             label: "Chart",             icon: "📉" },
      { slug: "kanban",            label: "Kanban",            icon: "🗂️" },
      { slug: "timeline",          label: "Timeline",          icon: "📅" },
      { slug: "tree",              label: "Tree",              icon: "🌳" },
      { slug: "virtual-list",      label: "Virtual List",      icon: "📋" },
    ],
  },
  {
    label: "Display",
    items: [
      { slug: "avatar",            label: "Avatar",            icon: "👤" },
      { slug: "avatar-group",      label: "Avatar Group",      icon: "👥" },
      { slug: "badge",             label: "Badge",             icon: "🏷️" },
      { slug: "chip",              label: "Chip",              icon: "🔖" },
      { slug: "stat",              label: "Stat",              icon: "📈" },
      { slug: "image",             label: "Image",             icon: "🖼️" },
      { slug: "progress",          label: "Progress",          icon: "📊" },
    ],
  },
  {
    label: "Feedback",
    items: [
      { slug: "toast",             label: "Toast",             icon: "🍞" },
      { slug: "alert",             label: "Alert",             icon: "🔔" },
      { slug: "spinner",           label: "Spinner",           icon: "⏳" },
      { slug: "skeleton",          label: "Skeleton",          icon: "💀" },
      { slug: "empty-state",       label: "Empty State",       icon: "📭" },
    ],
  },
  {
    label: "Layout",
    items: [
      { slug: "card",              label: "Card",              icon: "🃏" },
      { slug: "divider",           label: "Divider",           icon: "➖" },
      { slug: "scroll-area",       label: "Scroll Area",       icon: "📜" },
    ],
  },
  {
    label: "Content",
    items: [
      { slug: "carousel",          label: "Carousel",          icon: "🎠" },
      { slug: "code-block",        label: "Code Block",        icon: "💻" },
    ],
  },
];

/** Flat list of every slug — single source of truth for total count. */
export const allSlugs = categories.flatMap((c) => c.items.map((i) => i.slug));
