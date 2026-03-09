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
import { useMediaQuery } from "@/hooks/use-media-query";

export function RichTextEditor({ isMobile = false }: { isMobile?: boolean }) {
  const setContent = useEditorStore((s) => s.setContent);
  const setHtmlContent = useEditorStore((s) => s.setHtmlContent);
  const setEditorRef = useEditorStore((s) => s.setEditorRef);
  const persistedHtml = useEditorStore((s) => s.htmlContent);
  const hasHydrated = useRef(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: isMobile
          ? "Start writing..."
          : "Every great design starts with a single word...",
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
        class: isMobile
          ? "prose prose-sm max-w-none focus:outline-none min-h-[150px] px-3 py-2"
          : "prose prose-invert max-w-none focus:outline-none min-h-[200px]",
      },
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
      transformPasted(slice) {
        return slice;
      },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getText());
      setHtmlContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && !hasHydrated.current && persistedHtml) {
      hasHydrated.current = true;

      const currentContent = editor.getHTML();
      const isEmpty = currentContent === "<p></p>" || currentContent === "";

      if (isEmpty && persistedHtml && persistedHtml !== "<p></p>") {
        setTimeout(() => {
          editor.commands.setContent(persistedHtml);
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
      {isDesktop && (
        <BubbleMenu editor={editor} options={{ placement: "top" }}>
          <BubbleMenuBar editor={editor} />
        </BubbleMenu>
      )}

      <div
        className={
          isMobile
            ? "flex-1 overflow-y-auto"
            : "flex-1 px-4 py-3 tiptap-editor overflow-y-auto"
        }
      >
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
