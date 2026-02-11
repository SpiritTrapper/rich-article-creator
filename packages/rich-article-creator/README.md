# rich-article-creator

Customizable rich text article editor React component built on ProseMirror.

## Install

```bash
npm install rich-article-creator
```

### Peer dependencies

```bash
npm install react react-dom react-hook-form \
  prosemirror-commands prosemirror-dropcursor prosemirror-gapcursor \
  prosemirror-history prosemirror-inputrules prosemirror-keymap \
  prosemirror-model prosemirror-schema-list prosemirror-state \
  prosemirror-transform prosemirror-view
```

## Usage

```tsx
import { RichArticleEditor } from "rich-article-creator";
import "rich-article-creator/style.css";

function App() {
  return (
    <RichArticleEditor
      defaultTitle="My Article"
      onSave={async (data) => console.log(data.title, data.content)}
    />
  );
}
```

## Exports

| Export | Type | Description |
|--------|-----------|--------------------------------------|
| `RichArticleEditor` | Component | Main editor component |
| `CarouselItem` | Type | Shape of a carousel image item |
| `DropdownItem` | Type | Shape of a floating/marks menu item |

## Props

| Prop | Type | Description |
|------|------|-------------|
| `defaultTitle` | `string` | Initial title value |
| `defaultContent` | `object` | ProseMirror JSON document |
| `onSave` | `(data) => void \| Promise<void>` | Auto-save callback (debounced) |
| `onPublish` | `(data) => void` | Publish callback |
| `onBack` | `() => void` | Back navigation callback |
| `onUploadImage` | `(file: File) => Promise<string>` | Returns uploaded image URL |
| `onUploadVideo` | `(file: File) => Promise<string>` | Returns uploaded video URL |
| `onUploadAudio` | `(file: File) => Promise<string>` | Returns uploaded audio URL |

The `data` object in `onSave` and `onPublish` contains `{ title: string; content: Record<string, unknown> }` where `content` is the ProseMirror JSON document.

When upload handlers are not provided, media files are embedded as base64 data URLs.

## Customization

All visual aspects are customizable via CSS custom properties. Override any variable in your own CSS file imported after the editor styles.

### Quick Start

```tsx
import "rich-article-creator/style.css";
import "./my-theme.css";
```

```css
/* my-theme.css */
:root {
  --editor-primary: #0066cc;
  --editor-text-color: #1a1a1a;
  --editor-bg: #ffffff;
  --editor-link: #0066cc;
  --editor-font-family: "Inter", sans-serif;
  --editor-font-size-base: 16px;
  --editor-padding-horizontal: 40px;
}
```

### CSS Variables

#### Colors

| Variable | Default | Description |
|----------|---------|-------------|
| `--editor-text-color` | `#292d32` | Main text color |
| `--editor-text-auxiliary` | `#8f8f8f` | Placeholders, captions |
| `--editor-bg` | `#f5f5f5` | Page background |
| `--editor-bg-white` | `#fff` | Cards, modals background |
| `--editor-bg-fields` | `#f8f8f8` | Input fields, code blocks |
| `--editor-bg-active-menu` | `#ebebeb` | Active menu item |
| `--editor-border-color` | `#e6e6e6` | Borders and outlines |
| `--editor-shadow` | `rgba(0,0,0,0.2)` | Box shadows |
| `--editor-overlay` | `rgba(0,0,0,0.7)` | Dialog overlay |
| `--editor-primary` | `#ff6b2d` | Primary action color |
| `--editor-link` | `#6ca0ff` | Link color |
| `--editor-selection` | `#b4d7ff` | Text selection |
| `--editor-success` | `#81b796` | Success state |
| `--editor-error` | `#ff6062` | Error state |
| `--editor-warning` | `#f0c23b` | Warning state |

#### Typography

| Variable | Default | Description |
|----------|---------|-------------|
| `--editor-font-family` | `"Open Sans", system-ui, sans-serif` | Base font |
| `--editor-font-family-mono` | `"JetBrains Mono", monospace` | Code font |
| `--editor-font-size-base` | `18px` | Paragraph size |
| `--editor-font-size-h2` | `24px` | Heading 2 |
| `--editor-font-size-h3` | `20px` | Heading 3 |
| `--editor-font-line-height` | `1.5` | Line height |

#### Spacing

| Variable | Default | Description |
|----------|---------|-------------|
| `--editor-padding-horizontal` | `56px` | Content left/right padding |
| `--editor-padding-horizontal-mobile` | `20px` | Mobile padding |
| `--editor-margin-paragraph` | `20px` | Paragraph spacing |
| `--editor-margin-heading-top` | `40px` | Heading top margin |
| `--editor-margin-heading-bottom` | `24px` | Heading bottom margin |
| `--editor-spacing-xs` | `0.25rem` | 4px |
| `--editor-spacing-sm` | `0.5rem` | 8px |
| `--editor-spacing-md` | `0.75rem` | 12px |
| `--editor-spacing-base` | `1rem` | 16px |
| `--editor-spacing-lg` | `1.5rem` | 24px |
| `--editor-spacing-xl` | `2rem` | 32px |

#### Border Radius

| Variable | Default | Description |
|----------|---------|-------------|
| `--editor-radius-sm` | `6px` | Small |
| `--editor-radius-base` | `8px` | Base |
| `--editor-radius-md` | `12px` | Medium |
| `--editor-radius-lg` | `16px` | Large |
| `--editor-radius-xl` | `20px` | Extra large |

#### Toolbar

| Variable | Default | Description |
|----------|---------|-------------|
| `--editor-toolbar-height` | `52px` | Toolbar height |
| `--editor-toolbar-btn-size` | `40px` | Button size |
| `--editor-toolbar-btn-radius` | `8px` | Button radius |

#### Code Blocks

| Variable | Default | Description |
|----------|---------|-------------|
| `--editor-code-bg` | `#f8f8f8` | Background |
| `--editor-code-radius` | `0.5rem` | Border radius |
| `--editor-code-padding-y` | `0.75rem` | Vertical padding |
| `--editor-code-padding-x` | `1rem` | Horizontal padding |

#### Blockquote

| Variable | Default | Description |
|----------|---------|-------------|
| `--editor-blockquote-border` | `3px` | Left border width |
| `--editor-blockquote-padding` | `20px` | Left padding |

#### Carousel

| Variable | Default | Description |
|----------|---------|-------------|
| `--carousel-slide-height` | `320px` | Horizontal slide height |
| `--carousel-slide-spacing` | `16px` | Gap between slides |
| `--carousel-slide-size` | `85%` | Slide width |
| `--carousel-vertical-height` | `520px` | Vertical slide height |
| `--carousel-square-height` | `360px` | Square slide height |

For the full list of 80+ variables including text formatting colors, see [CUSTOMIZATION.md](./CUSTOMIZATION.md) or [globals.css](./src/globals.css).

### Theme Examples

#### Dark Theme

```css
:root {
  --editor-text-color: #e0e0e0;
  --editor-text-auxiliary: #a0a0a0;
  --editor-bg: #1a1a1a;
  --editor-bg-white: #2a2a2a;
  --editor-bg-fields: #2a2a2a;
  --editor-border-color: #404040;
  --editor-primary: #4a9eff;
  --editor-link: #4a9eff;
  --editor-selection: #2a4a6a;
  --editor-code-bg: #2a2a2a;
}
```

#### Compact Layout

```css
:root {
  --editor-font-size-base: 16px;
  --editor-font-size-h2: 20px;
  --editor-padding-horizontal: 24px;
  --editor-margin-paragraph: 12px;
  --editor-toolbar-height: 48px;
}
```

#### Custom Brand

```css
:root {
  --editor-primary: #7c3aed;
  --editor-link: #7c3aed;
  --editor-success: #10b981;
  --editor-error: #ef4444;
  --editor-font-family: "Inter", system-ui, sans-serif;
}
```

## License

MIT
