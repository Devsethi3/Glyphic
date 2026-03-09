import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  TextIcon,
  PaintBrush01Icon,
  ImageDownloadIcon,
  GithubIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import GrainyShader from "@/components/grainy-background";

const features = [
  {
    icon: TextIcon,
    title: "Write",
    description:
      "A distraction-free rich text editor with floating formatting — just write.",
  },
  {
    icon: PaintBrush01Icon,
    title: "Style",
    description:
      "16+ handcrafted themes with custom fonts, colors, and typography controls.",
  },
  {
    icon: ImageDownloadIcon,
    title: "Export",
    description:
      "One-click export to high-resolution PNG or SVG. Gallery-ready in seconds.",
  },
];

export function LandingPage() {
  return (
    <GrainyShader className="min-h-screen">
      <div className="min-h-screen max-w-5xl mx-auto flex flex-col">
        <header className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Glyphic" className="size-4" />
            <span className="text-sm font-medium bg-linear-to-b from-foreground to-foreground/70 bg-clip-text text-transparent dark:from-foreground dark:to-foreground/40">
              Glyphic
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link to="/editor">Open Editor</Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 flex flex-col justify-center px-6 py-16 sm:py-24">
          <div className="max-w-4xl space-y-6 sm:space-y-8">
            <span className="inline-flex items-center gap-1 rounded-md border border-primary/10 bg-primary/5 px-3 py-1 text-[10px] font-medium text-foreground/80">
              Open Source <span className="hidden md:inline">| Free Forever</span>
            </span>

            <div className="space-y-2">
              <h1 className="font-instrument text-5xl sm:text-6xl md:text-7xl lg:text-8xl bg-linear-to-b from-foreground to-foreground/70 bg-clip-text text-transparent dark:from-foreground dark:to-foreground/40">
                Craft words
              </h1>
              <h2 className="font-instrument text-5xl sm:text-6xl md:text-7xl lg:text-8xl bg-linear-to-b from-foreground to-foreground/70 bg-clip-text text-transparent dark:from-foreground dark:to-foreground/40 pb-2">
                worth framing.
              </h2>
            </div>

            <p className="lg:text-base text-sm text-muted-foreground max-w-lg leading-relaxed">
              A minimalist tool for writers and designers. Write with a rich
              editor, style with beautiful themes, and export stunning
              typographic images all in your browser.
            </p>

            <div className="flex items-start gap-3 pt-2">
              <Button size="lg" asChild className="group">
                <Link to="/editor" className="gap-2">
                  Start Creating
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <a
                  href="https://github.com/Devsethi3/Glyphic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <HugeiconsIcon icon={GithubIcon} size={16} />
                  View on GitHub
                </a>
              </Button>
            </div>
          </div>


          <div className="mt-16 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-muted-foreground/60">
            <div className="flex items-center gap-3">
              {/* <div className="flex -space-x-1.5">
                {["🟣", "🔵", "🟢", "🟡"].map((dot, i) => (
                  <div
                    key={i}
                    className="size-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px]"
                  >
                    {dot}
                  </div>
                ))}
              </div> */}
              <span>No sign-up. No watermarks. No catch.</span>
            </div>
            <span className="hidden sm:inline text-muted-foreground/30">·</span>
            <span>Everything runs locally in your browser.</span>
          </div>
        </main>
      </div>
    </GrainyShader>
  );
}
