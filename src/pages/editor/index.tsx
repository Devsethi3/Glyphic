import { EditorHeader } from "@/components/editor/editor-header";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { EditorCanvas } from "@/components/editor/editor-canvas";
import { RichTextEditor } from "@/components/editor/rich-text-editor";

export function EditorPage() {
  return (
    <div className="h-screen max-w-6xl mx-auto flex flex-col overflow-hidden bg-background">
      <EditorHeader />

      <div className="flex-1 flex min-h-0">
        {/* Left Panel - 50% */}
        <div className="w-1/2 flex flex-col border-r border-border min-h-0">
          {/* Toolbar - scrollable with fixed max height */}
          <div className="flex-shrink-0 overflow-y-auto max-h-[45vh] border-b border-border">
            <EditorToolbar />
          </div>

          {/* Rich Text Editor - takes remaining space */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <RichTextEditor />
          </div>
        </div>

        {/* Right Panel - 50% Canvas Preview */}
        <div className="w-1/2 min-h-0 overflow-hidden">
          <EditorCanvas />
        </div>
      </div>
    </div>
  );
}
