import { TextStyle } from "@tiptap/extension-text-style";

export const CustomTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontVariant: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          return element.style.fontVariant || null;
        },
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.fontVariant) return {};
          return { style: `font-variant: ${attributes.fontVariant}` };
        },
      },
      opacity: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          return element.style.opacity || null;
        },
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.opacity) return {};
          return { style: `opacity: ${attributes.opacity}` };
        },
      },
      fontSize: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          return element.style.fontSize || null;
        },
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.fontSize) return {};
          return { style: `font-size: ${attributes.fontSize}` };
        },
      },
    };
  },
});
