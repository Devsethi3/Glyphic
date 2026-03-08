import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { ShapeSelector } from "./header/shape-selector";
import { ThemeSelector } from "./header/theme-selector";
import { ExportDialog } from "./header/export-dialog";

export function EditorHeader() {
  return (
    <header className="flex items-center justify-between px-3 sm:px-4 h-12 border-b border-border shrink-0">
      <Link
        to="/"
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <HugeiconsIcon icon={PencilEdit02Icon} size={18} />
        <span className="text-sm font-semibold tracking-tight hidden sm:inline">
          Glyphic
        </span>
      </Link>

      <div className="flex items-center gap-1 sm:gap-1.5">
        <ShapeSelector />
        <ThemeSelector />
        <div className="w-px h-5 bg-border mx-0.5 sm:mx-1 hidden sm:block" />
        <ExportDialog />
      </div>
    </header>
  );
}
