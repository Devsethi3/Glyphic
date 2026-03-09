// src/components/editor/editor-page.tsx
import { useState } from "react";
import { EditorHeader } from "@/components/editor/editor-header";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { EditorCanvas } from "@/components/editor/editor-canvas";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { MobileEditorToolbar } from "@/components/editor/mobile-editor-toolbar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { ExportDialog } from "@/components/editor/header/export-dialog";

export function EditorPage() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");

  // Desktop Layout
  if (isDesktop) {
    return (
      <div className="h-screen max-w-6xl mx-auto flex flex-col overflow-hidden bg-background">
        <EditorHeader />

        <div className="flex-1 flex min-h-0">
          {/* Left Panel - 50% */}
          <div className="w-1/2 flex flex-col min-h-0 border-r border-border">
            {/* Toolbar - scrollable */}
            <div className="shrink-0 overflow-y-auto max-h-[45vh] border-b border-border">
              <EditorToolbar />
            </div>

            {/* Rich Text Editor */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <RichTextEditor />
            </div>
          </div>

          {/* Right Panel - 50% Canvas Preview */}
          <div className="w-1/2 min-h-0 overflow-hidden bg-muted/20">
            <EditorCanvas />
          </div>
        </div>
      </div>
    );
  }

  // Mobile Layout
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Mobile Header */}
      <EditorHeader />

      {/* Settings Toolbar - Always visible */}
      <div className="shrink-0 border-b border-border bg-background">
        <EditorToolbar />
      </div>

      {/* Editor Toolbar - Always visible */}
      <div className="shrink-0 border-b border-border bg-background">
        <MobileEditorToolbar />
      </div>

      {/* Content Area - Editor and Preview share same space */}
      <div className="flex-1 min-h-0 overflow-hidden px-4 pt-4 pb-2">
        {/* Editor - visible when tab is "editor" */}
        {mobileTab === "editor" && (
          <div className="h-full border-2 border-border rounded-lg bg-muted/5 overflow-hidden">
            <RichTextEditor isMobile />
          </div>
        )}

        {/* Preview - visible when tab is "preview" */}
        {mobileTab === "preview" && (
          <div className="h-full border-2 border-border rounded-lg bg-muted/20 overflow-hidden">
            <EditorCanvas />
          </div>
        )}
      </div>

      {/* Tab Switcher - Fixed position, always below content */}
      <div className="shrink-0 border-t border-border bg-background">
        <div className="flex h-12">
          <button
            onClick={() => setMobileTab("editor")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 text-sm font-medium transition-colors border-b-2",
              mobileTab === "editor"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground",
            )}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Editor
          </button>
          <button
            onClick={() => setMobileTab("preview")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 text-sm font-medium transition-colors border-b-2",
              mobileTab === "preview"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground",
            )}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Preview
          </button>
        </div>
      </div>

      {/* Fixed Export Button */}
      <div className="shrink-0 p-4 border-t border-border bg-background">
        <ExportDialog />
      </div>
    </div>
  );
}
