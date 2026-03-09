// src/components/editor/export/export-controls.tsx
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { themePresets } from "@/data/themes";
import type { ExportQuality, ExportFormat } from "@/types";
import { cn } from "@/lib/utils";

interface ExportControlsProps {
  quality: ExportQuality;
  format: ExportFormat;
  themeOverride: string | null;
  onQualityChange: (quality: ExportQuality) => void;
  onFormatChange: (format: ExportFormat) => void;
  onThemeOverrideChange: (themeId: string | null) => void;
}

const qualityOptions: {
  value: ExportQuality;
  label: string;
  size: string;
  description: string;
}[] = [
  {
    value: "standard",
    label: "Standard",
    size: "2x",
    description: "2160×2160",
  },
  { value: "high", label: "High", size: "3x", description: "3240×3240" },
  { value: "ultra", label: "Ultra", size: "4x", description: "4320×4320" },
];

export function ExportControls({
  quality,
  format,
  themeOverride,
  onQualityChange,
  onFormatChange,
  onThemeOverrideChange,
}: ExportControlsProps) {
  return (
    <div className="space-y-4">
      {/* Quality Selection */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Quality
        </label>
        <div className="grid grid-cols-3 gap-2">
          {qualityOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onQualityChange(option.value)}
              className={cn(
                "py-2.5 px-2 text-xs rounded-md border transition-all flex flex-col items-center gap-1",
                quality === option.value
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "border-input hover:bg-accent hover:border-accent-foreground/20",
              )}
            >
              <span className="font-medium">{option.label}</span>
              <span
                className={cn(
                  "text-[10px]",
                  quality === option.value
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground",
                )}
              >
                {option.size} · {option.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Theme Override */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Theme Override
        </label>
        <Select
          value={themeOverride || "none"}
          onValueChange={(value) =>
            onThemeOverrideChange(value === "none" ? null : value)
          }
        >
          <SelectTrigger className="w-full h-9 text-sm">
            <SelectValue placeholder="Select a theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Current theme</SelectItem>
            {themePresets.map((theme) => (
              <SelectItem key={theme.id} value={theme.id}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Format Selection */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Format
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onFormatChange("png")}
            className={cn(
              "py-2 text-sm rounded-md border transition-all font-medium",
              format === "png"
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "border-input hover:bg-accent hover:border-accent-foreground/20",
            )}
          >
            PNG
          </button>
          <button
            onClick={() => onFormatChange("svg")}
            className={cn(
              "py-2 text-sm rounded-md border transition-all flex items-center justify-center gap-1.5 font-medium",
              format === "svg"
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "border-input hover:bg-accent hover:border-accent-foreground/20",
            )}
          >
            SVG
            <Badge
              variant="secondary"
              className="text-[9px] px-1 py-0 font-normal"
            >
              beta
            </Badge>
          </button>
        </div>
      </div>
    </div>
  );
}
