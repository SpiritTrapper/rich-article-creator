import { Schema, NodeSpec, MarkSpec, DOMOutputSpec } from "prosemirror-model";

/* ---------- helpers ---------- */

const brDOM: DOMOutputSpec = ["br"];
const hrDOM: DOMOutputSpec = ["hr"];

/* ---------- node specs ---------- */

const doc: NodeSpec = { content: "block+" };

const text: NodeSpec = { group: "inline" };

const paragraph: NodeSpec = {
  content: "inline*",
  group: "block",
  attrs: {
    textAlign: { default: "left" },
    textIndent: { default: null },
  },
  parseDOM: [
    {
      tag: "p",
      getAttrs(dom) {
        const el = dom as HTMLElement;
        return {
          textAlign: el.style.textAlign || "left",
          textIndent: el.style.textIndent || null,
        };
      },
    },
  ],
  toDOM(node) {
    const style = [
      node.attrs.textAlign && node.attrs.textAlign !== "left"
        ? `text-align:${node.attrs.textAlign}`
        : "",
      node.attrs.textIndent ? `text-indent:${node.attrs.textIndent}` : "",
    ]
      .filter(Boolean)
      .join(";");
    return ["p", style ? { style } : {}, 0] as DOMOutputSpec;
  },
};

const heading: NodeSpec = {
  content: "inline*",
  group: "block",
  attrs: { level: { default: 2 } },
  defining: true,
  parseDOM: [
    { tag: "h2", getAttrs: () => ({ level: 2 }) },
    { tag: "h3", getAttrs: () => ({ level: 3 }) },
  ],
  toDOM(node) {
    return [`h${node.attrs.level}`, 0] as DOMOutputSpec;
  },
};

const blockquote: NodeSpec = {
  content: "block+",
  group: "block",
  defining: true,
  parseDOM: [{ tag: "blockquote" }],
  toDOM() {
    return ["blockquote", 0] as DOMOutputSpec;
  },
};

const codeBlock: NodeSpec = {
  content: "text*",
  group: "block",
  marks: "",
  code: true,
  defining: true,
  parseDOM: [{ tag: "pre", preserveWhitespace: "full" }],
  toDOM() {
    return ["pre", ["code", 0]] as DOMOutputSpec;
  },
};

const horizontalRule: NodeSpec = {
  group: "block",
  parseDOM: [{ tag: "hr" }],
  toDOM() {
    return hrDOM;
  },
};

const hardBreak: NodeSpec = {
  inline: true,
  group: "inline",
  selectable: false,
  parseDOM: [{ tag: "br" }],
  toDOM() {
    return brDOM;
  },
};

const bulletList: NodeSpec = {
  content: "listItem+",
  group: "block",
  parseDOM: [{ tag: "ul" }],
  toDOM() {
    return ["ul", 0] as DOMOutputSpec;
  },
};

const orderedList: NodeSpec = {
  content: "listItem+",
  group: "block",
  attrs: { order: { default: 1 } },
  parseDOM: [
    {
      tag: "ol",
      getAttrs(dom) {
        const el = dom as HTMLElement;
        return {
          order: el.hasAttribute("start") ? parseInt(el.getAttribute("start")!, 10) : 1,
        };
      },
    },
  ],
  toDOM(node) {
    return node.attrs.order === 1
      ? (["ol", 0] as DOMOutputSpec)
      : (["ol", { start: node.attrs.order }, 0] as DOMOutputSpec);
  },
};

const listItem: NodeSpec = {
  content: "paragraph block*",
  parseDOM: [{ tag: "li" }],
  toDOM() {
    return ["li", 0] as DOMOutputSpec;
  },
  defining: true,
};

const details: NodeSpec = {
  content: "detailsSummary detailsContent",
  group: "block",
  defining: true,
  isolating: true,
  parseDOM: [{ tag: "details" }],
  toDOM() {
    return ["details", { class: "hiddenTextDetails" }, 0] as DOMOutputSpec;
  },
};

const detailsSummary: NodeSpec = {
  content: "inline*",
  defining: true,
  parseDOM: [{ tag: "summary" }],
  toDOM() {
    return ["summary", 0] as DOMOutputSpec;
  },
};

const detailsContent: NodeSpec = {
  content: "block+",
  defining: true,
  parseDOM: [{ tag: "div[data-details-content]" }],
  toDOM() {
    return ["div", { "data-details-content": "" }, 0] as DOMOutputSpec;
  },
};

/* ---------- media nodes (atom) ---------- */

const mainImage: NodeSpec = {
  group: "block",
  inline: false,
  atom: true,
  selectable: true,
  draggable: false,
  defining: true,
  isolating: true,
  attrs: {
    src: { default: "" },
    alt: { default: "" },
    title: { default: "" },
  },
  parseDOM: [{ tag: 'img[data-main-image="true"]' }],
  toDOM(node) {
    return [
      "img",
      {
        src: node.attrs.src,
        alt: node.attrs.alt,
        title: node.attrs.title,
        "data-main-image": "true",
        style: "width:100%;aspect-ratio:16/9;object-fit:cover;display:block;border-radius:12px;",
      },
    ] as DOMOutputSpec;
  },
};

const customImage: NodeSpec = {
  group: "block",
  inline: false,
  atom: true,
  selectable: true,
  draggable: false,
  isolating: true,
  attrs: {
    src: { default: "" },
    alt: { default: "" },
    width: { default: 300 },
    height: { default: 200 },
    textAlign: { default: "left" },
    caption: { default: "" },
  },
  parseDOM: [
    {
      tag: "img:not([data-main-image])",
      getAttrs(dom) {
        const el = dom as HTMLElement;
        const parseSize = (val: string | null, fallback: number) => {
          if (!val) return fallback;
          const n = parseInt(val, 10);
          return Number.isFinite(n) ? n : fallback;
        };
        const m = el.style.margin;
        let textAlign: "left" | "center" | "right" = "left";
        if (m === "0 auto") textAlign = "center";
        else if (m.endsWith("auto")) textAlign = "right";
        return {
          src: el.getAttribute("src") || "",
          alt: el.getAttribute("alt") || "",
          width: parseSize(el.getAttribute("width") || el.style.width, 300),
          height: parseSize(el.getAttribute("height") || el.style.height, 200),
          textAlign,
          caption: "",
        };
      },
    },
  ],
  toDOM(node) {
    const margin =
      node.attrs.textAlign === "center"
        ? "0 auto"
        : node.attrs.textAlign === "right"
          ? "0 0 0 auto"
          : "0";
    return [
      "img",
      {
        src: node.attrs.src,
        alt: node.attrs.alt,
        width: node.attrs.width,
        height: node.attrs.height,
        style: `width:${node.attrs.width}px;height:${node.attrs.height}px;margin:${margin};`,
      },
    ] as DOMOutputSpec;
  },
};

const video: NodeSpec = {
  group: "block",
  inline: false,
  atom: true,
  selectable: true,
  draggable: true,
  isolating: true,
  attrs: {
    src: { default: "" },
    width: { default: 300 },
    height: { default: 150 },
    textAlign: { default: "left" },
    caption: { default: "" },
  },
  parseDOM: [
    {
      tag: "video",
      getAttrs(dom) {
        const el = dom as HTMLElement;
        const m = el.style.margin;
        let textAlign: "left" | "center" | "right" = "left";
        if (m === "0 auto") textAlign = "center";
        else if (m.endsWith("auto")) textAlign = "right";
        return {
          src: el.getAttribute("src") || "",
          width: parseInt(el.getAttribute("width") || el.style.width || "300", 10),
          height: parseInt(el.getAttribute("height") || el.style.height || "150", 10),
          textAlign,
          caption: "",
        };
      },
    },
  ],
  toDOM(node) {
    const margin =
      node.attrs.textAlign === "center"
        ? "0 auto"
        : node.attrs.textAlign === "right"
          ? "0 0 0 auto"
          : "0";
    return [
      "video",
      {
        src: node.attrs.src,
        width: node.attrs.width,
        height: node.attrs.height,
        style: `width:${node.attrs.width}px;height:${node.attrs.height}px;margin:${margin};`,
      },
    ] as DOMOutputSpec;
  },
};

const audioWaveform: NodeSpec = {
  group: "block",
  atom: true,
  draggable: true,
  attrs: {
    src: { default: "" },
    duration: { default: 0 },
    caption: { default: "" },
  },
  parseDOM: [{ tag: "div[data-audio-waveform]" }],
  toDOM() {
    return ["div", { "data-audio-waveform": "" }] as DOMOutputSpec;
  },
};

const imageCarousel: NodeSpec = {
  group: "block",
  atom: true,
  selectable: true,
  isolating: true,
  attrs: {
    items: { default: [] },
  },
  parseDOM: [{ tag: "div[data-carousel]" }],
  toDOM() {
    return ["div", { "data-carousel": "true" }] as DOMOutputSpec;
  },
};

/* ---------- mark specs ---------- */

const bold: MarkSpec = {
  parseDOM: [
    { tag: "strong" },
    { tag: "b", getAttrs: (dom) => (dom as HTMLElement).style.fontWeight !== "normal" && null },
    {
      style: "font-weight",
      getAttrs: (value) => /^(bold(er)?|[5-9]\d{2,})$/.test(value as string) && null,
    },
  ],
  toDOM() {
    return ["strong", 0] as DOMOutputSpec;
  },
};

const italic: MarkSpec = {
  parseDOM: [{ tag: "i" }, { tag: "em" }, { style: "font-style=italic" }],
  toDOM() {
    return ["em", 0] as DOMOutputSpec;
  },
};

const underline: MarkSpec = {
  parseDOM: [{ tag: "u" }, { style: "text-decoration=underline" }],
  toDOM() {
    return ["u", 0] as DOMOutputSpec;
  },
};

const strike: MarkSpec = {
  parseDOM: [
    { tag: "s" },
    { tag: "del" },
    { tag: "strike" },
    { style: "text-decoration=line-through" },
  ],
  toDOM() {
    return ["s", 0] as DOMOutputSpec;
  },
};

const code: MarkSpec = {
  parseDOM: [{ tag: "code" }],
  toDOM() {
    return ["code", 0] as DOMOutputSpec;
  },
};

const link: MarkSpec = {
  inclusive: false,
  attrs: {
    href: { default: "" },
    target: { default: "_blank" },
  },
  parseDOM: [
    {
      tag: "a[href]",
      getAttrs(dom) {
        const el = dom as HTMLElement;
        return {
          href: el.getAttribute("href") || "",
          target: el.getAttribute("target") || "_blank",
        };
      },
    },
  ],
  toDOM(mark) {
    return [
      "a",
      {
        href: mark.attrs.href,
        target: mark.attrs.target,
        rel: "noopener noreferrer nofollow",
      },
      0,
    ] as DOMOutputSpec;
  },
};

const textStyle: MarkSpec = {
  attrs: { color: { default: null } },
  parseDOM: [
    {
      style: "color",
      getAttrs: (value) => (value ? { color: value } : false),
    },
  ],
  toDOM(mark) {
    return mark.attrs.color
      ? (["span", { style: `color:${mark.attrs.color}` }, 0] as DOMOutputSpec)
      : (["span", 0] as DOMOutputSpec);
  },
};

const highlight: MarkSpec = {
  attrs: { color: { default: null } },
  parseDOM: [
    {
      tag: "mark",
      getAttrs: (dom) => ({ color: (dom as HTMLElement).style.backgroundColor || null }),
    },
    {
      style: "background-color",
      getAttrs: (value) => (value ? { color: value } : false),
    },
  ],
  toDOM(mark) {
    return mark.attrs.color
      ? (["mark", { style: `background-color:${mark.attrs.color}` }, 0] as DOMOutputSpec)
      : (["mark", 0] as DOMOutputSpec);
  },
};

/* ---------- schema ---------- */

export const editorSchema = new Schema({
  nodes: {
    doc,
    text,
    paragraph,
    heading,
    blockquote,
    codeBlock,
    horizontalRule,
    hardBreak,
    bulletList,
    orderedList,
    listItem,
    details,
    detailsSummary,
    detailsContent,
    mainImage,
    customImage,
    video,
    audioWaveform,
    imageCarousel,
  },
  marks: {
    bold,
    italic,
    underline,
    strike,
    code,
    link,
    textStyle,
    highlight,
  },
});
