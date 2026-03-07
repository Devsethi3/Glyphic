// src/pages/editor/index.tsx
import { EditorHeader } from "@/components/editor/editor-header";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { EditorCanvas } from "@/components/editor/editor-canvas";
import { RichTextEditor } from "@/components/editor/rich-text-editor";

export function EditorPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <EditorHeader />

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left Panel - 50% on desktop, full width on mobile */}
        <div className="w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-border min-h-0 max-h-[50vh] lg:max-h-none">
          {/* Toolbar - scrollable */}
          <div className="flex-shrink-0 overflow-y-auto max-h-[40%] lg:max-h-[45%]">
            <EditorToolbar />
          </div>

          {/* Rich Text Editor - takes remaining space */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <RichTextEditor />
          </div>
        </div>

        {/* Right Panel - 50% on desktop, full width on mobile */}
        <div className="w-full lg:w-1/2 flex-1 min-h-0 overflow-hidden">
          <EditorCanvas />
        </div>
      </div>
    </div>
  );
}
