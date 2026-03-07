// src/components/editor/editor-toolbar.tsx
import { Separator } from "@/components/ui/separator";
import { FontSelector } from "./toolbar/font-selector";
import { LineHeightControl } from "./toolbar/line-height-control";
import { DropCapToggle } from "./toolbar/drop-cap-toggle";
import { ThemeColorControls } from "./toolbar/theme-color-controls";
import { PaddingControls } from "./toolbar/padding-controls";
import { KaomojiPicker } from "./toolbar/kaomoji-picker";
import { DecorationPicker } from "./toolbar/decoration-picker";

export function EditorToolbar() {
  return (
    <div className="p-4 space-y-4 border-b border-border">
      <FontSelector />
      <LineHeightControl />
      <DropCapToggle />

      <Separator />

      <ThemeColorControls />

      <Separator />

      <PaddingControls />

      <Separator />

      <div className="flex gap-2">
        <KaomojiPicker />
        <DecorationPicker />
      </div>
    </div>
  );
}
