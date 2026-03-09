// src/components/editor/bubble-menu-bar.tsx
import { useState, useCallback } from "react";
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
  TextIcon,
  CleanIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  PaintBrushIcon,
  DropletIcon,
  TextFontIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface BubbleMenuBarProps {
  editor: Editor;
}

const TEXT_COLORS = [
  { label: "Default", value: "" },
  { label: "White", value: "#ffffff" },
  { label: "Black", value: "#000000" },
  { label: "Gray", value: "#9ca3af" },
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Green", value: "#22c55e" },
  { label: "Emerald", value: "#10b981" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Indigo", value: "#6366f1" },
  { label: "Purple", value: "#a855f7" },
  { label: "Pink", value: "#ec4899" },
  { label: "Rose", value: "#f43f5e" },
];

const HIGHLIGHT_COLORS = [
  { label: "None", value: "" },
  { label: "Yellow", value: "#fef08a" },
  { label: "Green", value: "#bbf7d0" },
  { label: "Blue", value: "#bfdbfe" },
  { label: "Purple", value: "#e9d5ff" },
  { label: "Pink", value: "#fbcfe8" },
  { label: "Red", value: "#fecaca" },
  { label: "Orange", value: "#fed7aa" },
  { label: "Gray", value: "#e5e7eb" },
  { label: "Cyan", value: "#a5f3fc" },
  { label: "Lime", value: "#d9f99d" },
  { label: "Amber", value: "#fde68a" },
];

const OPACITY_LEVELS = [
  { label: "100%", value: "1" },
  { label: "90%", value: "0.9" },
  { label: "80%", value: "0.8" },
  { label: "70%", value: "0.7" },
  { label: "60%", value: "0.6" },
  { label: "50%", value: "0.5" },
  { label: "40%", value: "0.4" },
  { label: "30%", value: "0.3" },
  { label: "Reset", value: "" },
];

const FONT_SIZES = [
  { label: "Small", value: "12px", preview: 10 },
  { label: "Default", value: "", preview: 12 },
  { label: "14px", value: "14px", preview: 12 },
  { label: "16px", value: "16px", preview: 13 },
  { label: "18px", value: "18px", preview: 14 },
  { label: "20px", value: "20px", preview: 14 },
  { label: "24px", value: "24px", preview: 15 },
  { label: "28px", value: "28px", preview: 16 },
  { label: "32px", value: "32px", preview: 17 },
  { label: "36px", value: "36px", preview: 17 },
  { label: "48px", value: "48px", preview: 18 },
  { label: "64px", value: "64px", preview: 19 },
  { label: "72px", value: "72px", preview: 20 },
];

function Sep() {
  return <div className="w-px h-4 bg-border mx-0.5 shrink-0" />;
}

function MenuButton({
  icon,
  title,
  shortcut,
  isActive,
  onClick,
  className,
  children,
}: {
  icon?: typeof TextBoldIcon;
  title: string;
  shortcut?: string;
  isActive?: boolean;
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className={cn(
            "h-7 w-7 p-0 shrink-0",
            isActive && "bg-accent text-accent-foreground",
            className,
          )}
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            onClick();
          }}
        >
          {icon ? <HugeiconsIcon icon={icon} size={14} /> : children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-[10px] px-2 py-1">
        <p>
          {title}
          {shortcut && (
            <span className="ml-1.5 text-muted-foreground">{shortcut}</span>
          )}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

function ColorPickerGrid({
  colors,
  activeColor,
  onSelect,
  label,
}: {
  colors: { label: string; value: string }[];
  activeColor: string;
  onSelect: (color: string) => void;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-2 p-2">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-0.5">
        {label}
      </span>
      <div className="grid grid-cols-7 gap-1">
        {colors.map((color) => (
          <Tooltip key={color.label}>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  "w-6 h-6 rounded-md border transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                  activeColor === color.value &&
                    "ring-2 ring-ring ring-offset-1 ring-offset-background",
                  !color.value && "relative",
                )}
                style={{
                  backgroundColor: color.value || "transparent",
                  borderColor: color.value
                    ? "transparent"
                    : "hsl(var(--border))",
                }}
                onClick={() => onSelect(color.value)}
              >
                {!color.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-[1.5px] bg-destructive rotate-45 rounded-full" />
                  </div>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[10px] px-2 py-1">
              {color.label}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}

export function BubbleMenuBar({ editor }: BubbleMenuBarProps) {
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [highlightOpen, setHighlightOpen] = useState(false);
  const [opacityOpen, setOpacityOpen] = useState(false);
  const [fontSizeOpen, setFontSizeOpen] = useState(false);

  const handleSetParagraph = useCallback(() => {
    editor.chain().focus().setParagraph().run();
  }, [editor]);

  const handleClearFormatting = useCallback(() => {
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  }, [editor]);

  const handleToggleSmallCaps = useCallback(() => {
    const currentAttrs = editor.getAttributes("textStyle");
    const hasSmallCaps = currentAttrs?.fontVariant === "small-caps";
    editor
      .chain()
      .focus()
      .setMark("textStyle", { fontVariant: hasSmallCaps ? null : "small-caps" })
      .run();
  }, [editor]);

  const handleSetOpacity = useCallback(
    (opacity: string) => {
      if (!opacity || opacity === "1") {
        editor.chain().focus().setMark("textStyle", { opacity: null }).run();
      } else {
        editor.chain().focus().setMark("textStyle", { opacity }).run();
      }
      setOpacityOpen(false);
    },
    [editor],
  );

  const handleSetFontSize = useCallback(
    (size: string) => {
      if (!size) {
        // Reset to default
        editor.chain().focus().setMark("textStyle", { fontSize: null }).run();
      } else {
        editor.chain().focus().setMark("textStyle", { fontSize: size }).run();
      }
      setFontSizeOpen(false);
    },
    [editor],
  );

  const handleSetTextColor = useCallback(
    (color: string) => {
      if (!color) {
        editor.chain().focus().unsetColor().run();
      } else {
        editor.chain().focus().setColor(color).run();
      }
      setTextColorOpen(false);
    },
    [editor],
  );

  const handleSetHighlight = useCallback(
    (color: string) => {
      if (!color) {
        editor.chain().focus().unsetHighlight().run();
      } else {
        editor.chain().focus().setHighlight({ color }).run();
      }
      setHighlightOpen(false);
    },
    [editor],
  );

  const currentTextColor = editor.getAttributes("textStyle")?.color || "";
  const currentHighlight = editor.getAttributes("highlight")?.color || "";
  const currentOpacity = editor.getAttributes("textStyle")?.opacity || "";
  const currentFontSize = editor.getAttributes("textStyle")?.fontSize || "";

  // Display label for font size button
  const fontSizeLabel = currentFontSize
    ? currentFontSize.replace("px", "")
    : "—";

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-0.5 bg-popover border border-border rounded-xl shadow-xl p-1 max-w-fit">
        {/* Paragraph */}
        <MenuButton
          icon={TextIcon}
          title="Paragraph"
          isActive={editor.isActive("paragraph") && !editor.isActive("heading")}
          onClick={handleSetParagraph}
        />

        <Sep />

        {/* Font Size */}
        <Popover open={fontSizeOpen} onOpenChange={setFontSizeOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  className={cn(
                    "h-7 px-1.5 shrink-0 text-[10px] font-mono font-medium min-w-[32px]",
                    currentFontSize && "bg-accent text-accent-foreground",
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {fontSizeLabel}
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[10px] px-2 py-1">
              Font Size
            </TooltipContent>
          </Tooltip>
          <PopoverContent
            side="bottom"
            align="start"
            className="w-auto p-1.5"
            sideOffset={8}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-1">
                Font Size
              </span>
              {FONT_SIZES.map((size) => (
                <button
                  key={size.label}
                  type="button"
                  className={cn(
                    "flex items-center justify-between gap-4 px-2 py-1.5 rounded-md text-xs hover:bg-accent transition-colors text-left min-w-[120px]",
                    (size.value === currentFontSize ||
                      (size.value === "" && !currentFontSize)) &&
                      "bg-accent font-medium",
                  )}
                  onClick={() => handleSetFontSize(size.value)}
                >
                  <span style={{ fontSize: `${size.preview}px` }}>
                    {size.label}
                  </span>
                  {size.value && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {size.value}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Sep />

        {/* Basic formatting */}
        <MenuButton
          icon={TextBoldIcon}
          title="Bold"
          shortcut="⌘B"
          isActive={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <MenuButton
          icon={TextItalicIcon}
          title="Italic"
          shortcut="⌘I"
          isActive={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <MenuButton
          icon={TextUnderlineIcon}
          title="Underline"
          shortcut="⌘U"
          isActive={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <MenuButton
          icon={TextStrikethroughIcon}
          title="Strikethrough"
          isActive={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />

        <Sep />

        {/* Sub/Superscript */}
        <MenuButton
          icon={ArrowDown01Icon}
          title="Subscript"
          isActive={editor.isActive("subscript")}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
        />
        <MenuButton
          icon={ArrowUp01Icon}
          title="Superscript"
          isActive={editor.isActive("superscript")}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
        />

        {/* Small Caps */}
        <MenuButton
          title="Small Caps"
          isActive={
            editor.getAttributes("textStyle")?.fontVariant === "small-caps"
          }
          onClick={handleToggleSmallCaps}
        >
          <span className="text-[9px] font-bold leading-none tracking-tight">
            Aa
          </span>
        </MenuButton>

        <Sep />

        {/* Headings */}
        <MenuButton
          icon={Heading01Icon}
          title="Heading 1"
          isActive={editor.isActive("heading", { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        />
        <MenuButton
          icon={Heading02Icon}
          title="Heading 2"
          isActive={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        />
        <MenuButton
          icon={Heading03Icon}
          title="Heading 3"
          isActive={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        />

        <Sep />

        {/* Blockquote */}
        <MenuButton
          icon={QuoteDownIcon}
          title="Quote"
          isActive={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />

        <Sep />

        {/* Alignment */}
        <MenuButton
          icon={TextAlignLeftIcon}
          title="Align Left"
          isActive={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        />
        <MenuButton
          icon={TextAlignCenterIcon}
          title="Align Center"
          isActive={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        />
        <MenuButton
          icon={TextAlignRightIcon}
          title="Align Right"
          isActive={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        />

        <Sep />

        {/* Text Opacity */}
        <Popover open={opacityOpen} onOpenChange={setOpacityOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  className={cn(
                    "h-7 w-7 p-0 shrink-0",
                    currentOpacity &&
                      currentOpacity !== "1" &&
                      "bg-accent text-accent-foreground",
                  )}
                >
                  <span className="text-[10px] font-bold leading-none">%</span>
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[10px] px-2 py-1">
              Text Opacity
            </TooltipContent>
          </Tooltip>
          <PopoverContent
            side="bottom"
            align="center"
            className="w-auto p-1.5"
            sideOffset={8}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-1">
                Opacity
              </span>
              {OPACITY_LEVELS.map((level) => (
                <button
                  key={level.label}
                  type="button"
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-accent transition-colors text-left min-w-[100px]",
                    (level.value === currentOpacity ||
                      (level.value === "1" && !currentOpacity)) &&
                      "bg-accent font-medium",
                  )}
                  onClick={() => handleSetOpacity(level.value)}
                >
                  {level.value && level.value !== "1" ? (
                    <div
                      className="w-3 h-3 rounded-sm bg-foreground"
                      style={{ opacity: parseFloat(level.value) }}
                    />
                  ) : level.value === "1" ? (
                    <div className="w-3 h-3 rounded-sm bg-foreground" />
                  ) : (
                    <div className="w-3 h-3 rounded-sm border border-border relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2.5 h-[1px] bg-destructive rotate-45" />
                      </div>
                    </div>
                  )}
                  <span>{level.label}</span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Sep />

        {/* Text Color */}
        <Popover open={textColorOpen} onOpenChange={setTextColorOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  className="h-7 w-7 p-0 shrink-0 relative"
                >
                  <HugeiconsIcon icon={PaintBrushIcon} size={14} />
                  <div
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[2px] w-3.5 rounded-full"
                    style={{
                      backgroundColor: currentTextColor || "currentColor",
                    }}
                  />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[10px] px-2 py-1">
              Text Color
            </TooltipContent>
          </Tooltip>
          <PopoverContent
            side="bottom"
            align="center"
            className="w-auto p-0"
            sideOffset={8}
          >
            <ColorPickerGrid
              colors={TEXT_COLORS}
              activeColor={currentTextColor}
              onSelect={handleSetTextColor}
              label="Text Color"
            />
          </PopoverContent>
        </Popover>

        {/* Highlight */}
        <Popover open={highlightOpen} onOpenChange={setHighlightOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  className="h-7 w-7 p-0 shrink-0 relative"
                >
                  <HugeiconsIcon icon={DropletIcon} size={14} />
                  <div
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[2px] w-3.5 rounded-full"
                    style={{
                      backgroundColor: currentHighlight || "transparent",
                      border: currentHighlight
                        ? "none"
                        : "1px solid hsl(var(--border))",
                    }}
                  />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[10px] px-2 py-1">
              Highlight
            </TooltipContent>
          </Tooltip>
          <PopoverContent
            side="bottom"
            align="center"
            className="w-auto p-0"
            sideOffset={8}
          >
            <ColorPickerGrid
              colors={HIGHLIGHT_COLORS}
              activeColor={currentHighlight}
              onSelect={handleSetHighlight}
              label="Highlight"
            />
          </PopoverContent>
        </Popover>

        <Sep />

        {/* Clear Formatting */}
        <MenuButton
          icon={CleanIcon}
          title="Clear Formatting"
          onClick={handleClearFormatting}
        />
      </div>
    </TooltipProvider>
  );
}
