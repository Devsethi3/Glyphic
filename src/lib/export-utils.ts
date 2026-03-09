import { exportCanvas } from "@/engine/renderer";
import type { RenderConfig, ExportQuality, ExportFormat } from "@/types";

export async function exportCanvasImage(
  config: RenderConfig,
  quality: ExportQuality,
  format: ExportFormat,
): Promise<void> {
  await document.fonts.ready;

  return new Promise((resolve) => {
    setTimeout(() => {
      exportCanvas(config, quality, format);
      resolve();
    }, 100);
  });
}
