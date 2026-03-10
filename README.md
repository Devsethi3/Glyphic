<div align="center">
  <img src="public/logo.svg" alt="Glyphic Logo" width="80" height="80" />

# Glyphic

A browser based text design tool for creating typographic visuals.
<br />
Write content, customize styling, and export publication-ready images.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Site-black?style=for-the-badge)](https://glyphic.devsethi.site)
[![GitHub Stars](https://img.shields.io/github/stars/devsethi3/glyphic?style=for-the-badge&logo=github&color=yellow)](https://github.com/devsethi3/glyphic)

</div>

<!-- [Features](#-core-features) • [Quick Start](#-getting-started) • [Tech Stack](#-tech-stack) • [Contributing](#-contributing) • [License](#-license) -->

![Landing Page](/public/landing.png)

![Editor Page](/public/editor.png)

## Overview

Glyphic is a visual text editor that renders rich text onto a canvas with full typographic control. It's built for creating social media graphics, quote cards, and typographic designs without external design tools.

The editor provides real-time visual feedback as you type, and evaluates composition, readability, and visual hierarchy directly in the canvas.

## Problem Statement

Creating well-designed text visuals typically requires Photoshop or Figma, which involves:

- Context switching between writing and design tools
- Manual layout adjustments for different aspect ratios
- Iterative export cycles for social media formats
- No automated feedback on typographic quality

Glyphic solves this by combining a rich text editor with a canvas renderer and real-time design analysis, all in the browser.

## Core Features

**Text Editing**

- TipTap-based rich text editor with full formatting support
- Inline styles: bold, italic, underline, strikethrough
- Block types: headings (H1-H3), blockquotes, lists
- Text styling: color, highlight, super/subscript, small caps
- Custom font sizes at character level
- Multi-level bullet and ordered lists

**Canvas Rendering**

- Live preview with configurable aspect ratios (square, portrait, landscape, story)
- Typography controls: font family, line height, drop caps
- Background options: solid color, linear/radial gradients
- Paper texture overlay with adjustable grain intensity
- Padding controls for horizontal and vertical spacing
- Theme presets with one-click styling

**Export System**

- Export to PNG or SVG
- Quality levels: standard (2x), high (3x), ultra (4x)
- Theme override at export time
- Pixel-perfect rendering with high DPI support

## Architecture

Glyphic uses a client-side rendering pipeline:

1. **Editor Layer** (TipTap): Captures rich text input as HTML
2. **Parser Layer**: Converts HTML to structured block/span representation
3. **Layout Engine**: Measures text, calculates line breaks, handles wrapping
4. **Renderer**: Draws styled text onto HTML5 Canvas with 2D context

The canvas rendering is deterministic and resolution-independent, allowing high-quality exports at any scale factor.

## Tech Stack

**Frontend**

- React 19 with TypeScript
- Vite for build tooling
- TipTap (ProseMirror) for rich text editing
- Zustand for state management
- Tailwind CSS 4 for styling
- Radix UI primitives for accessible components

**Canvas Rendering**

- Native HTML5 Canvas API
- Custom text layout engine
- Manual line wrapping and text measurement
- Procedural paper texture generation

**Deployment**

- Static site hosting (Vercel/Netlify compatible)
- No backend required for core functionality
- Client-side rendering and export

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)

### Installation

````bash
# Clone the repository
git clone https://github.com/devsethi3/glyphic.git
cd glyphic

# Install dependencies
pnpm install

### Development

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint
pnpm lint
````

### Environment Variables

```env
VITE_SITE_URL=https://glyphic.devsethi.site  # Your deployment URL
```

**Key Files:**

- `src/engine/renderer.ts`: Core canvas rendering and text layout
- `src/store/editor-store.ts`: Global state management
- `src/components/editor/rich-text-editor.tsx`: TipTap editor setup
- `src/components/editor/editor-canvas.tsx`: Canvas component

## Contributing

Contributions are welcome. This is a side project, but PRs for bug fixes, features, or performance improvements are reviewed regularly.

**How to contribute:**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/your-feature`)
5. Open a Pull Request

**Contribution guidelines:**

- Keep code changes focused and scoped
- Maintain existing code style (Prettier/ESLint config)
- Add comments for non-obvious logic
- Test canvas rendering changes across resolutions

## Roadmap

**Short-term:**

- Custom font uploads
- Batch export for multiple aspect ratios
- Keyboard shortcuts panel

**Medium-term:**

- Vector shape layers (basic geometric primitives)
- Image layer support (background/overlay)
- Template library with starter designs
- Export presets (Instagram, Twitter, LinkedIn formats)

**Long-term:**

- Collaborative editing (real-time multiplayer)
- Animation timeline for text effects
- Plugin system for custom renderers

No timeline guarantees. Features ship when they're ready.

## License

MIT License

Copyright (c) 2026 Glyphic

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Credits

Built by [Dev Sethi](https://devsethi.site).

- Twitter: [@imsethidev](https://x.com/imsethidev)
- GitHub: [@devsethi3](https://github.com/devsethi3)

## Acknowledgments

- TipTap for the rich text editor
- ShadcnUI for components
- Hugeicons for iconography
