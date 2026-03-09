// src/lib/export-utils.ts
import { exportCanvas } from "@/engine/renderer";
import type { RenderConfig, ExportQuality, ExportFormat } from "@/types";

export async function exportCanvasImage(
  config: RenderConfig,
  quality: ExportQuality,
  format: ExportFormat,
): Promise<void> {
  // Ensure fonts are loaded
  await document.fonts.ready;

  // Small delay to ensure all async operations complete
  return new Promise((resolve) => {
    setTimeout(() => {
      exportCanvas(config, quality, format);
      resolve();
    }, 100);
  });
}
