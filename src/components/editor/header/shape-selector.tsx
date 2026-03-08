// src/components/editor/header/shape-selector.tsx
import { useEditorStore } from "@/store/editor-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { shapeLabels } from "@/data/shapes";
import type { CanvasShape } from "@/types";
import { cn } from "@/lib/utils";

const shapeIcons: Record<CanvasShape, { width: number; height: number }> = {
  square: { width: 14, height: 14 },
  portrait: { width: 11, height: 14 },
  landscape: { width: 16, height: 10 },
  vertical: { width: 9, height: 16 },
};

const shapeOptions: CanvasShape[] = [
  "square",
  "portrait",
  "landscape",
  "vertical",
];

function ShapeIcon({ shape, active }: { shape: CanvasShape; active: boolean }) {
  const dims = shapeIcons[shape];
  return (
    <div
      className={cn(
        "border-2 rounded-sm transition-colors",
        active ? "border-foreground" : "border-muted-foreground/50",
      )}
      style={{
        width: dims.width,
        height: dims.height,
      }}
    />
  );
}

export function ShapeSelector() {
  const shape = useEditorStore((s) => s.shape);
  const setShape = useEditorStore((s) => s.setShape);

  const handleShapeChange = (newShape: CanvasShape) => {
    setShape(newShape);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 text-xs gap-2">
          <ShapeIcon shape={shape} active />
          <span>{shapeLabels[shape]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {shapeOptions.map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => handleShapeChange(option)}
            className={cn(
              "flex items-center gap-3 cursor-pointer",
              shape === option && "bg-accent",
            )}
          >
            <ShapeIcon shape={option} active={shape === option} />
            <span>{shapeLabels[option]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
