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
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HugeiconsIcon } from "@hugeicons/react";
import { PaintBoardIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { themePresets } from "@/data/themes";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

export function ThemeSelector() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");
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

  const ThemeButton = (
    <Button variant="ghost" size="sm" className="h-8 gap-1.5">
      <HugeiconsIcon icon={PaintBoardIcon} size={14} />
      <span>Themes</span>
    </Button>
  );

  const ThemeGrid = (
    <div className="grid grid-cols-2 gap-3">
      {filteredThemes.map((theme) => (
        <button
          key={theme.id}
          onClick={() => handleSelectTheme(theme.id)}
          className={cn(
            "rounded-lg border p-4 lg:p-8 text-left transition-all",
            activePreset === theme.id
              ? "border-foreground/50 ring-2 ring-foreground/30 shadow-sm"
              : "border-border hover:border-foreground/30 hover:shadow-sm",
          )}
          style={{
            backgroundColor: theme.backgroundColor,
            color: theme.textColor,
          }}
        >
          <p className="text-[10px] opacity-60 mb-1.5">{theme.name}</p>
          <p
            style={{ fontFamily: theme.fontFamily }}
            className="text-xs sm:text-sm leading-relaxed"
          >
            The quick brown fox jumps over the lazy dog.
          </p>
        </button>
      ))}
    </div>
  );

  // Desktop layout - EXACTLY like export dialog
  const DesktopContent = (
    <div className="space-y-4">
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
          className="pl-9 h-10"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {filteredThemes.length}{" "}
        {filteredThemes.length === 1 ? "theme" : "themes"} available
      </p>

      <ScrollArea className="h-[500px]">
        <div className="pr-4">{ThemeGrid}</div>
      </ScrollArea>
    </div>
  );

  // Mobile layout - following export dialog pattern
  const MobileContent = (
    <div className="flex flex-col h-full max-h-full overflow-hidden">
      <ScrollArea className="flex-1 h-full">
        <div className="space-y-4 px-4 pb-4">
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
              className="pl-9 h-10"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            {filteredThemes.length}{" "}
            {filteredThemes.length === 1 ? "theme" : "themes"} available
          </p>

          {ThemeGrid}
        </div>
      </ScrollArea>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{ThemeButton}</DialogTrigger>
        <DialogContent className="max-w-2xl!">
          <DialogHeader>
            <DialogTitle className="mb-2">Choose Theme</DialogTitle>
          </DialogHeader>
          {DesktopContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{ThemeButton}</DrawerTrigger>
      <DrawerContent className="h-[85vh] max-h-[85vh] flex flex-col overflow-hidden">
        <DrawerHeader className="shrink-0 pb-0">
          <DrawerTitle className="mb-3">Choose Theme</DrawerTitle>
        </DrawerHeader>
        {MobileContent}
      </DrawerContent>
    </Drawer>
  );
}
