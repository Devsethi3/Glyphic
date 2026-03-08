// src/components/editor/toolbar/decoration-picker.tsx
import { useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
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
      <PopoverTrigger>
        <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
          <span>☿</span>
          <span>Decor</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent side="right" sideOffset={8} className="w-80 p-0">
        <div className="border-b p-3">
          <h4 className="text-xs font-medium">Decorations</h4>
          <p className="text-[10px] text-muted-foreground">
            Click to insert at cursor
          </p>
        </div>

        <div className="flex gap-1 p-2 border-b overflow-x-auto">
          {decorationCategories.map((category) => (
            <button
              key={category.name}
              onClick={() => setActiveCategory(category.name)}
              className={cn(
                "text-[10px] px-2 py-1 rounded-md whitespace-nowrap transition-colors",
                activeCategory === category.name
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              {category.name}
            </button>
          ))}
        </div>

        <ScrollArea className="h-48">
          <div className="grid grid-cols-6 gap-1 p-2">
            {currentCategory?.items.map((item, index) => (
              <button
                key={index}
                onClick={() => insertDecoration(item)}
                className="text-base p-2 aspect-square flex items-center justify-center rounded-md hover:bg-accent transition-colors"
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
