// src/components/editor/editor-canvas.tsx
import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import { useEditorStore } from "@/store/editor-store";
import { renderCanvas } from "@/engine/renderer";
import { shapes } from "@/data/shapes";
import type { RenderConfig } from "@/types";

export function EditorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

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

  // Track container size for responsive canvas sizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    };

    // Initial size
    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });

    resizeObserver.observe(container);

    // Also listen to window resize for safety
    window.addEventListener("resize", updateSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Wait for fonts to load for accurate rendering
    document.fonts.ready.then(() => {
      requestAnimationFrame(() => {
        renderCanvas(canvas, config);
      });
    });
  }, [config]);

  const shapeData = shapes[shape];
  const aspectRatio = shapeData.width / shapeData.height;

  // Calculate display size to fit container while maintaining aspect ratio
  const displaySize = useMemo(() => {
    if (containerSize.width === 0 || containerSize.height === 0) {
      return { width: 300, height: 300 };
    }

    // Padding around canvas (responsive)
    const paddingX = Math.min(48, containerSize.width * 0.08);
    const paddingY = Math.min(48, containerSize.height * 0.08);

    const availableWidth = containerSize.width - paddingX * 2;
    const availableHeight = containerSize.height - paddingY * 2;

    let width: number;
    let height: number;

    // Calculate dimensions based on aspect ratio
    const containerAspectRatio = availableWidth / availableHeight;

    if (aspectRatio > containerAspectRatio) {
      // Canvas is wider than container - fit to width
      width = availableWidth;
      height = width / aspectRatio;
    } else {
      // Canvas is taller than container - fit to height
      height = availableHeight;
      width = height * aspectRatio;
    }

    // Apply maximum constraints to prevent oversizing
    const maxWidth = Math.min(width, shapeData.width * 0.8);
    const maxHeight = Math.min(height, shapeData.height * 0.8);

    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    // Ensure minimum size for usability
    const minSize = 200;
    if (width < minSize && height < minSize) {
      if (aspectRatio >= 1) {
        width = minSize;
        height = width / aspectRatio;
      } else {
        height = minSize;
        width = height * aspectRatio;
      }
    }

    return {
      width: Math.round(width),
      height: Math.round(height),
    };
  }, [containerSize, aspectRatio, shapeData]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden"
      style={{
        backgroundColor: "hsl(0, 0%, 6%)",
        minHeight: "300px",
      }}
    >
      <div
        className="relative flex-shrink-0 transition-all duration-200 ease-out"
        style={{
          width: displaySize.width,
          height: displaySize.height,
          maxWidth: "100%",
          maxHeight: "100%",
        }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full rounded-sm"
          style={{
            boxShadow:
              "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 12px 24px -8px rgba(0, 0, 0, 0.3)",
            imageRendering: "auto",
          }}
        />
      </div>
    </div>
  );
}
