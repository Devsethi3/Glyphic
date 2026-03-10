import { useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ShuffleIcon,
  Moon02Icon,
  Sun03Icon,
  ScrollIcon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Scrubber from "@/components/smoothui/scrubber";
import { cn } from "@/lib/utils";

// Custom Tooltip Component for Paper Texture Info
const PaperTextureInfoTooltip = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        className="inline-flex items-center ml-1 cursor-help touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm relative z-10"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        aria-label="Information about paper texture"
      >
        <HugeiconsIcon icon={InformationCircleIcon} size={14} />
      </button>

      {/* Tooltip Content */}
      {isOpen && (
        <>
          {/* Backdrop for mobile - closes on tap outside */}
          <div
            className="fixed inset-0 z-[100] md:hidden"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            aria-hidden="true"
          />

          {/* Tooltip - Fixed positioning for mobile */}
          <div
            className={cn(
              "fixed md:absolute z-[101] px-3 py-2.5 text-xs leading-relaxed rounded-lg shadow-xl",
              "bg-popover text-popover-foreground border border-border",
              // Mobile: centered with max width
              "left-1/2 -translate-x-1/2 bottom-20 w-[calc(100vw-2rem)] max-w-[280px]",
              // Desktop: positioned relative to icon
              "md:w-[240px] md:left-auto md:right-auto md:bottom-auto",
              "md:top-full md:left-1/2 md:-translate-x-1/2 md:mt-2",
              // Animation
              "animate-in fade-in-0 zoom-in-95 duration-200",
            )}
            onClick={(e) => e.stopPropagation()}
            role="tooltip"
          >
            {/* Arrow - only visible on desktop */}
            <div
              className={cn(
                "hidden md:block absolute w-2 h-2 rotate-45 bg-popover border-border",
                "bottom-full left-1/2 -translate-x-1/2 mb-[-4px] border-l border-t",
              )}
              aria-hidden="true"
            />
            <p className="text-center">
              Adding texture may slightly increase image size due to
              high-quality paper effect
            </p>
          </div>
        </>
      )}
    </>
  );
};

export function ThemeColorControls() {
  const backgroundColor = useEditorStore((s) => s.backgroundColor);
  const textColor = useEditorStore((s) => s.textColor);
  const colorMode = useEditorStore((s) => s.colorMode);
  const paperTexture = useEditorStore((s) => s.paperTexture);
  const noiseIntensity = useEditorStore((s) => s.noiseIntensity);
  const setBackgroundColor = useEditorStore((s) => s.setBackgroundColor);
  const setTextColor = useEditorStore((s) => s.setTextColor);
  const setColorMode = useEditorStore((s) => s.setColorMode);
  const setPaperTexture = useEditorStore((s) => s.setPaperTexture);
  const setNoiseIntensity = useEditorStore((s) => s.setNoiseIntensity);
  const randomizeTheme = useEditorStore((s) => s.randomizeTheme);

  return (
    <Popover>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2.5">
                <span
                  className="h-3 w-3 rounded-full border border-input"
                  style={{ backgroundColor: backgroundColor }}
                />
                <span
                  className="h-3 w-3 rounded-full border border-input -ml-1.5"
                  style={{ backgroundColor: textColor }}
                />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Theme Colors
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent
        className="w-72 sm:w-80 p-4"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">Theme Colors</label>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={randomizeTheme}
            >
              <HugeiconsIcon icon={ShuffleIcon} size={14} />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-8 h-8 rounded-md border border-input cursor-pointer"
                />
                <span className="text-xs text-muted-foreground">
                  Background
                </span>
              </div>
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-full h-8 px-2 text-xs font-mono bg-transparent border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-8 h-8 rounded-md border border-input cursor-pointer"
                />
                <span className="text-xs text-muted-foreground">Text</span>
              </div>
              <input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-full h-8 px-2 text-xs font-mono bg-transparent border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Paper Texture Toggle with Info Tooltip */}
          <div className="relative">
            <button
              onClick={() => setPaperTexture(!paperTexture)}
              className={cn(
                "w-full py-2.5 text-xs rounded-md flex items-center justify-center gap-2 transition-colors border",
                paperTexture
                  ? "bg-secondary text-foreground border-secondary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-input",
              )}
            >
              <HugeiconsIcon icon={ScrollIcon} size={14} />
              Paper Texture
              <PaperTextureInfoTooltip />
            </button>
          </div>

          {/* Noise Intensity Scrubber - Only visible when paper texture is enabled */}
          {paperTexture && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Texture Intensity</label>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {Math.round(noiseIntensity * 100)}%
                </span>
              </div>
              <Scrubber
                label=""
                value={noiseIntensity}
                onValueChange={setNoiseIntensity}
                min={0.1}
                max={1.0}
                step={0.05}
                decimals={2}
                ticks={5}
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setColorMode("dark")}
              className={cn(
                "flex-1 py-2 text-xs rounded-md flex items-center justify-center gap-2 transition-colors border",
                colorMode === "dark"
                  ? "bg-secondary text-foreground border-secondary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-input",
              )}
            >
              <HugeiconsIcon icon={Moon02Icon} size={14} />
              Dark
            </button>
            <button
              onClick={() => setColorMode("light")}
              className={cn(
                "flex-1 py-2 text-xs rounded-md flex items-center justify-center gap-2 transition-colors border",
                colorMode === "light"
                  ? "bg-secondary text-foreground border-secondary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-input",
              )}
            >
              <HugeiconsIcon icon={Sun03Icon} size={14} />
              Light
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
