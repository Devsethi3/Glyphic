// src/components/editor/rich-text-editor.tsx
import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";

import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";

import { useEditorStore } from "@/store/editor-store";
import { BubbleMenuBar } from "./bubble-menu-bar";

export function RichTextEditor() {
  const setContent = useEditorStore((s) => s.setContent);
  const setHtmlContent = useEditorStore((s) => s.setHtmlContent);
  const setEditorRef = useEditorStore((s) => s.setEditorRef);

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
    ],
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[200px]",
      },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getText());
      setHtmlContent(editor.getHTML());
    },
  });

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
