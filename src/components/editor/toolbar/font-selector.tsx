// src/components/editor/toolbar/font-selector.tsx
import { useEditorStore } from "@/store/editor-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FontFamily } from "@/types";

const fonts: { name: FontFamily; category: string }[] = [
  { name: "EB Garamond", category: "Serif" },
  { name: "Playfair Display", category: "Serif" },
  { name: "Instrument Serif", category: "Serif" },
  { name: "Inter", category: "Sans" },
  { name: "Space Grotesk", category: "Sans" },
  { name: "Syne", category: "Sans" },
  { name: "JetBrains Mono", category: "Mono" },
  { name: "IBM Plex Mono", category: "Mono" },
];

export function FontSelector() {
  const fontFamily = useEditorStore((s) => s.fontFamily);
  const setFontFamily = useEditorStore((s) => s.setFontFamily);

  return (
    <div className="space-y-1.5">
      {/* <label className="text-[11px] text-muted-foreground font-medium">
        Font
      </label> */}
      <Select
        value={fontFamily}
        onValueChange={(v) => setFontFamily(v as FontFamily)}
      >
        <SelectTrigger className="h-8!">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {fonts.map((font) => (
            <SelectItem key={font.name} value={font.name}>
              <div className="flex items-center justify-between w-full gap-4">
                <span style={{ fontFamily: font.name }}>{font.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {font.category}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
