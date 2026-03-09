// src/components/editor/editor-canvas.tsx
import { useEffect, useRef, useCallback } from "react";
import { useEditorStore } from "@/store/editor-store";
import { renderCanvas } from "@/engine/renderer";
import { shapes } from "@/data/shapes";
import type { RenderConfig } from "@/types";

interface EditorCanvasProps {
  isMobile?: boolean;
}

export function EditorCanvas({ isMobile = false }: EditorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
  const paperTexture = useEditorStore((s) => s.paperTexture);
  const noiseIntensity = useEditorStore((s) => s.noiseIntensity);

  const config: RenderConfig = {
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
    paperTexture,
    noiseIntensity,
  };

  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const shapeData = shapes[shape];
    const containerRect = container.getBoundingClientRect();

    // Mobile: use full container size (no padding deduction)
    // Desktop: subtract padding for better spacing
    const maxWidth = isMobile ? containerRect.width : containerRect.width - 48;
    const maxHeight = isMobile
      ? containerRect.height
      : containerRect.height - 48;

    if (maxWidth <= 0 || maxHeight <= 0) return;

    const scaleX = maxWidth / shapeData.width;
    const scaleY = maxHeight / shapeData.height;
    const displayScale = Math.min(scaleX, scaleY, 1);

    const displayWidth = Math.round(shapeData.width * displayScale);
    const displayHeight = Math.round(shapeData.height * displayScale);

    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
  }, [shape, isMobile]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    document.fonts.ready.then(() => {
      requestAnimationFrame(() => {
        renderCanvas(canvas, config);
        updateCanvasSize();
      });
    });
  }, [
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
    paperTexture,
    noiseIntensity,
    updateCanvasSize,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      updateCanvasSize();
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [updateCanvasSize]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden"
    >
      <div
        className={
          isMobile
            ? "flex items-center justify-center w-full h-full"
            : "flex items-center justify-center w-full h-full p-6"
        }
      >
        <canvas
          ref={canvasRef}
          className="canvas-container"
          style={{
            borderRadius: isMobile ? "15px" : "20px",
            boxShadow: isMobile
              ? "none"
              : "0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)",
          }}
        />
      </div>
    </div>
  );
}
