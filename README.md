# rich-article-creator

Rich text article editor React component built on ProseMirror. Publishable as an npm package.

## Features

- Block types: paragraphs, headings (h2/h3), bullet & ordered lists (with Russian alphabetic counter), blockquotes, code blocks, collapsible details/summary
- Inline formatting: bold, italic, underline, strikethrough, text color, highlight, links, code
- Text indent and list indent/outdent
- Media blocks: images (resizable, with alignment), videos, audio waveforms (wavesurfer.js), image carousels (embla-carousel)
- Hero/cover image with deletion protection
- Drag-and-drop carousel image reordering (@dnd-kit)
- Floating "+" menu for inserting media blocks
- Mobile-responsive toolbar with scroll-based expand/pin
- Debounced auto-save via react-hook-form
- Core Web Vitals monitoring in dev mode (web-vitals)

## Performance

Heavy dependencies are lazy-loaded to reduce initial bundle size:

- **wavesurfer.js** (~51KB) -- loaded on demand when an audio waveform node renders
- **embla-carousel** (~35KB) -- loaded on demand when a carousel node renders
- **CarouselModal + @dnd-kit** (~81KB) -- loaded on demand when the carousel editing modal opens

## Install

```bash
npm install rich-article-creator
```

### Peer dependencies

```bash
npm install react react-dom react-hook-form prosemirror-commands prosemirror-dropcursor prosemirror-gapcursor prosemirror-history prosemirror-inputrules prosemirror-keymap prosemirror-model prosemirror-schema-list prosemirror-state prosemirror-transform prosemirror-view
```

## Usage

```tsx
import { RichArticleEditor } from "rich-article-creator";
import "rich-article-creator/style.css";

function App() {
  return <RichArticleEditor />;
}
```

### Exports

| Export              | Type      | Description                         |
| ------------------- | --------- | ----------------------------------- |
| `RichArticleEditor` | Component | Main editor component               |
| `CarouselItem`      | Type      | Shape of a carousel image item      |
| `DropdownItem`      | Type      | Shape of a floating/marks menu item |

## Development

```bash
npm run dev        # Start Vite dev server with HMR
npm run build      # TypeScript check + Vite production build + declaration emit
npm run lint       # ESLint check
npm run preview    # Preview production build locally
```

### Build output

```
dist/
  index.js          # ESM library entry
  style.css         # All styles (Tailwind + editor CSS)
  *.js              # Lazy-loaded chunks (wavesurfer, carousel, dnd-kit)
  *.d.ts            # TypeScript declarations
```

## Tech stack

- **React 19** with React Compiler (babel-plugin-react-compiler)
- **ProseMirror** -- schema, commands, keymap, plugins, React node views
- **Tailwind CSS v4** via @tailwindcss/vite
- **Vite** library mode (ESM)
- **lucide-react** for icons
- **web-vitals** for Core Web Vitals measurement (dev only)
