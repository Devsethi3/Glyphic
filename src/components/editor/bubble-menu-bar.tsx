// src/components/editor/bubble-menu-bar.tsx
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
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface BubbleMenuBarProps {
  editor: Editor;
}

export function BubbleMenuBar({ editor }: BubbleMenuBarProps) {
  const items = [
    {
      icon: TextBoldIcon,
      title: "Bold",
      shortcut: "Ctrl+B",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive("bold"),
    },
    {
      icon: TextItalicIcon,
      title: "Italic",
      shortcut: "Ctrl+I",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive("italic"),
    },
    {
      icon: TextUnderlineIcon,
      title: "Underline",
      shortcut: "Ctrl+U",
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: () => editor.isActive("underline"),
    },
    {
      icon: TextStrikethroughIcon,
      title: "Strikethrough",
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive("strike"),
    },
    { type: "separator" },
    {
      icon: Heading01Icon,
      title: "Heading 1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive("heading", { level: 1 }),
    },
    {
      icon: Heading02Icon,
      title: "Heading 2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive("heading", { level: 2 }),
    },
    {
      icon: Heading03Icon,
      title: "Heading 3",
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor.isActive("heading", { level: 3 }),
    },
    { type: "separator" },
    {
      icon: QuoteDownIcon,
      title: "Quote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive("blockquote"),
    },
    {
      icon: TextAlignLeftIcon,
      title: "Align Left",
      action: () => editor.chain().focus().setTextAlign("left").run(),
      isActive: () => editor.isActive({ textAlign: "left" }),
    },
    {
      icon: TextAlignCenterIcon,
      title: "Align Center",
      action: () => editor.chain().focus().setTextAlign("center").run(),
      isActive: () => editor.isActive({ textAlign: "center" }),
    },
    {
      icon: TextAlignRightIcon,
      title: "Align Right",
      action: () => editor.chain().focus().setTextAlign("right").run(),
      isActive: () => editor.isActive({ textAlign: "right" }),
    },
  ];

  return (
    <TooltipProvider>
      <div className="flex items-center gap-0.5 bg-popover border border-border rounded-lg shadow-lg p-1">
        {items.map((item, index) => {
          if ("type" in item && item.type === "separator") {
            return <div key={index} className="w-px h-4 bg-border mx-0.5" />;
          }

          const menuItem = item as {
            icon: typeof TextBoldIcon;
            title: string;
            shortcut?: string;
            action: () => void;
            isActive: () => boolean;
          };

          return (
            <Tooltip key={index}>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7 p-0",
                    menuItem.isActive() && "bg-accent text-accent-foreground",
                  )}
                  onClick={menuItem.action}
                >
                  <HugeiconsIcon icon={menuItem.icon} size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {menuItem.title}
                  {menuItem.shortcut && (
                    <span className="ml-2 text-muted-foreground">
                      {menuItem.shortcut}
                    </span>
                  )}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
