// src/data/shapes.ts
import type { CanvasShape, ShapeDimensions } from "@/types";

export const shapes: Record<CanvasShape, ShapeDimensions> = {
  square: { width: 1080, height: 1080, aspectRatio: 1 },
  portrait: { width: 1080, height: 1350, aspectRatio: 4 / 5 },
  landscape: { width: 1200, height: 675, aspectRatio: 16 / 9 },
  vertical: { width: 1080, height: 1920, aspectRatio: 9 / 16 },
};

export const shapeLabels: Record<CanvasShape, string> = {
  square: "Square (1:1)",
  portrait: "Portrait (4:5)",
  landscape: "Landscape (16:9)",
  vertical: "Vertical (9:16)",
};
