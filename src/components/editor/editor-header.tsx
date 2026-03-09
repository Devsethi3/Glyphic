// src/components/editor/editor-header.tsx
import { Link } from "react-router-dom";
import { ShapeSelector } from "./header/shape-selector";
import { ThemeSelector } from "./header/theme-selector";
import { ExportDialog } from "./header/export-dialog";
import { useMediaQuery } from "@/hooks/use-media-query";

export function EditorHeader() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <header className="flex items-center justify-between px-3 sm:px-4 h-12 border-b border-border shrink-0 bg-background">
      <Link
        to="/"
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <img src="/logo.svg" alt="Glyphic" className="size-4" />
        <span className="text-sm font-medium bg-linear-to-b from-foreground to-foreground/70 bg-clip-text text-transparent dark:from-foreground dark:to-foreground/40">
          Glyphic
        </span>
      </Link>

      {isDesktop ? (
        <div className="flex items-center gap-1 sm:gap-1.5">
          <ShapeSelector />
          <ThemeSelector />
          <div className="w-px h-5 bg-border mx-0.5 sm:mx-1" />
          <ExportDialog />
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <ShapeSelector />
          <ThemeSelector />
        </div>
      )}
    </header>
  );
}
