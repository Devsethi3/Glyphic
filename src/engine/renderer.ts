// src/engine/renderer.ts
import type { RenderConfig, TextBlock } from "@/types";
import { shapes } from "@/data/shapes";

// Device pixel ratio for sharp rendering
const getPixelRatio = () => {
  return Math.min(window.devicePixelRatio || 1, 3);
};

export function renderCanvas(
  canvas: HTMLCanvasElement,
  config: RenderConfig,
  scale: number = 1,
): void {
  const ctx = canvas.getContext("2d", {
    alpha: false,
    desynchronized: true,
  });
  if (!ctx) return;

  const shapeData = shapes[config.shape];
  const pixelRatio = getPixelRatio();

  // For preview, use pixel ratio for sharpness
  // For export, use the provided scale
  const effectiveScale = scale > 1 ? scale : pixelRatio;

  const width = shapeData.width * effectiveScale;
  const height = shapeData.height * effectiveScale;

  // Set actual canvas dimensions (high resolution)
  canvas.width = width;
  canvas.height = height;

  // Set display size via CSS (scaled down for preview)
  if (scale <= 1) {
    canvas.style.width = `${shapeData.width}px`;
    canvas.style.height = `${shapeData.height}px`;
  }

  // Enable high-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Scale context for high DPI
  ctx.scale(effectiveScale, effectiveScale);

  // Use base dimensions for all calculations (unscaled)
  const baseWidth = shapeData.width;
  const baseHeight = shapeData.height;

  // Draw background
  drawBackground(ctx, config, baseWidth, baseHeight);

  // Calculate padding
  const paddingX = (config.paddingHorizontal / 100) * baseWidth;
  const paddingY = (config.paddingVertical / 100) * baseHeight;
  const contentWidth = baseWidth - paddingX * 2;
  const contentHeight = baseHeight - paddingY * 2;

  // If no text, draw placeholder
  if (!config.text.trim()) {
    drawPlaceholder(ctx, config, baseWidth, baseHeight);
    return;
  }

  // Parse HTML content into blocks
  const blocks = parseHtmlContent(config.htmlContent);

  // Render text blocks with vertical centering
  renderTextBlocksCentered(
    ctx,
    blocks,
    config,
    paddingX,
    paddingY,
    contentWidth,
    contentHeight,
    baseWidth,
    baseHeight,
  );
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  config: RenderConfig,
  width: number,
  height: number,
): void {
  if (config.backgroundType === "solid") {
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, width, height);
  } else if (
    config.backgroundType === "linear-gradient" &&
    config.gradientColors.length >= 2
  ) {
    const angle = (config.gradientAngle * Math.PI) / 180;
    const centerX = width / 2;
    const centerY = height / 2;
    const length = Math.sqrt(width * width + height * height);

    const x1 = centerX - (Math.cos(angle) * length) / 2;
    const y1 = centerY - (Math.sin(angle) * length) / 2;
    const x2 = centerX + (Math.cos(angle) * length) / 2;
    const y2 = centerY + (Math.sin(angle) * length) / 2;

    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    config.gradientColors.forEach((color, i) => {
      gradient.addColorStop(i / (config.gradientColors.length - 1), color);
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  } else if (
    config.backgroundType === "radial-gradient" &&
    config.gradientColors.length >= 2
  ) {
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height) / 2,
    );
    config.gradientColors.forEach((color, i) => {
      gradient.addColorStop(i / (config.gradientColors.length - 1), color);
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }
}

function drawPlaceholder(
  ctx: CanvasRenderingContext2D,
  config: RenderConfig,
  width: number,
  height: number,
): void {
  ctx.save();
  ctx.fillStyle = config.textColor;
  ctx.globalAlpha = 0.25;
  ctx.font = `italic 24px "${config.fontFamily}", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Your styled text will appear here...", width / 2, height / 2);
  ctx.restore();
}

function parseHtmlContent(html: string): TextBlock[] {
  if (!html) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const blocks: TextBlock[] = [];

  const children = doc.body.children;
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    const text = el.textContent?.trim() || "";
    if (!text) continue;

    const style = el.getAttribute("style") || "";
    const alignMatch = style.match(/text-align:\s*(left|center|right)/);
    const align = (alignMatch?.[1] || "left") as "left" | "center" | "right";

    switch (el.tagName.toLowerCase()) {
      case "h1":
        blocks.push({ text, type: "heading1", align });
        break;
      case "h2":
        blocks.push({ text, type: "heading2", align });
        break;
      case "h3":
        blocks.push({ text, type: "heading3", align });
        break;
      case "blockquote":
        blocks.push({ text, type: "blockquote", align });
        break;
      default:
        blocks.push({ text, type: "paragraph", align });
    }
  }

  return blocks;
}

interface MeasuredBlock {
  block: TextBlock;
  lines: string[];
  lineHeight: number;
  fontSize: number;
  fontWeight: number;
  fontStyle: string;
  opacity: number;
  marginTop: number;
  marginBottom: number;
  totalHeight: number;
  isQuote: boolean;
  quoteIndent: number;
}

function measureTextBlocks(
  ctx: CanvasRenderingContext2D,
  blocks: TextBlock[],
  config: RenderConfig,
  contentWidth: number,
): MeasuredBlock[] {
  const baseFontSize = calculateBaseFontSize(config.shape, contentWidth);
  const measuredBlocks: MeasuredBlock[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const styles = getBlockStyles(block.type, baseFontSize);
    const { fontSize, fontWeight, fontStyle, opacity, marginBottom } = styles;

    // Only add marginTop if not the first block
    const marginTop = i === 0 ? 0 : styles.marginTop;

    const isQuote = block.type === "blockquote";
    const quoteIndent = isQuote ? 20 : 0;
    const effectiveWidth = contentWidth - quoteIndent;

    // Set font for accurate measurement
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${config.fontFamily}", serif`;

    const lines = wrapText(ctx, block.text, effectiveWidth);
    const lineHeight = fontSize * config.lineHeight;

    // Calculate total height for this block
    const textHeight = lines.length * lineHeight;
    const totalHeight = marginTop + textHeight + marginBottom;

    measuredBlocks.push({
      block,
      lines,
      lineHeight,
      fontSize,
      fontWeight,
      fontStyle,
      opacity,
      marginTop,
      marginBottom,
      totalHeight,
      isQuote,
      quoteIndent,
    });
  }

  return measuredBlocks;
}

function calculateBaseFontSize(shape: string, contentWidth: number): number {
  // Base font size relative to content width for consistent appearance
  // This ensures text doesn't stretch or compress based on aspect ratio
  const baseSize = Math.min(contentWidth * 0.045, 28);
  return Math.max(baseSize, 16); // Minimum 16px for readability
}

function renderTextBlocksCentered(
  ctx: CanvasRenderingContext2D,
  blocks: TextBlock[],
  config: RenderConfig,
  paddingX: number,
  paddingY: number,
  contentWidth: number,
  contentHeight: number,
  canvasWidth: number,
  canvasHeight: number,
): void {
  // First, measure all blocks to calculate total height
  const measuredBlocks = measureTextBlocks(ctx, blocks, config, contentWidth);

  // Calculate total content height
  let totalTextHeight = 0;
  for (const mb of measuredBlocks) {
    totalTextHeight += mb.totalHeight;
  }

  // Handle drop cap measurement adjustment
  let dropCapAdjustment = 0;
  if (
    config.dropCap &&
    measuredBlocks.length > 0 &&
    measuredBlocks[0].block.type === "paragraph"
  ) {
    const firstBlock = measuredBlocks[0];
    // Drop cap adds approximately 2 extra line heights
    dropCapAdjustment = firstBlock.lineHeight * 1.5;
    totalTextHeight += dropCapAdjustment;
  }

  // Calculate vertical offset to center content
  const verticalOffset = Math.max(0, (contentHeight - totalTextHeight) / 2);

  // Start position
  let currentY = paddingY + verticalOffset;
  let isFirstParagraph = true;

  for (const mb of measuredBlocks) {
    const {
      block,
      lines,
      lineHeight,
      fontSize,
      fontWeight,
      fontStyle,
      opacity,
      marginTop,
      marginBottom,
      isQuote,
      quoteIndent,
    } = mb;

    // Check if we've exceeded content area
    if (currentY > paddingY + contentHeight) break;

    currentY += marginTop;

    ctx.save();
    ctx.fillStyle = config.textColor;
    ctx.globalAlpha = opacity;
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${config.fontFamily}", serif`;
    ctx.textBaseline = "top";

    // Handle drop cap for first paragraph
    if (
      config.dropCap &&
      isFirstParagraph &&
      block.type === "paragraph" &&
      block.text.length > 1
    ) {
      currentY = renderDropCap(
        ctx,
        block,
        config,
        paddingX,
        currentY,
        contentWidth,
        fontSize,
        lineHeight,
      );
      isFirstParagraph = false;
      ctx.restore();
      currentY += marginBottom;
      continue;
    }

    // Render each line
    const blockStartY = currentY;
    for (const line of lines) {
      if (currentY > paddingY + contentHeight) break;

      let x: number;
      const effectiveWidth = contentWidth - quoteIndent;

      switch (block.align) {
        case "center":
          ctx.textAlign = "center";
          x = paddingX + quoteIndent + effectiveWidth / 2;
          break;
        case "right":
          ctx.textAlign = "right";
          x = paddingX + contentWidth;
          break;
        default:
          ctx.textAlign = "left";
          x = paddingX + quoteIndent;
      }

      ctx.fillText(line, x, currentY);
      currentY += lineHeight;
    }

    // Draw blockquote bar
    if (isQuote && lines.length > 0) {
      const barX = paddingX + 6;
      const barHeight = lines.length * lineHeight;
      ctx.fillStyle = config.textColor;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(barX, blockStartY, 3, barHeight);
    }

    ctx.restore();

    if (block.type === "paragraph") {
      isFirstParagraph = false;
    }

    currentY += marginBottom;
  }
}

function renderDropCap(
  ctx: CanvasRenderingContext2D,
  block: TextBlock,
  config: RenderConfig,
  paddingX: number,
  startY: number,
  contentWidth: number,
  fontSize: number,
  lineHeight: number,
): number {
  const dropCapSize = fontSize * 3.2;
  const firstChar = block.text[0].toUpperCase();
  const restText = block.text.slice(1);

  ctx.save();

  // Measure drop cap
  ctx.font = `700 ${dropCapSize}px "${config.fontFamily}", serif`;
  const dropCapMetrics = ctx.measureText(firstChar);
  const dropCapWidth = dropCapMetrics.width + 12;
  const dropCapHeight = dropCapSize * 0.85; // Approximate cap height
  const dropCapLines = Math.ceil(dropCapHeight / lineHeight);

  // Draw drop cap
  ctx.fillStyle = config.textColor;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(firstChar, paddingX, startY);

  // Render rest of text with indent around drop cap
  ctx.font = `400 ${fontSize}px "${config.fontFamily}", serif`;

  const indentedWidth = contentWidth - dropCapWidth;
  const normalWidth = contentWidth;

  let currentY = startY;
  let textRemaining = restText;
  let lineCount = 0;

  while (textRemaining.length > 0) {
    const isIndented = lineCount < dropCapLines;
    const width = isIndented ? indentedWidth : normalWidth;
    const x = isIndented ? paddingX + dropCapWidth : paddingX;

    // Word wrap for current line
    const words = textRemaining.split(" ");
    let line = "";
    let wordIndex = 0;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + (line ? " " : "") + words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > width && line) {
        break;
      }
      line = testLine;
      wordIndex = i + 1;
    }

    // Draw the line
    if (block.align === "center" && !isIndented) {
      ctx.textAlign = "center";
      ctx.fillText(line, x + width / 2, currentY);
    } else if (block.align === "right" && !isIndented) {
      ctx.textAlign = "right";
      ctx.fillText(line, x + width, currentY);
    } else {
      ctx.textAlign = "left";
      ctx.fillText(line, x, currentY);
    }

    textRemaining = words.slice(wordIndex).join(" ").trim();
    currentY += lineHeight;
    lineCount++;

    // Safety check to prevent infinite loops
    if (lineCount > 100) break;
  }

  ctx.restore();
  return currentY;
}

function getBlockStyles(
  type: TextBlock["type"],
  baseFontSize: number,
): {
  fontSize: number;
  fontWeight: number;
  fontStyle: string;
  opacity: number;
  marginTop: number;
  marginBottom: number;
} {
  switch (type) {
    case "heading1":
      return {
        fontSize: baseFontSize * 1.75,
        fontWeight: 700,
        fontStyle: "normal",
        opacity: 1,
        marginTop: baseFontSize * 0.8,
        marginBottom: baseFontSize * 0.5,
      };
    case "heading2":
      return {
        fontSize: baseFontSize * 1.4,
        fontWeight: 600,
        fontStyle: "normal",
        opacity: 1,
        marginTop: baseFontSize * 0.7,
        marginBottom: baseFontSize * 0.4,
      };
    case "heading3":
      return {
        fontSize: baseFontSize * 1.2,
        fontWeight: 600,
        fontStyle: "normal",
        opacity: 1,
        marginTop: baseFontSize * 0.6,
        marginBottom: baseFontSize * 0.3,
      };
    case "blockquote":
      return {
        fontSize: baseFontSize,
        fontWeight: 400,
        fontStyle: "italic",
        opacity: 0.85,
        marginTop: baseFontSize * 0.5,
        marginBottom: baseFontSize * 0.5,
      };
    default:
      return {
        fontSize: baseFontSize,
        fontWeight: 400,
        fontStyle: "normal",
        opacity: 1,
        marginTop: baseFontSize * 0.2,
        marginBottom: baseFontSize * 0.4,
      };
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine + (currentLine ? " " : "") + word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export function exportCanvas(
  config: RenderConfig,
  quality: "standard" | "high" | "ultra",
  format: "png" | "svg",
): void {
  const scaleMap = { standard: 2, high: 3, ultra: 4 };
  const scale = scaleMap[quality];

  // Create offscreen canvas for export
  const offscreen = document.createElement("canvas");
  const shapeData = shapes[config.shape];

  // Set high-resolution dimensions
  offscreen.width = shapeData.width * scale;
  offscreen.height = shapeData.height * scale;

  const ctx = offscreen.getContext("2d", { alpha: false });
  if (!ctx) return;

  // Enable high-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Scale for export resolution
  ctx.scale(scale, scale);

  // Draw background
  drawBackground(ctx, config, shapeData.width, shapeData.height);

  // Calculate padding
  const paddingX = (config.paddingHorizontal / 100) * shapeData.width;
  const paddingY = (config.paddingVertical / 100) * shapeData.height;
  const contentWidth = shapeData.width - paddingX * 2;
  const contentHeight = shapeData.height - paddingY * 2;

  // If no text, draw placeholder
  if (!config.text.trim()) {
    drawPlaceholder(ctx, config, shapeData.width, shapeData.height);
  } else {
    // Parse and render text
    const blocks = parseHtmlContent(config.htmlContent);
    renderTextBlocksCentered(
      ctx,
      blocks,
      config,
      paddingX,
      paddingY,
      contentWidth,
      contentHeight,
      shapeData.width,
      shapeData.height,
    );
  }

  if (format === "png") {
    offscreen.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `glyphic-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
      "image/png",
      1.0,
    );
  } else {
    const dataUrl = offscreen.toDataURL("image/png", 1.0);
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     width="${shapeData.width * scale}" height="${shapeData.height * scale}" 
     viewBox="0 0 ${shapeData.width * scale} ${shapeData.height * scale}">
  <image xlink:href="${dataUrl}" width="${shapeData.width * scale}" height="${shapeData.height * scale}"/>
</svg>`;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `glyphic-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
