// src/components/editor/header/export-dialog.tsx
import { useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { ImageDownloadIcon } from "@hugeicons/core-free-icons";
import { exportCanvas } from "@/engine/renderer";
import { themePresets } from "@/data/themes";
import type { ExportQuality, ExportFormat, RenderConfig } from "@/types";
import { cn } from "@/lib/utils";

export function ExportDialog() {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const exportQuality = useEditorStore((s) => s.exportQuality);
  const exportFormat = useEditorStore((s) => s.exportFormat);
  const exportThemeOverride = useEditorStore((s) => s.exportThemeOverride);
  const setExportQuality = useEditorStore((s) => s.setExportQuality);
  const setExportFormat = useEditorStore((s) => s.setExportFormat);
  const setExportThemeOverride = useEditorStore(
    (s) => s.setExportThemeOverride,
  );

  // Get current config
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

  const handleExport = async () => {
    setIsExporting(true);

    // Wait for fonts to be ready
    await document.fonts.ready;

    let config: RenderConfig = {
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
    };

    // Apply theme override if selected
    if (exportThemeOverride) {
      const preset = themePresets.find((p) => p.id === exportThemeOverride);
      if (preset) {
        config = {
          ...config,
          fontFamily: preset.fontFamily,
          lineHeight: preset.lineHeight,
          dropCap: preset.dropCap,
          backgroundColor: preset.backgroundColor,
          textColor: preset.textColor,
          backgroundType: preset.backgroundType,
          gradientColors: preset.gradientColors || [],
          gradientAngle: preset.gradientAngle || 0,
        };
      }
    }

    // Small delay to ensure UI updates
    setTimeout(() => {
      exportCanvas(config, exportQuality, exportFormat);
      setIsExporting(false);
      setOpen(false);
    }, 100);
  };

  const qualityOptions: {
    value: ExportQuality;
    label: string;
    size: string;
  }[] = [
    { value: "standard", label: "Standard", size: "2x" },
    { value: "high", label: "High", size: "3x" },
    { value: "ultra", label: "Ultra", size: "4x" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="sm" className="h-8 text-xs gap-1.5">
          <HugeiconsIcon icon={ImageDownloadIcon} size={14} />
          <span>Export</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Export Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Quality</label>
            <div className="flex gap-2">
              {qualityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setExportQuality(option.value)}
                  className={cn(
                    "flex-1 py-2 text-xs rounded-md border transition-colors flex flex-col items-center gap-0.5",
                    exportQuality === option.value
                      ? "bg-foreground text-background border-foreground"
                      : "border-input hover:bg-accent",
                  )}
                >
                  <span className="capitalize">{option.label}</span>
                  <span
                    className={cn(
                      "text-[10px]",
                      exportQuality === option.value
                        ? "text-background/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {option.size}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">
              Override theme
            </label>
            <select
              value={exportThemeOverride || ""}
              onChange={(e) => setExportThemeOverride(e.target.value || null)}
              className="w-full h-9 px-3 text-sm rounded-md border border-input bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">No override</option>
              {themePresets.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Format</label>
            <div className="flex gap-2">
              <button
                onClick={() => setExportFormat("png")}
                className={cn(
                  "flex-1 py-2 text-xs rounded-md border transition-colors",
                  exportFormat === "png"
                    ? "bg-foreground text-background border-foreground"
                    : "border-input hover:bg-accent",
                )}
              >
                PNG
              </button>
              <button
                onClick={() => setExportFormat("svg")}
                className={cn(
                  "flex-1 py-2 text-xs rounded-md border transition-colors flex items-center justify-center gap-1.5",
                  exportFormat === "svg"
                    ? "bg-foreground text-background border-foreground"
                    : "border-input hover:bg-accent",
                )}
              >
                SVG
                <Badge variant="secondary" className="text-[9px] px-1 py-0">
                  beta
                </Badge>
              </button>
            </div>
          </div>

          <Button
            onClick={handleExport}
            className="w-full"
            disabled={isExporting || !content.trim()}
          >
            {isExporting
              ? "Exporting..."
              : `Export ${exportFormat.toUpperCase()}`}
          </Button>

          {!content.trim() && (
            <p className="text-xs text-muted-foreground text-center">
              Write some text to enable export
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
