import { useEditorStore } from "@/store/editor-store";
import { Slider } from "@/components/ui/slider";

export function LineHeightControl() {
  const lineHeight = useEditorStore((s) => s.lineHeight);
  const setLineHeight = useEditorStore((s) => s.setLineHeight);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] text-muted-foreground font-medium">
          Line Height
        </label>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {lineHeight.toFixed(1)}
        </span>
      </div>
      <Slider
        value={[lineHeight]}
        onValueChange={(value) =>
          setLineHeight(Array.isArray(value) ? value[0] : value)
        }
        min={1.0}
        max={2.5}
        step={0.1}
      />
    </div>
  );
}
