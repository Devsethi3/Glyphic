// src/components/editor/toolbar/decoration-picker.tsx
import { useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { decorationCategories } from "@/data/decorations";
import { cn } from "@/lib/utils";

export function DecorationPicker() {
  const [activeCategory, setActiveCategory] = useState(
    decorationCategories[0].name,
  );
  const editorRef = useEditorStore((s) => s.editorRef);

  const currentCategory = decorationCategories.find(
    (c) => c.name === activeCategory,
  );

  const insertDecoration = (decoration: string) => {
    if (editorRef) {
      editorRef.chain().focus().insertContent(decoration).run();
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
          <span>☿</span>
          Decor
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        sideOffset={8}
        className="w-[min(calc(100vw-2rem),20rem)] p-0 mx-4"
      >
        {/* Header */}
        <div className="border-b p-3 shrink-0">
          <h4 className="text-xs font-medium">Decorations</h4>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Click to insert at cursor
          </p>
        </div>

        {/* Categories - Horizontal Scroll */}
        <div className="border-b shrink-0">
          <ScrollArea className="w-full">
            <div className="flex gap-1 p-2 w-max min-w-full">
              {decorationCategories.map((category) => (
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
          <div className="grid grid-cols-6 gap-1 p-2">
            {currentCategory?.items.map((item, index) => (
              <button
                key={index}
                onClick={() => insertDecoration(item)}
                className="text-base p-2 aspect-square flex items-center justify-center rounded-md hover:bg-accent transition-colors"
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
