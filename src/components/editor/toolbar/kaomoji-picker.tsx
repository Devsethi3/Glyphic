// src/components/editor/toolbar/kaomoji-picker.tsx
import { useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
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
      <PopoverTrigger>
        <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
          <span>ʕ•ᴥ•ʔ</span>
          <span>Kaomoji</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent side="right" sideOffset={8} className="w-80 p-0">
        <div className="border-b p-3">
          <h4 className="text-xs font-medium">Kaomoji</h4>
          <p className="text-[10px] text-muted-foreground">
            Click to insert at cursor
          </p>
        </div>

        <div className="flex gap-1 p-2 border-b overflow-x-auto">
          {kaomojiCategories.map((category) => (
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
          <div className="grid grid-cols-3 gap-1 p-2">
            {currentCategory?.items.map((item, index) => (
              <button
                key={index}
                onClick={() => insertKaomoji(item)}
                className="text-xs p-2 rounded-md hover:bg-accent text-center truncate transition-colors"
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
