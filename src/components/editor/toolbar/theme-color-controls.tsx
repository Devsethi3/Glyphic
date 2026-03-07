// src/components/editor/toolbar/theme-color-controls.tsx
import { useEditorStore } from "@/store/editor-store";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ShuffleIcon,
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

export function ThemeColorControls() {
  const backgroundColor = useEditorStore((s) => s.backgroundColor);
  const textColor = useEditorStore((s) => s.textColor);
  const colorMode = useEditorStore((s) => s.colorMode);
  const setBackgroundColor = useEditorStore((s) => s.setBackgroundColor);
  const setTextColor = useEditorStore((s) => s.setTextColor);
  const setColorMode = useEditorStore((s) => s.setColorMode);
  const randomizeTheme = useEditorStore((s) => s.randomizeTheme);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[11px] text-muted-foreground font-medium">
          Theme Colors
        </label>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={randomizeTheme}
        >
          <HugeiconsIcon icon={ShuffleIcon} size={14} />
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-7 h-7 rounded-md border border-input cursor-pointer"
            />
            <span className="text-[10px] text-muted-foreground">
              Background
            </span>
          </div>
          <input
            type="text"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="w-full h-6 px-1.5 text-[11px] font-mono bg-transparent border border-input rounded text-muted-foreground"
          />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-7 h-7 rounded-md border border-input cursor-pointer"
            />
            <span className="text-[10px] text-muted-foreground">Text</span>
          </div>
          <input
            type="text"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="w-full h-6 px-1.5 text-[11px] font-mono bg-transparent border border-input rounded text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex gap-1">
        <button
          onClick={() => setColorMode("dark")}
          className={cn(
            "flex-1 py-1.5 text-[11px] rounded-md flex items-center justify-center gap-1.5 transition-colors",
            colorMode === "dark"
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <HugeiconsIcon icon={Moon02Icon} size={12} />
          Dark
        </button>
        <button
          onClick={() => setColorMode("light")}
          className={cn(
            "flex-1 py-1.5 text-[11px] rounded-md flex items-center justify-center gap-1.5 transition-colors",
            colorMode === "light"
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <HugeiconsIcon icon={Sun03Icon} size={12} />
          Light
        </button>
      </div>
    </div>
  );
}
