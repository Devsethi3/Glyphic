import { useEditorStore } from "@/store/editor-store";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
              <Button variant="outline" size="sm" className="h-8 px-2.5">
                <HugeiconsIcon icon={BorderAllIcon} size={16} />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Padding
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent
        className="w-64 sm:w-72 p-4"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <div className="space-y-4">
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

          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Horizontal
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {paddingHorizontal}%
                </span>
              </div>
              <Slider
                value={[paddingHorizontal]}
                onValueChange={(value) => {
                  const newValue = Array.isArray(value) ? value[0] : value;
                  setPaddingHorizontal(newValue);
                  if (paddingLocked) {
                    setPaddingVertical(newValue);
                  }
                }}
                min={0}
                max={30}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Vertical</span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {paddingVertical}%
                </span>
              </div>
              <Slider
                value={[paddingVertical]}
                onValueChange={(value) => {
                  const newValue = Array.isArray(value) ? value[0] : value;
                  setPaddingVertical(newValue);
                  if (paddingLocked) {
                    setPaddingHorizontal(newValue);
                  }
                }}
                min={0}
                max={30}
                step={1}
                className="w-full"
                disabled={paddingLocked}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
