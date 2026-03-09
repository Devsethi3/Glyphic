// src/components/editor/toolbar/kaomoji-picker.tsx
import { useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { kaomojiCategories } from "@/data/kaomoji";
import { cn } from "@/lib/utils";

export function KaomojiPicker() {
  const [activeCategory, setActiveCategory] = useState(
    kaomojiCategories[0].name,
  );
  const editorRef = useEditorStore((s) => s.editorRef);

  const currentCategory = kaomojiCategories.find(
    (c) => c.name === activeCategory,
  );

  const insertKaomoji = (kaomoji: string) => {
    if (editorRef) {
      editorRef.chain().focus().insertContent(kaomoji).run();
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
        >
          <span>ʕ•ᴥ•ʔ</span>
          Kaomoji
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        sideOffset={8}
        className="w-[min(calc(100vw-2rem),20rem)] p-0 mx-2"
      >
        {/* Header */}
        <div className="border-b p-3 shrink-0">
          <h4 className="text-xs font-medium">Kaomoji</h4>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Click to insert at cursor
          </p>
        </div>

        {/* Categories - Horizontal Scroll */}
        <div className="border-b shrink-0">
          <ScrollArea className="w-full">
            <div className="flex gap-1 p-2 w-max min-w-full">
              {kaomojiCategories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setActiveCategory(category.name)}
                  className={cn(
                    "text-[10px] px-2.5 py-1.5 rounded-md whitespace-nowrap transition-colors shrink-0",
                    activeCategory === category.name
                      ? "bg-secondary text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Content - Vertical Scroll */}
        <ScrollArea className="h-48">
          <div className="grid grid-cols-3 gap-1 p-2">
            {currentCategory?.items.map((item, index) => (
              <button
                key={index}
                onClick={() => insertKaomoji(item)}
                className="text-xs p-2 rounded-md hover:bg-accent text-center truncate transition-colors min-w-0"
                title={item}
              >
                {item}
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
