// src/components/editor/header/export-dialog.tsx
import { useState, useMemo } from "react";
import { useEditorStore } from "@/store/editor-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { HugeiconsIcon } from "@hugeicons/react";
import { ImageDownloadIcon } from "@hugeicons/core-free-icons";
import { ExportPreview } from "@/components/editor/export/export-preview";
import { ExportControls } from "@/components/editor/export/export-controls";
import { exportCanvasImage } from "@/lib/export-utils";
import { themePresets } from "@/data/themes";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { RenderConfig } from "@/types";

export function ExportDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

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
  const paperTexture = useEditorStore((s) => s.paperTexture);
  const noiseIntensity = useEditorStore((s) => s.noiseIntensity);

  // Build preview config with theme override
  const previewConfig: RenderConfig = useMemo(() => {
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
      paperTexture,
      noiseIntensity,
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
          paperTexture: preset.paperTexture ?? config.paperTexture,
        };
      }
    }

    return config;
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
    exportThemeOverride,
  ]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportCanvasImage(previewConfig, exportQuality, exportFormat);
      setOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const canExport = content.trim().length > 0;

  const defaultTrigger = (
    <Button size="sm" className="h-8 text-xs gap-1.5">
      <HugeiconsIcon icon={ImageDownloadIcon} size={14} />
      <span>Export</span>
    </Button>
  );

  // Desktop layout - two columns with preview on right
  const DesktopContent = (
    <div className="grid grid-cols-2 gap-6">
      {/* Left Column - Controls */}
      <div className="space-y-6">
        <ExportControls
          quality={exportQuality}
          format={exportFormat}
          themeOverride={exportThemeOverride}
          onQualityChange={setExportQuality}
          onFormatChange={setExportFormat}
          onThemeOverrideChange={setExportThemeOverride}
        />

        <Button
          onClick={handleExport}
          className="w-full h-10!"
          disabled={isExporting || !canExport}
          size="lg"
        >
          {isExporting
            ? "Exporting..."
            : `Export ${exportFormat.toUpperCase()}`}
        </Button>

        {!canExport && (
          <p className="text-xs text-muted-foreground text-center">
            Write some text to enable export
          </p>
        )}
      </div>

      {/* Right Column - Preview */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Preview
        </label>
        <ExportPreview config={previewConfig} />
      </div>
    </div>
  );

  // Mobile layout - stacked with scrollable area
  const MobileContent = (
    <div className="flex flex-col h-full max-h-full overflow-hidden">
      <ScrollArea className="flex-1 h-full">
        <div className="space-y-6 px-4 pb-4">
          {/* Preview First on Mobile */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Preview
            </label>
            <ExportPreview config={previewConfig} />
          </div>
          <div className="shrink-0 py-3">
            <Button
              onClick={handleExport}
              className="w-full h-10!"
              disabled={isExporting || !canExport}
              size="lg"
            >
              {isExporting
                ? "Exporting..."
                : `Export ${exportFormat.toUpperCase()}`}
            </Button>

            {!canExport && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Write some text to enable export
              </p>
            )}
          </div>

          {/* Controls */}
          <ExportControls
            quality={exportQuality}
            format={exportFormat}
            themeOverride={exportThemeOverride}
            onQualityChange={setExportQuality}
            onFormatChange={setExportFormat}
            onThemeOverrideChange={setExportThemeOverride}
          />
        </div>
      </ScrollArea>

      {/* Fixed Export Button at bottom */}
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children || defaultTrigger}</DialogTrigger>
        <DialogContent className="max-w-4xl! p-10">
          <DialogHeader>
            <DialogTitle>Export Image</DialogTitle>
            <DialogDescription>
              Configure and download your design
            </DialogDescription>
          </DialogHeader>
          {DesktopContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children || defaultTrigger}</DrawerTrigger>
      <DrawerContent className="h-[85vh] max-h-[85vh] flex flex-col overflow-hidden">
        <DrawerHeader className="shrink-0 pb-0">
          <DrawerTitle>Export Image</DrawerTitle>
          <DrawerDescription>
            Configure and download your design
          </DrawerDescription>
        </DrawerHeader>
        {MobileContent}
      </DrawerContent>
    </Drawer>
  );
}
