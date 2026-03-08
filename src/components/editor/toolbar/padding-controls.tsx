import { useEditorStore } from "@/store/editor-store";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { HugeiconsIcon } from "@hugeicons/react";
import { LockedIcon, LockOpen } from "@hugeicons/core-free-icons";

export function PaddingControls() {
  const paddingLocked = useEditorStore((s) => s.paddingLocked);
  const paddingHorizontal = useEditorStore((s) => s.paddingHorizontal);
  const paddingVertical = useEditorStore((s) => s.paddingVertical);
  const setPaddingLocked = useEditorStore((s) => s.setPaddingLocked);
  const setPaddingHorizontal = useEditorStore((s) => s.setPaddingHorizontal);
  const setPaddingVertical = useEditorStore((s) => s.setPaddingVertical);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[11px] text-muted-foreground font-medium">
          Padding
        </label>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setPaddingLocked(!paddingLocked)}
        >
          <HugeiconsIcon
            icon={paddingLocked ? LockedIcon : LockOpen}
            size={14}
          />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Horizontal</span>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {paddingHorizontal}%
          </span>
        </div>
        <Slider
          value={[paddingHorizontal]}
          onValueChange={(value) => setPaddingHorizontal(Array.isArray(value) ? value[0] : value)}
          min={0}
          max={30}
          step={1}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Vertical</span>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {paddingVertical}%
          </span>
        </div>
        <Slider
          value={[paddingVertical]}
          onValueChange={(value) => setPaddingVertical(Array.isArray(value) ? value[0] : value)}
          min={0}
          max={30}
          step={1}
        />
      </div>
    </div>
  );
}
