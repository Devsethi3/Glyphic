// src/components/editor/editor-page.tsx
import { EditorHeader } from "@/components/editor/editor-header";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { EditorCanvas } from "@/components/editor/editor-canvas";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { MobileEditorToolbar } from "@/components/editor/mobile-editor-toolbar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ExportDialog } from "@/components/editor/header/export-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PencilEdit02Icon,
  Image02Icon,
  GithubIcon,
} from "@hugeicons/core-free-icons";

export function EditorPage() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

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
          <div className="w-1/2 min-h-0 overflow-hidden">
            <EditorCanvas />
          </div>
        </div>
      </div>
    );
  }

  // Mobile Layout with Tabs
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Mobile Header */}
      <EditorHeader />

      {/* Settings Toolbar - Always visible */}
      <div className="shrink-0 border-b border-border bg-background">
        <EditorToolbar />
      </div>

      {/* Editor Toolbar - Always visible */}
      <div className="shrink-0 border-border bg-background">
        <MobileEditorToolbar />
      </div>

      {/* Tabs Component */}
      <Tabs defaultValue="editor" className="flex-1 flex flex-col min-h-0">
        {/* Tab Content Area */}
        <div className="flex-1 min-h-0 overflow-hidden border-t px-4 pt-4 pb-2">
          <TabsContent
            value="editor"
            className="h-full m-0 data-[state=inactive]:hidden"
          >
            <div className="h-full border-2 border-border rounded-lg bg-muted/5 overflow-hidden">
              <RichTextEditor isMobile />
            </div>
          </TabsContent>

          <TabsContent
            value="preview"
            className="h-full m-0 data-[state=inactive]:hidden"
          >
            <div className="h-full overflow-hidden">
              <EditorCanvas isMobile />
            </div>
          </TabsContent>
        </div>

        {/* Tabs List - Fixed at bottom */}
        <div className="shrink-0 bg-background mx-4 mb-2">
          <TabsList className="w-full h-9 grid grid-cols-2 rounded-none bg-transparent p-0">
            <TabsTrigger
              value="editor"
              className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none gap-2"
            >
              <HugeiconsIcon icon={PencilEdit02Icon} size={16} />
              <span>Editor</span>
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none gap-2"
            >
              <HugeiconsIcon icon={Image02Icon} size={16} />
              <span>Preview</span>
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      {/* Fixed Export Button */}
      <div className="shrink-0 p-4 border-t border-border bg-background flex items-center justify-between">
        <Button size="lg">
          <HugeiconsIcon icon={GithubIcon} size={14} />
          GitHub
        </Button>
        <ExportDialog />
      </div>
    </div>
  );
}
