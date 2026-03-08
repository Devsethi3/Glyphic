import { useEditorStore } from "@/store/editor-store";
import { Switch } from "@/components/ui/switch";

export function DropCapToggle() {
  const dropCap = useEditorStore((s) => s.dropCap);
  const toggleDropCap = useEditorStore((s) => s.toggleDropCap);

  return (
    <div className="flex items-center justify-between">
      <label className="text-[11px] text-muted-foreground font-medium">
        Drop Cap
      </label>
      <Switch
        checked={dropCap}
        onCheckedChange={toggleDropCap}
        className="scale-90"
      />
    </div>
  );
}
