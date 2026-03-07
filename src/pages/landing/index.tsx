// src/pages/landing/index.tsx
import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PencilEdit02Icon,
  ArrowRight01Icon,
  TextIcon,
  PaintBrush01Icon,
  ImageDownloadIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: TextIcon,
    title: "Write",
    description: "Rich text editor",
  },
  {
    icon: PaintBrush01Icon,
    title: "Style",
    description: "16+ themes",
  },
  {
    icon: ImageDownloadIcon,
    title: "Export",
    description: "PNG & SVG",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 h-14 border-b border-border">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={PencilEdit02Icon} size={18} />
          <span className="text-sm font-semibold tracking-tight">Glyphic</span>
        </div>
        <Button variant="ghost" size="sm">
          <Link to="/editor">Open Editor</Link>
        </Button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/50 text-xs">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Open Source
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Turn words into
            </h1>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-muted-foreground">
              beautiful images
            </h1>
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            A minimalist text-to-image tool. Write, style, and export stunning
            typographic images in seconds.
          </p>

          {/* CTA */}
          <Button size="lg" className="gap-2">
            <Link to="/editor">
              Open Editor
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            </Link>
          </Button>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-4 rounded-xl border border-border/50 bg-card/50"
              >
                <HugeiconsIcon
                  icon={feature.icon}
                  size={20}
                  className="text-muted-foreground mb-3"
                />
                <h3 className="font-medium text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between px-6 py-4 border-t border-border text-xs text-muted-foreground">
        <span>Built with care. Open source.</span>
        <span>Glyphic © 2025</span>
      </footer>
    </div>
  );
}
