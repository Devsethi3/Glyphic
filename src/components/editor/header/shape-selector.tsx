// src/components/editor/header/shape-selector.tsx
import { useEditorStore } from "@/store/editor-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import { Square01Icon } from "@hugeicons/core-free-icons";
import { shapeLabels } from "@/data/shapes";
import type { CanvasShape } from "@/types";
import { cn } from "@/lib/utils";

const shapeOptions: CanvasShape[] = [
  "square",
  "portrait",
  "landscape",
  "vertical",
];

export function ShapeSelector() {
  const shape = useEditorStore((s) => s.shape);
  const setShape = useEditorStore((s) => s.setShape);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
          <HugeiconsIcon icon={Square01Icon} size={14} />
          <span>{shapeLabels[shape].split(" ")[0]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {shapeOptions.map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => setShape(option)}
            className={cn(shape === option && "bg-accent")}
          >
            {shapeLabels[option]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
