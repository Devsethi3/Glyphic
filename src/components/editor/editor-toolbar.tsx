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
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <FontSelector />
        <LineHeightControl />
        <DropCapToggle />
        <ThemeColorControls />
        <PaddingControls />

        <Separator orientation="vertical" />

        <KaomojiPicker />
        <DecorationPicker />
      </div>
    </div>
  );
}
