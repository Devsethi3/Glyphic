// src/components/editor/header/theme-selector.tsx
import { useState, useMemo } from "react";
import { useEditorStore } from "@/store/editor-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HugeiconsIcon } from "@hugeicons/react";
import { PaintBrush01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { themePresets } from "@/data/themes";
import { cn } from "@/lib/utils";

export function ThemeSelector() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const activePreset = useEditorStore((s) => s.activePreset);
  const applyPreset = useEditorStore((s) => s.applyPreset);

  const filteredThemes = useMemo(() => {
    if (!search.trim()) return themePresets;
    const query = search.toLowerCase();
    return themePresets.filter((theme) =>
      theme.name.toLowerCase().includes(query),
    );
  }, [search]);

  const handleSelectTheme = (themeId: string) => {
    applyPreset(themeId);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
          <HugeiconsIcon icon={PaintBrush01Icon} size={14} />
          <span>Themes</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose theme</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search themes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <p className="text-xs text-muted-foreground">Default themes</p>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="grid grid-cols-2 gap-3 pb-4">
            {filteredThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                className={cn(
                  "rounded-lg border p-4 text-left transition-colors",
                  activePreset === theme.id
                    ? "border-foreground/50 ring-1 ring-foreground/30"
                    : "border-border hover:border-foreground/30",
                )}
                style={{
                  backgroundColor: theme.backgroundColor,
                  color: theme.textColor,
                }}
              >
                <p className="text-[10px] opacity-60 mb-1">{theme.name}</p>
                <p
                  style={{ fontFamily: theme.fontFamily }}
                  className="text-sm leading-relaxed"
                >
                  The quick brown fox jumps over the lazy dog.
                </p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
