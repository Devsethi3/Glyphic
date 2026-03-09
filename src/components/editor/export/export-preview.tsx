import { useEffect, useRef } from "react";
import { renderCanvas } from "@/engine/renderer";
import type { RenderConfig } from "@/types";

interface ExportPreviewProps {
  config: RenderConfig;
  className?: string;
}

export function ExportPreview({ config, className }: ExportPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    document.fonts.ready.then(() => {
      requestAnimationFrame(() => {
        renderCanvas(canvas, config, 2);
      });
    });
  }, [config]);

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        className="w-full h-auto rounded-md shadow-sm"
        style={{
          maxHeight: "300px",
          objectFit: "contain",
        }}
      />
    </div>
  );
}
