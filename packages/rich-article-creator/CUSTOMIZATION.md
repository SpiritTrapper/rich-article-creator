# Customization Guide

This document provides a comprehensive guide to customizing the Rich Article Creator editor using CSS custom properties.

## Quick Start

1. Import the editor styles
2. Create your own CSS file with variable overrides
3. Import your custom CSS after the editor styles

```tsx
import "rich-article-creator/style.css";
import "./my-custom-theme.css";
```

## Complete CSS Variables Reference

### Base Colors

| Variable | Default | Description |
|----------|---------|-------------|
| `--editor-text-color` | `#292d32` | Main text color throughout the editor |
| `--editor-text-auxiliary` | `#8f8f8f` | Secondary text, placeholders, captions |
| `--editor-text-menu` | `#bcbcbc` | Text color in menus and dropdowns |
| `--editor-bg` | `#f5f5f5` | Main page background color |
| `--editor-bg-white` | `#fff` | White background for cards, modals |
| `--editor-bg-fields` | `#f8f8f8` | Background for input fields and code blocks |
| `--editor-bg-spoiler` | `#f1f1f1` | Background for details/summary elements |
| `--editor-bg-active-menu` | `#ebebeb` | Active/hover state for menu items |
| `--editor-border-color` | `#e6e6e6` | Border and outline colors |
| `--editor-border-grey` | `#d9d9d9` | Secondary border color |
| `--editor-shadow` | `rgba(0,0,0,0.2)` | Drop shadows for elevated elements |
| `--editor-overlay` | `rgba(0,0,0,0.7)` | Modal/dialog backdrop overlay |

### Accent Colors

| Variable | Default | Description |
|----------|---------|-------------|
| `--editor-primary` | `#ff6b2d` | Primary action color (buttons, highlights) |
| `--editor-link` | `#6ca0ff` | Hyperlink color in editor content |
| `--editor-link-alt` | `#0085d2` | Alternative link color |
| `--editor-selection` | `#b4d7ff` | Text selection background color |
| `--editor-success` | `#81b796` | Success state (connection indicator) |
| `--editor-success-alt` | `#258954` | Alternative success color |
| `--editor-error` | `#ff6062` | Error state, delete actions |
| `--editor-error-alt` | `#ff524b` | Alternative error color |
| `--editor-warning` | `#f0c23b` | Warning state and alerts |

### Typography

| Variable | Default | Description |
|----------|---------|-------------|
| `--editor-font-family` | `"Open Sans", system-ui, -apple-system, sans-serif` | Main font family for editor content |
| `--editor-font-family-mono` | `"JetBrains Mono", "SF Mono", monospace` | Monospace font for code blocks |
| `--editor-font-size-base` | `18px` | Base font size for paragraphs |
| `--editor-font-size-h2` | `24px` | Font size for h2 headings |
| `--editor-font-size-h3` | `20px` | Font size for h3 headings |
| `--editor-font-line-height` | `1.5` | Base line height multiplier |
| `--editor-font-line-height-h2` | `33px` | Line height for h2 headings |
| `--editor-font-line-height-h3` | `27px` | Line height for h3 headings |

### Spacing Scale

| Variable | Default | Description |
|----------|---------|-------------|
| `--editor-spacing-xs` | `0.25rem` (4px) | Extra small spacing unit |
| `--editor-spacing-sm` | `0.5rem` (8px) | Small spacing unit |
| `--editor-spacing-md` | `0.75rem` (12px) | Medium spacing unit |
| `--editor-spacing-base` | `1rem` (16px) | Base spacing unit |
| `--editor-spacing-lg` | `1.5rem` (24px) | Large spacing unit |
| `--editor-spacing-xl` | `2rem` (32px) | Extra large spacing unit |

### Content Spacing

| Variable | Default | Description |
|----------|---------|-------------|
| `--editor-padding-horizontal` | `56px` | Left and right padding for editor content (desktop) |
| `--editor-padding-horizontal-mobile` | `20px` | Horizontal padding on mobile devices |
| `--editor-margin-paragraph` | `20px` | Top and bottom margin for paragraphs |
| `--editor-margin-heading-top` | `40px` | Top margin for h2 headings |
| `--editor-margin-heading-bottom` | `24px` | Bottom margin for h2 headings |

### Border Radius

| Variable | Default | Description |
|----------|---------|-------------|
| `--editor-radius-sm` | `0.375rem` (6px) | Small border radius |
| `--editor-radius-base` | `0.5rem` (8px) | Base border radius |
| `--editor-radius-md` | `0.75rem` (12px) | Medium border radius |
| `--editor-radius-lg` | `1rem` (16px) | Large border radius |
| `--editor-radius-xl` | `1.25rem` (20px) | Extra large border radius |

### Toolbar

| Variable | Default | Description |
|----------|---------|-------------|
| `--editor-toolbar-height` | `52px` | Height of the main toolbar |
| `--editor-toolbar-extra` | `83px` | Additional toolbar space |
| `--editor-toolbar-btn-size` | `40px` | Size of toolbar buttons |
| `--editor-toolbar-btn-radius` | `8px` | Border radius for toolbar buttons |

### Component Dimensions

| Variable | Default | Description |
|----------|---------|-------------|
| `--editor-dialog-radius` | `16px` | Border radius for dialog modals |
| `--editor-details-radius` | `20px` | Border radius for details/summary |
| `--editor-details-height` | `64px` | Height of summary element |
| `--editor-indicator-size` | `40px` | Size of network indicator (desktop) |
| `--editor-indicator-size-mobile` | `44px` | Size of network indicator (mobile) |
| `--editor-code-bg` | `#f8f8f8` | Background color for code blocks |
| `--editor-code-radius` | `0.5rem` | Border radius for code blocks |
| `--editor-code-padding-y` | `0.75rem` | Vertical padding in code blocks |
| `--editor-code-padding-x` | `1rem` | Horizontal padding in code blocks |
| `--editor-blockquote-border` | `3px` | Width of blockquote left border |
| `--editor-blockquote-padding` | `20px` | Left padding for blockquotes |

### Carousel Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `--carousel-slide-height` | `320px` | Height for horizontal carousel slides |
| `--carousel-slide-spacing` | `16px` | Gap between carousel slides |
| `--carousel-slide-min-width` | `533px` | Minimum width for horizontal slides |
| `--carousel-slide-size` | `85%` | Slide width as percentage of viewport |
| `--carousel-vertical-height` | `520px` | Height for vertical carousel |
| `--carousel-vertical-width` | `270px` | Min width for vertical slides |
| `--carousel-vertical-size` | `50%` | Vertical slide width percentage |
| `--carousel-square-height` | `360px` | Height for square carousel |
| `--carousel-square-width` | `360px` | Min width for square slides |
| `--carousel-square-size` | `60%` | Square slide width percentage |

### Text Formatting Colors

These colors are used for text highlights and color markers in the editor:

| Variable | Default | Description |
|----------|---------|-------------|
| `--editor-color-gray` | `#8f8f8f` | Gray text/background color |
| `--editor-color-brown` | `#bf8888` | Brown text/background |
| `--editor-color-brown-1` | `#9f6b53` | Brown variant 1 |
| `--editor-color-brown-2` | `#d9730f` | Brown variant 2 |
| `--editor-color-brown-3` | `#cb912f` | Brown variant 3 |
| `--editor-color-brown-4` | `#e18d3e` | Brown variant 4 |
| `--editor-color-green` | `#81b796` | Green text/background |
| `--editor-color-green-1` | `#458262` | Green variant 1 |
| `--editor-color-green-2` | `#258954` | Green variant 2 |
| `--editor-color-blue` | `#6ca0ff` | Blue text/background |
| `--editor-color-blue-1` | `#5995b8` | Blue variant 1 |
| `--editor-color-blue-2` | `#0085d2` | Blue variant 2 |
| `--editor-color-red` | `#ff6062` | Red text/background |
| `--editor-color-red-1` | `#ff524b` | Red variant 1 |
| `--editor-color-magenta-1` | `#9065b0` | Magenta variant 1 |
| `--editor-color-magenta-2` | `#a552e3` | Magenta variant 2 |
| `--editor-color-pink-1` | `#c2518c` | Pink variant 1 |
| `--editor-color-pink-2` | `#ff89c7` | Pink variant 2 |
| `--editor-color-orange-1` | `#d6534e` | Orange color |
| `--editor-color-yellow-1` | `#f0c23b` | Yellow color |
| `--editor-color-okhra` | `#c7a23d` | Okhra/gold color |

## Theme Examples

### Professional Dark Theme

```css
:root {
  /* Base colors */
  --editor-text-color: #e0e0e0;
  --editor-text-auxiliary: #a0a0a0;
  --editor-text-menu: #888888;
  --editor-bg: #1a1a1a;
  --editor-bg-white: #2a2a2a;
  --editor-bg-fields: #2a2a2a;
  --editor-bg-spoiler: #242424;
  --editor-bg-active-menu: #333333;
  --editor-border-color: #404040;
  --editor-border-grey: #4a4a4a;
  --editor-shadow: rgba(0, 0, 0, 0.5);
  --editor-overlay: rgba(0, 0, 0, 0.85);

  /* Accent colors */
  --editor-primary: #4a9eff;
  --editor-link: #4a9eff;
  --editor-selection: #2a4a6a;
  --editor-success: #10b981;
  --editor-error: #ef4444;
  --editor-warning: #f59e0b;

  /* Code blocks */
  --editor-code-bg: #2a2a2a;
}
```

### Minimal Light Theme

```css
:root {
  /* Base colors */
  --editor-text-color: #111111;
  --editor-text-auxiliary: #666666;
  --editor-bg: #ffffff;
  --editor-bg-white: #ffffff;
  --editor-bg-fields: #fafafa;
  --editor-border-color: #e0e0e0;

  /* Accent colors */
  --editor-primary: #0066cc;
  --editor-link: #0066cc;
  --editor-selection: #cce5ff;

  /* Typography */
  --editor-font-family: system-ui, -apple-system, sans-serif;

  /* Spacing */
  --editor-padding-horizontal: 40px;
  --editor-margin-paragraph: 16px;
}
```

### Compact Reading Mode

```css
:root {
  /* Reduce font sizes */
  --editor-font-size-base: 16px;
  --editor-font-size-h2: 20px;
  --editor-font-size-h3: 18px;

  /* Tighter spacing */
  --editor-padding-horizontal: 24px;
  --editor-margin-paragraph: 12px;
  --editor-margin-heading-top: 24px;
  --editor-margin-heading-bottom: 16px;

  /* Smaller components */
  --editor-toolbar-height: 48px;
  --editor-toolbar-btn-size: 36px;
}
```

### Vibrant Brand Theme

```css
:root {
  /* Brand colors */
  --editor-primary: #7c3aed;
  --editor-link: #7c3aed;
  --editor-success: #10b981;
  --editor-error: #ef4444;
  --editor-warning: #f59e0b;

  /* Typography */
  --editor-font-family: "Inter", system-ui, sans-serif;
  --editor-font-family-mono: "Fira Code", monospace;

  /* Adjusted colors for brand */
  --editor-color-blue: #7c3aed;
  --editor-color-blue-2: #6d28d9;
}
```

### Wide Layout Theme

```css
:root {
  /* Increased padding for wide screens */
  --editor-padding-horizontal: 120px;
  --editor-padding-horizontal-mobile: 40px;

  /* Larger typography */
  --editor-font-size-base: 20px;
  --editor-font-size-h2: 32px;
  --editor-font-size-h3: 24px;

  /* More generous spacing */
  --editor-margin-paragraph: 28px;
  --editor-margin-heading-top: 60px;
  --editor-margin-heading-bottom: 32px;
}
```

## Tips

1. **Start Small**: Override just a few variables at first (colors, font family)
2. **Test on Mobile**: Use mobile-specific variables for better responsive design
3. **Use Dev Tools**: Inspect elements to see which variables are being used
4. **Maintain Contrast**: Ensure text remains readable when changing colors
5. **Test Dark Mode**: If you use `prefers-color-scheme`, test both themes

## Advanced Customization

### Dynamic Themes with JavaScript

```tsx
function setTheme(theme: 'light' | 'dark') {
  const root = document.documentElement;

  if (theme === 'dark') {
    root.style.setProperty('--editor-text-color', '#e0e0e0');
    root.style.setProperty('--editor-bg', '#1a1a1a');
    // ... more variables
  } else {
    root.style.setProperty('--editor-text-color', '#292d32');
    root.style.setProperty('--editor-bg', '#f5f5f5');
    // ... more variables
  }
}
```

### Responsive Customization

```css
@media (max-width: 768px) {
  :root {
    --editor-font-size-base: 16px;
    --editor-padding-horizontal: 16px;
    --editor-toolbar-btn-size: 36px;
  }
}
```
