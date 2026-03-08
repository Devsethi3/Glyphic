import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  ListViewIcon,
  LeftToRightListNumberIcon,
  MinusSignIcon,
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  ArrowTurnBackwardIcon,
  ArrowTurnForwardIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface EditorFormatBarProps {
  editor: Editor;
}

interface FormatAction {
  icon: typeof TextBoldIcon;
  title: string;
  action: () => void;
  isActive?: () => boolean;
}

export function EditorFormatBar({ editor }: EditorFormatBarProps) {
  const formatActions: FormatAction[][] = [
    // Text formatting
    [
      {
        icon: TextBoldIcon,
        title: "Bold (Ctrl+B)",
        action: () => editor.chain().focus().toggleBold().run(),
        isActive: () => editor.isActive("bold"),
      },
      {
        icon: TextItalicIcon,
        title: "Italic (Ctrl+I)",
        action: () => editor.chain().focus().toggleItalic().run(),
        isActive: () => editor.isActive("italic"),
      },
      {
        icon: TextUnderlineIcon,
        title: "Underline (Ctrl+U)",
        action: () => editor.chain().focus().toggleUnderline().run(),
        isActive: () => editor.isActive("underline"),
      },
      {
        icon: TextStrikethroughIcon,
        title: "Strikethrough",
        action: () => editor.chain().focus().toggleStrike().run(),
        isActive: () => editor.isActive("strike"),
      },
    ],
    // Headings
    [
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
    ],
    // Block elements
    [
      {
        icon: QuoteDownIcon,
        title: "Blockquote",
        action: () => editor.chain().focus().toggleBlockquote().run(),
        isActive: () => editor.isActive("blockquote"),
      },
      {
        icon: ListViewIcon,
        title: "Bullet List",
        action: () => editor.chain().focus().toggleBulletList().run(),
        isActive: () => editor.isActive("bulletList"),
      },
      {
        icon: LeftToRightListNumberIcon,
        title: "Ordered List",
        action: () => editor.chain().focus().toggleOrderedList().run(),
        isActive: () => editor.isActive("orderedList"),
      },
      {
        icon: MinusSignIcon,
        title: "Divider",
        action: () => editor.chain().focus().setHorizontalRule().run(),
      },
    ],
    // Alignment
    [
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
    ],
    // Undo/Redo
    [
      {
        icon: ArrowTurnBackwardIcon,
        title: "Undo (Ctrl+Z)",
        action: () => editor.chain().focus().undo().run(),
      },
      {
        icon: ArrowTurnForwardIcon,
        title: "Redo (Ctrl+Shift+Z)",
        action: () => editor.chain().focus().redo().run(),
      },
    ],
  ];

  return (
    <TooltipProvider>
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-border flex-wrap">
        {formatActions.map((group, groupIndex) => (
          <div key={groupIndex} className="flex items-center">
            {groupIndex > 0 && (
              <Separator
                orientation="vertical"
                className="h-5 mx-1 bg-border/50"
              />
            )}
            <div className="flex items-center gap-0.5">
              {group.map((action, actionIndex) => (
                <Tooltip key={actionIndex}>
                  <TooltipTrigger>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-7 w-7 p-0",
                        action.isActive?.() &&
                          "bg-accent text-accent-foreground",
                      )}
                      onClick={action.action}
                    >
                      <HugeiconsIcon icon={action.icon} size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="text-[10px] px-2 py-1"
                  >
                    {action.title}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
