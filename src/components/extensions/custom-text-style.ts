import { TextStyle } from "@tiptap/extension-text-style";

export const CustomTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontVariant: {
        default: null,
        parseHTML: (element) => element.style.fontVariant || null,
        renderHTML: (attributes) => {
          if (!attributes.fontVariant) return {};
          return {
            style: `font-variant: ${attributes.fontVariant}`,
          };
        },
      },
      opacity: {
        default: null,
        parseHTML: (element) => element.style.opacity || null,
        renderHTML: (attributes) => {
          if (!attributes.opacity) return {};
          return {
            style: `opacity: ${attributes.opacity}`,
          };
        },
      },
    };
  },
});
