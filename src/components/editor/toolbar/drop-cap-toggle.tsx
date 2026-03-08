// src/components/editor/toolbar/drop-cap-toggle.tsx
import { useEditorStore } from "@/store/editor-store";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { TextFirstlineLeftIcon } from "@hugeicons/core-free-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function DropCapToggle() {
  const dropCap = useEditorStore((s) => s.dropCap);
  const toggleDropCap = useEditorStore((s) => s.toggleDropCap);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={dropCap ? "secondary" : "outline"}
            size="sm"
            className={cn("h-8 px-2.5", dropCap && "bg-secondary")}
            onClick={toggleDropCap}
          >
            <HugeiconsIcon icon={TextFirstlineLeftIcon} size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {dropCap ? "Disable" : "Enable"} Drop Cap
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
