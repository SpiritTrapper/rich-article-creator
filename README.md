# Rich Article Creator

Customizable rich text article editor React component built on ProseMirror.

## Project Structure

npm workspaces monorepo:

- **`packages/rich-article-creator/`** — Publishable npm package
- **Root** — Demo application

## Features

- **Block types**: Paragraphs, headings (h2/h3), bullet & ordered lists, blockquotes, code blocks, collapsible details/summary
- **Inline formatting**: Bold, italic, underline, strikethrough, text color, highlight, links, inline code
- **Indentation**: Text indent and list indent/outdent
- **Media**: Resizable images, videos, audio waveforms (wavesurfer.js), image carousels (embla-carousel)
- **Hero image**: Cover image with deletion protection
- **Drag-and-drop**: Carousel image reordering (@dnd-kit)
- **Floating "+" menu**: Quick media block insertion
- **Mobile-responsive toolbar**: Scroll-based expand/pin
- **Auto-save**: Debounced saving via react-hook-form
- **80+ CSS variables**: Full visual customization without touching components

## Install

```bash
npm install rich-article-creator
```

Peer dependencies:

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
      onPublish={(data) => console.log("Publish:", data)}
    />
  );
}
```

### With Custom Theme

```tsx
import "rich-article-creator/style.css";
import "./my-theme.css";
```

```css
/* my-theme.css */
:root {
  --editor-primary: #7c3aed;
  --editor-link: #7c3aed;
  --editor-font-family: "Inter", sans-serif;
}
```

See the [package README](./packages/rich-article-creator/README.md) for full props reference and [CUSTOMIZATION.md](./packages/rich-article-creator/CUSTOMIZATION.md) for the complete theming guide.

## Development

```bash
npm install              # Install all workspaces
npm run dev              # Start demo app dev server
npm run build            # Build package
npm run lint             # ESLint
```

### Structure

```
rich-article-creator/
├── packages/rich-article-creator/   # npm package
│   ├── src/
│   │   ├── components/              # UI components
│   │   ├── extensions/              # ProseMirror node views
│   │   ├── hooks/                   # React hooks
│   │   ├── pm/                      # ProseMirror core
│   │   ├── shared/                  # Types and helpers
│   │   ├── globals.css              # CSS variables + styles
│   │   └── index.tsx                # Entry point
│   ├── CUSTOMIZATION.md
│   └── README.md
├── src/App.tsx                      # Demo app
└── package.json                     # Workspace root
```

## Tech Stack

- **React 19** with React Compiler
- **ProseMirror** — Schema, commands, keymap, plugins, React node views
- **Tailwind CSS v4** — Utility classes + CSS custom properties
- **Vite 7** — Library build (ESM)
- **TypeScript 5.9**

## License

MIT
