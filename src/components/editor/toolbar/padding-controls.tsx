// padding-controls.tsx
import { useEditorStore } from "@/store/editor-store";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  LockedIcon,
  SquareUnlock02Icon,
  BorderAllIcon,
} from "@hugeicons/core-free-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Scrubber from "@/components/smoothui/scrubber";

export function PaddingControls() {
  const paddingLocked = useEditorStore((s) => s.paddingLocked);
  const paddingHorizontal = useEditorStore((s) => s.paddingHorizontal);
  const paddingVertical = useEditorStore((s) => s.paddingVertical);
  const setPaddingLocked = useEditorStore((s) => s.setPaddingLocked);
  const setPaddingHorizontal = useEditorStore((s) => s.setPaddingHorizontal);
  const setPaddingVertical = useEditorStore((s) => s.setPaddingVertical);

  return (
    <Popover>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <img src="/box.svg" alt="padding" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Padding
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent
        className="w-72 p-3"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">Padding</label>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPaddingLocked(!paddingLocked)}
            >
              <HugeiconsIcon
                icon={paddingLocked ? LockedIcon : SquareUnlock02Icon}
                size={14}
              />
            </Button>
          </div>

          {paddingLocked ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">All side</label>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {paddingHorizontal}
                </span>
              </div>
              <Scrubber
                label=""
                value={paddingHorizontal}
                onValueChange={(value) => {
                  setPaddingHorizontal(value);
                }}
                min={0}
                max={30}
                step={1}
                decimals={0}
                ticks={5}
              />
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Horizontal</label>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {paddingHorizontal}
                </span>
              </div>
              <Scrubber
                label=""
                value={paddingHorizontal}
                onValueChange={setPaddingHorizontal}
                min={0}
                max={30}
                step={1}
                decimals={0}
                ticks={5}
              />
              <div className="flex mt-4 items-center justify-between">
                <label className="text-xs font-medium">Vertical</label>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {paddingVertical}
                </span>
              </div>
              <Scrubber
                label=""
                value={paddingVertical}
                onValueChange={setPaddingVertical}
                min={0}
                max={30}
                step={1}
                decimals={0}
                ticks={5}
              />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
