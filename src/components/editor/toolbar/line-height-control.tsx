import { useEditorStore } from "@/store/editor-store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ParagraphSpacingIcon } from "@hugeicons/core-free-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Scrubber from "@/components/smoothui/scrubber";

export function LineHeightControl() {
  const lineHeight = useEditorStore((s) => s.lineHeight);
  const setLineHeight = useEditorStore((s) => s.setLineHeight);

  return (
    <Popover>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2 gap-1.5">
                <HugeiconsIcon icon={ParagraphSpacingIcon} size={16} />
                <span className="text-xs tabular-nums">
                  {lineHeight.toFixed(1)}
                </span>
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Line Height
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent
        className="w-72 p-3 mr-2"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">Line Height</label>
            <span className="text-xs tabular-nums text-muted-foreground">
              {lineHeight.toFixed(1)}
            </span>
          </div>
          <Scrubber
            label=""
            value={lineHeight}
            onValueChange={setLineHeight}
            min={1.0}
            max={2.5}
            step={0.1}
            decimals={1}
            ticks={5}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
