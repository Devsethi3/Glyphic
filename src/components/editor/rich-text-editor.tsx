// src/components/editor/rich-text-editor.tsx
import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";

import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";

import { useEditorStore } from "@/store/editor-store";
import { BubbleMenuBar } from "./bubble-menu-bar";
import { CustomTextStyle } from "@/extensions/custom-text-style";
import { Plugin, PluginKey } from "@tiptap/pm/state";

// Strip all font-related styles from pasted HTML
function createPasteNormalizerPlugin(): Plugin {
  return new Plugin({
    key: new PluginKey("pasteNormalizer"),
    props: {
      handlePaste(view, event) {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        const html = clipboardData.getData("text/html");
        const plainText = clipboardData.getData("text/plain");

        if (html) {
          // Parse and strip font-family, font-size from pasted HTML
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          // Remove font-family and font-size from all elements
          const allElements = doc.querySelectorAll("*");
          allElements.forEach((el) => {
            const element = el as HTMLElement;
            if (element.style) {
              element.style.fontFamily = "";
              element.style.fontSize = "";
              element.style.letterSpacing = "";
              element.style.lineHeight = "";

              // Remove class-based font overrides
              element.removeAttribute("face");

              // Clean up empty style attributes
              if (element.getAttribute("style")?.trim() === "") {
                element.removeAttribute("style");
              }
            }
          });

          // Remove <font> tags but keep content
          const fontTags = doc.querySelectorAll("font");
          fontTags.forEach((font) => {
            const parent = font.parentNode;
            if (parent) {
              while (font.firstChild) {
                parent.insertBefore(font.firstChild, font);
              }
              parent.removeChild(font);
            }
          });

          const cleanedHtml = doc.body.innerHTML;

          // Insert the cleaned HTML
          const { state, dispatch } = view;
          const { tr, schema } = state;

          // Create a temporary div to parse the cleaned HTML
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = cleanedHtml;

          // Use ProseMirror's DOM parser
          // const pmParser =
          //   // @ts-expect-error - accessing internal parser
          //   view.someProp("clipboardParser") ||
          //   // @ts-expect-error - DOMParser from prosemirror
          //   __webpack_require__ ||
          //   null;

          // Fallback: insert as plain text if parsing fails
          if (!cleanedHtml.trim()) {
            if (plainText) {
              const textNode = schema.text(plainText);
              dispatch(tr.replaceSelectionWith(textNode));
              return true;
            }
            return false;
          }

          // Let TipTap handle the cleaned HTML by re-dispatching
          // We modify the clipboard data in-place
          return false;
        }

        return false;
      },

      // Transform pasted content to strip font styles
      transformPastedHTML(html: string): string {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const allElements = doc.querySelectorAll("*");
        allElements.forEach((el) => {
          const element = el as HTMLElement;
          if (element.style) {
            element.style.fontFamily = "";
            element.style.fontSize = "";
            element.style.letterSpacing = "";
            element.style.lineHeight = "";
            element.style.wordSpacing = "";

            // Clean empty style
            const style = element.getAttribute("style");
            if (style && style.replace(/;/g, "").trim() === "") {
              element.removeAttribute("style");
            }
          }

          // Remove font tags attributes
          if (element.tagName === "FONT") {
            element.removeAttribute("face");
            element.removeAttribute("size");
          }
        });

        // Remove <font> tags but keep their content
        let result = doc.body.innerHTML;

        // Also strip via regex as a safety net
        result = result.replace(/font-family\s*:\s*[^;"']+[;"']?/gi, "");
        result = result.replace(/font-size\s*:\s*[^;"']+[;"']?/gi, "");

        return result;
      },
    },
  });
}

export function RichTextEditor() {
  const setContent = useEditorStore((s) => s.setContent);
  const setHtmlContent = useEditorStore((s) => s.setHtmlContent);
  const setEditorRef = useEditorStore((s) => s.setEditorRef);
  const persistedHtml = useEditorStore((s) => s.htmlContent);
  const hasHydrated = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing something beautiful...",
      }),
      Typography,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Subscript,
      Superscript,
      CustomTextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[200px]",
      },
      // Strip font styles on paste via transformPastedHTML
      transformPastedHTML(html: string): string {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const allElements = doc.querySelectorAll("*");
        allElements.forEach((el) => {
          const element = el as HTMLElement;
          if (element.style) {
            element.style.fontFamily = "";
            element.style.fontSize = "";
            element.style.letterSpacing = "";
            element.style.lineHeight = "";
            element.style.wordSpacing = "";

            const style = element.getAttribute("style");
            if (style && style.replace(/[;\s]/g, "") === "") {
              element.removeAttribute("style");
            }
          }

          element.removeAttribute("face");

          if (element.tagName === "FONT") {
            element.removeAttribute("face");
            element.removeAttribute("size");
          }
        });

        let result = doc.body.innerHTML;
        result = result.replace(/font-family\s*:\s*[^;"']+[;"']?/gi, "");
        result = result.replace(/font-size\s*:\s*[^;"']+[;"']?/gi, "");
        return result;
      },
      // Also handle plain text paste to strip formatting
      transformPasted(slice) {
        return slice;
      },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getText());
      setHtmlContent(editor.getHTML());
    },
  });

  // Hydrate editor with persisted content on mount
  useEffect(() => {
    if (editor && !hasHydrated.current && persistedHtml) {
      // Only hydrate once
      hasHydrated.current = true;

      // Check if editor is empty before hydrating
      const currentContent = editor.getHTML();
      const isEmpty = currentContent === "<p></p>" || currentContent === "";

      if (isEmpty && persistedHtml && persistedHtml !== "<p></p>") {
        // Use setTimeout to ensure editor is fully ready
        setTimeout(() => {
          editor.commands.setContent(persistedHtml);
          // Sync plain text after hydration
          setContent(editor.getText());
        }, 0);
      }
    }
  }, [editor, persistedHtml, setContent]);

  useEffect(() => {
    setEditorRef(editor);
    return () => setEditorRef(null);
  }, [editor, setEditorRef]);

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <BubbleMenu
        editor={editor}
        options={{
          placement: "top",
        }}
      >
        <BubbleMenuBar editor={editor} />
      </BubbleMenu>

      <div className="flex-1 px-4 py-3 tiptap-editor overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
