// src/components/editor/editor-canvas.tsx
import { useEffect, useRef, useMemo } from "react";
import { useEditorStore } from "@/store/editor-store";
import { renderCanvas } from "@/engine/renderer";
import { shapes } from "@/data/shapes";
import type { RenderConfig } from "@/types";

// Fixed preview sizes for each shape
const PREVIEW_SIZES = {
  square: { width: 400, height: 400 },
  portrait: { width: 360, height: 450 },
  landscape: { width: 480, height: 270 },
  vertical: { width: 280, height: 500 },
};

export function EditorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const content = useEditorStore((s) => s.content);
  const htmlContent = useEditorStore((s) => s.htmlContent);
  const fontFamily = useEditorStore((s) => s.fontFamily);
  const lineHeight = useEditorStore((s) => s.lineHeight);
  const dropCap = useEditorStore((s) => s.dropCap);
  const backgroundColor = useEditorStore((s) => s.backgroundColor);
  const textColor = useEditorStore((s) => s.textColor);
  const backgroundType = useEditorStore((s) => s.backgroundType);
  const gradientColors = useEditorStore((s) => s.gradientColors);
  const gradientAngle = useEditorStore((s) => s.gradientAngle);
  const paddingHorizontal = useEditorStore((s) => s.paddingHorizontal);
  const paddingVertical = useEditorStore((s) => s.paddingVertical);
  const shape = useEditorStore((s) => s.shape);

  const config: RenderConfig = useMemo(
    () => ({
      text: content,
      htmlContent,
      fontFamily,
      lineHeight,
      dropCap,
      backgroundColor,
      textColor,
      backgroundType,
      gradientColors,
      gradientAngle,
      paddingHorizontal,
      paddingVertical,
      shape,
    }),
    [
      content,
      htmlContent,
      fontFamily,
      lineHeight,
      dropCap,
      backgroundColor,
      textColor,
      backgroundType,
      gradientColors,
      gradientAngle,
      paddingHorizontal,
      paddingVertical,
      shape,
    ],
  );

  // Get preview dimensions
  const previewSize = PREVIEW_SIZES[shape];
  const shapeData = shapes[shape];

  // Render canvas whenever config changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Wait for fonts to load
    document.fonts.ready.then(() => {
      requestAnimationFrame(() => {
        renderCanvas(canvas, config);
      });
    });
  }, [config]);

  return (
    <div
      className="w-full h-full flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: "hsl(0 0% 6%)",
      }}
    >
      <div
        className="flex items-center justify-center p-6"
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: previewSize.width,
            height: previewSize.height,
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            borderRadius: "4px",
          }}
        />
      </div>
    </div>
  );
}
