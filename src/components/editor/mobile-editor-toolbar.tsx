import { useEditorStore } from "@/store/editor-store";
import type { Editor } from "@tiptap/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  TextStrikethroughIcon,
  Heading01Icon,
  Heading02Icon,
  Heading03Icon,
  QuoteDownIcon,
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  CleanIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  PaintBrushIcon,
  DropletIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState } from "react";

const TEXT_COLORS = [
  { label: "Default", value: "" },
  { label: "White", value: "#ffffff" },
  { label: "Black", value: "#000000" },
  { label: "Gray", value: "#9ca3af" },
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Green", value: "#22c55e" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Purple", value: "#a855f7" },
  { label: "Pink", value: "#ec4899" },
];

const HIGHLIGHT_COLORS = [
  { label: "None", value: "" },
  { label: "Yellow", value: "#fef08a" },
  { label: "Green", value: "#bbf7d0" },
  { label: "Blue", value: "#bfdbfe" },
  { label: "Purple", value: "#e9d5ff" },
  { label: "Pink", value: "#fbcfe8" },
  { label: "Red", value: "#fecaca" },
];

const FONT_SIZES = [
  { label: "12px", value: "12px" },
  { label: "14px", value: "14px" },
  { label: "16px", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "20px", value: "20px" },
  { label: "24px", value: "24px" },
  { label: "28px", value: "28px" },
  { label: "32px", value: "32px" },
  { label: "Default", value: "" },
];

function ToolbarButton({
  icon,
  isActive,
  onClick,
  children,
}: {
  icon?: typeof TextBoldIcon;
  isActive?: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      className={cn(
        "h-8 w-8 shrink-0",
        isActive && "bg-accent text-accent-foreground",
      )}
      onMouseDown={(e) => e.preventDefault()}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      {icon ? <HugeiconsIcon icon={icon} size={16} /> : children}
    </Button>
  );
}

function ColorGrid({
  colors,
  activeColor,
  onSelect,
}: {
  colors: { label: string; value: string }[];
  activeColor: string;
  onSelect: (color: string) => void;
}) {
  return (
    <div className="grid grid-cols-6 gap-2 p-3">
      {colors.map((color) => (
        <button
          key={color.label}
          type="button"
          className={cn(
            "w-8 h-8 rounded-md border-2 transition-all",
            activeColor === color.value
              ? "border-primary scale-110"
              : "border-transparent",
            !color.value && "relative bg-muted",
          )}
          style={{
            backgroundColor: color.value || "transparent",
          }}
          onClick={() => onSelect(color.value)}
        >
          {!color.value && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-[2px] bg-destructive rotate-45" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

export function MobileEditorToolbar() {
  const editorRef = useEditorStore((s) => s.editorRef);
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [highlightOpen, setHighlightOpen] = useState(false);
  const [fontSizeOpen, setFontSizeOpen] = useState(false);

  if (!editorRef) return null;

  const editor = editorRef as Editor;

  const currentTextColor = editor.getAttributes("textStyle")?.color || "";
  const currentHighlight = editor.getAttributes("highlight")?.color || "";
  const currentFontSize = editor.getAttributes("textStyle")?.fontSize || "";

  return (
    <ScrollArea className="w-full">
      <div className="flex items-center gap-1 px-3 py-2 w-max">
        {/* Font Size */}
        <Popover open={fontSizeOpen} onOpenChange={setFontSizeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-2 text-xs font-mono shrink-0",
                currentFontSize && "bg-accent",
              )}
            >
              {currentFontSize ? currentFontSize.replace("px", "") : "Size"}
            </Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" className="w-auto p-1 ml-2" sideOffset={4}>
            <div className="flex flex-col gap-0.5">
              {FONT_SIZES.map((size) => (
                <button
                  key={size.label}
                  type="button"
                  className={cn(
                    "px-3 py-2 text-sm text-left rounded hover:bg-accent transition-colors",
                    (size.value === currentFontSize ||
                      (size.value === "" && !currentFontSize)) &&
                      "bg-accent font-medium",
                  )}
                  onClick={() => {
                    if (!size.value) {
                      editor
                        .chain()
                        .focus()
                        .setMark("textStyle", { fontSize: null })
                        .run();
                    } else {
                      editor
                        .chain()
                        .focus()
                        .setMark("textStyle", { fontSize: size.value })
                        .run();
                    }
                    setFontSizeOpen(false);
                  }}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-6 bg-border mx-1 shrink-0" />

        {/* Basic Formatting */}
        <ToolbarButton
          icon={TextBoldIcon}
          isActive={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          icon={TextItalicIcon}
          isActive={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          icon={TextUnderlineIcon}
          isActive={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          icon={TextStrikethroughIcon}
          isActive={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />

        <div className="w-px h-6 bg-border mx-1 shrink-0" />

        {/* Sub/Superscript */}
        <ToolbarButton
          icon={ArrowDown01Icon}
          isActive={editor.isActive("subscript")}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
        />
        <ToolbarButton
          icon={ArrowUp01Icon}
          isActive={editor.isActive("superscript")}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
        />

        <div className="w-px h-6 bg-border mx-1 shrink-0" />

        {/* Headings */}
        <ToolbarButton
          icon={Heading01Icon}
          isActive={editor.isActive("heading", { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        />
        <ToolbarButton
          icon={Heading02Icon}
          isActive={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        />
        <ToolbarButton
          icon={Heading03Icon}
          isActive={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        />

        <div className="w-px h-6 bg-border mx-1 shrink-0" />

        {/* Quote */}
        <ToolbarButton
          icon={QuoteDownIcon}
          isActive={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />

        <div className="w-px h-6 bg-border mx-1 shrink-0" />

        {/* Alignment */}
        <ToolbarButton
          icon={TextAlignLeftIcon}
          isActive={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        />
        <ToolbarButton
          icon={TextAlignCenterIcon}
          isActive={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        />
        <ToolbarButton
          icon={TextAlignRightIcon}
          isActive={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        />

        <div className="w-px h-6 bg-border mx-1 shrink-0" />

        {/* Text Color */}
        <Popover open={textColorOpen} onOpenChange={setTextColorOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 relative shrink-0"
            >
              <HugeiconsIcon icon={PaintBrushIcon} size={16} />
              <div
                className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full"
                style={{
                  backgroundColor: currentTextColor || "currentColor",
                }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" className="w-auto p-0" sideOffset={4}>
            <ColorGrid
              colors={TEXT_COLORS}
              activeColor={currentTextColor}
              onSelect={(color) => {
                if (!color) {
                  editor.chain().focus().unsetColor().run();
                } else {
                  editor.chain().focus().setColor(color).run();
                }
                setTextColorOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>

        {/* Highlight */}
        <Popover open={highlightOpen} onOpenChange={setHighlightOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 relative shrink-0"
            >
              <HugeiconsIcon icon={DropletIcon} size={16} />
              <div
                className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full"
                style={{
                  backgroundColor: currentHighlight || "transparent",
                  border: currentHighlight
                    ? "none"
                    : "1px solid hsl(var(--border))",
                }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" className="w-auto p-0" sideOffset={4}>
            <ColorGrid
              colors={HIGHLIGHT_COLORS}
              activeColor={currentHighlight}
              onSelect={(color) => {
                if (!color) {
                  editor.chain().focus().unsetHighlight().run();
                } else {
                  editor.chain().focus().setHighlight({ color }).run();
                }
                setHighlightOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>

        <div className="w-px h-6 bg-border mx-1 shrink-0" />

        {/* Clear Formatting */}
        <ToolbarButton
          icon={CleanIcon}
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
        />
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
