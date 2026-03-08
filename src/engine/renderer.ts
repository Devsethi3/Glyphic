import type { RenderConfig } from "@/types";
import { shapes } from "@/data/shapes";

// ============================================================
// FONT SIZE CONFIGURATION
// Adjust these values to control default canvas text sizes
// ============================================================
const FONT_CONFIG = {
  // Base font size multiplier relative to content width
  // Increase this value for larger text (e.g., 0.06 = 6% of content width)
  BASE_SIZE_RATIO: 0.055,

  // Maximum base font size in pixels (caps the size on very wide canvases)
  MAX_BASE_SIZE: 64,

  // Minimum base font size in pixels (ensures readability)
  MIN_BASE_SIZE: 18,

  // Heading scale multipliers (relative to base font size)
  HEADING1_SCALE: 1.8,
  HEADING2_SCALE: 1.45,
  HEADING3_SCALE: 1.25,

  // Blockquote scale (relative to base font size)
  BLOCKQUOTE_SCALE: 1.0,

  // Drop cap scale (relative to base font size)
  DROP_CAP_SCALE: 3.2,
};
// ============================================================

// Device pixel ratio for sharp rendering
const getPixelRatio = () => {
  return Math.min(window.devicePixelRatio || 1, 3);
};

// Inline style types
interface InlineSpan {
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
}

interface RichTextBlock {
  spans: InlineSpan[];
  type: "paragraph" | "heading1" | "heading2" | "heading3" | "blockquote";
  align: "left" | "center" | "right";
}

interface MeasuredLine {
  spans: InlineSpan[];
  width: number;
}

interface MeasuredRichBlock {
  block: RichTextBlock;
  lines: MeasuredLine[];
  lineHeight: number;
  fontSize: number;
  baseFontWeight: number;
  baseFontStyle: string;
  opacity: number;
  marginTop: number;
  marginBottom: number;
  totalHeight: number;
  isQuote: boolean;
  quoteIndent: number;
}

export function renderCanvas(
  canvas: HTMLCanvasElement,
  config: RenderConfig,
  scale: number = 1,
): void {
  const ctx = canvas.getContext("2d", {
    alpha: false,
  });
  if (!ctx) return;

  const shapeData = shapes[config.shape];
  const pixelRatio = getPixelRatio();

  const effectiveScale = scale > 1 ? scale : pixelRatio;

  const width = shapeData.width * effectiveScale;
  const height = shapeData.height * effectiveScale;

  canvas.width = width;
  canvas.height = height;

  if (scale <= 1) {
    canvas.style.width = `${shapeData.width}px`;
    canvas.style.height = `${shapeData.height}px`;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.scale(effectiveScale, effectiveScale);

  const baseWidth = shapeData.width;
  const baseHeight = shapeData.height;

  drawBackground(ctx, config, baseWidth, baseHeight);

  const paddingX = (config.paddingHorizontal / 100) * baseWidth;
  const paddingY = (config.paddingVertical / 100) * baseHeight;
  const contentWidth = baseWidth - paddingX * 2;
  const contentHeight = baseHeight - paddingY * 2;

  if (!config.text.trim()) {
    drawPlaceholder(ctx, config, baseWidth, baseHeight);
    return;
  }

  const blocks = parseHtmlToRichBlocks(config.htmlContent);

  renderRichTextBlocksCentered(
    ctx,
    blocks,
    config,
    paddingX,
    paddingY,
    contentWidth,
    contentHeight,
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
  const placeholderSize = Math.max(width * 0.028, 20);
  ctx.font = `italic ${placeholderSize}px "${config.fontFamily}", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Your styled text will appear here...", width / 2, height / 2);
  ctx.restore();
}

// ---- Rich HTML Parsing ----

function parseHtmlToRichBlocks(html: string): RichTextBlock[] {
  if (!html) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const blocks: RichTextBlock[] = [];

  const children = doc.body.childNodes;
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        blocks.push({
          spans: [
            {
              text,
              bold: false,
              italic: false,
              underline: false,
              strikethrough: false,
            },
          ],
          type: "paragraph",
          align: "left",
        });
      }
      continue;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const el = node as HTMLElement;
    const text = el.textContent?.trim() || "";
    if (!text) continue;

    const style = el.getAttribute("style") || "";
    const alignMatch = style.match(/text-align:\s*(left|center|right)/);
    const align = (alignMatch?.[1] || "left") as "left" | "center" | "right";

    let type: RichTextBlock["type"] = "paragraph";
    let sourceEl: HTMLElement = el;

    switch (el.tagName.toLowerCase()) {
      case "h1":
        type = "heading1";
        break;
      case "h2":
        type = "heading2";
        break;
      case "h3":
        type = "heading3";
        break;
      case "blockquote":
        type = "blockquote";
        const inner = el.querySelector("p");
        if (inner) sourceEl = inner;
        break;
      default:
        type = "paragraph";
    }

    const spans = extractInlineSpans(sourceEl);
    if (spans.length > 0) {
      blocks.push({ spans, type, align });
    }
  }

  return blocks;
}

function extractInlineSpans(el: HTMLElement): InlineSpan[] {
  const spans: InlineSpan[] = [];
  walkInlineNodes(
    el,
    { bold: false, italic: false, underline: false, strikethrough: false },
    spans,
  );
  return spans;
}

function walkInlineNodes(
  node: Node,
  inherited: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
  },
  spans: InlineSpan[],
): void {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || "";
    if (text.length > 0) {
      spans.push({
        text,
        bold: inherited.bold,
        italic: inherited.italic,
        underline: inherited.underline,
        strikethrough: inherited.strikethrough,
      });
    }
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();

  const current = { ...inherited };

  if (tag === "strong" || tag === "b") current.bold = true;
  if (tag === "em" || tag === "i") current.italic = true;
  if (tag === "u") current.underline = true;
  if (tag === "s" || tag === "del" || tag === "strike")
    current.strikethrough = true;

  const style = el.getAttribute("style") || "";
  if (
    style.includes("font-weight: bold") ||
    style.includes("font-weight:bold") ||
    style.includes("font-weight: 700") ||
    style.includes("font-weight:700")
  ) {
    current.bold = true;
  }
  if (
    style.includes("font-style: italic") ||
    style.includes("font-style:italic")
  ) {
    current.italic = true;
  }
  if (style.includes("text-decoration") && style.includes("underline")) {
    current.underline = true;
  }
  if (style.includes("text-decoration") && style.includes("line-through")) {
    current.strikethrough = true;
  }

  for (let i = 0; i < el.childNodes.length; i++) {
    walkInlineNodes(el.childNodes[i], current, spans);
  }
}

// ---- Font building ----

function buildFont(
  fontSize: number,
  fontFamily: string,
  baseFontWeight: number,
  baseFontStyle: string,
  span: InlineSpan,
): string {
  let weight = baseFontWeight;
  let style = baseFontStyle;

  if (span.bold) weight = Math.max(weight, 700);
  if (span.italic) style = "italic";

  return `${style} ${weight} ${fontSize}px "${fontFamily}", serif`;
}

// ---- Measuring and wrapping with inline spans ----

interface WordSpan {
  word: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  trailingSpace: boolean;
}

function flattenSpansToWords(spans: InlineSpan[]): WordSpan[] {
  const words: WordSpan[] = [];

  for (const span of spans) {
    const parts = span.text.split(/( +)/);
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part === "") continue;

      if (/^ +$/.test(part)) {
        if (words.length > 0) {
          words[words.length - 1].trailingSpace = true;
        }
      } else {
        words.push({
          word: part,
          bold: span.bold,
          italic: span.italic,
          underline: span.underline,
          strikethrough: span.strikethrough,
          trailingSpace: false,
        });
      }
    }
  }

  return words;
}

function wrapRichText(
  ctx: CanvasRenderingContext2D,
  spans: InlineSpan[],
  maxWidth: number,
  fontSize: number,
  fontFamily: string,
  baseFontWeight: number,
  baseFontStyle: string,
): MeasuredLine[] {
  const words = flattenSpansToWords(spans);
  if (words.length === 0) return [];

  const lines: MeasuredLine[] = [];
  let currentLineWords: WordSpan[] = [];
  let currentLineWidth = 0;

  ctx.font = buildFont(fontSize, fontFamily, baseFontWeight, baseFontStyle, {
    text: "",
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
  });
  const spaceWidth = ctx.measureText(" ").width;

  for (const wordSpan of words) {
    ctx.font = buildFont(
      fontSize,
      fontFamily,
      baseFontWeight,
      baseFontStyle,
      {
        text: wordSpan.word,
        bold: wordSpan.bold,
        italic: wordSpan.italic,
        underline: wordSpan.underline,
        strikethrough: wordSpan.strikethrough,
      },
    );
    const wordWidth = ctx.measureText(wordSpan.word).width;

    const widthWithWord =
      currentLineWidth +
      (currentLineWords.length > 0 ? spaceWidth : 0) +
      wordWidth;

    if (widthWithWord > maxWidth && currentLineWords.length > 0) {
      lines.push(
        buildMeasuredLine(
          ctx,
          currentLineWords,
          fontSize,
          fontFamily,
          baseFontWeight,
          baseFontStyle,
          spaceWidth,
        ),
      );
      currentLineWords = [wordSpan];
      currentLineWidth = wordWidth;
    } else {
      if (currentLineWords.length > 0) {
        currentLineWidth += spaceWidth;
      }
      currentLineWords.push(wordSpan);
      currentLineWidth += wordWidth;
    }
  }

  if (currentLineWords.length > 0) {
    lines.push(
      buildMeasuredLine(
        ctx,
        currentLineWords,
        fontSize,
        fontFamily,
        baseFontWeight,
        baseFontStyle,
        spaceWidth,
      ),
    );
  }

  return lines;
}

function buildMeasuredLine(
  ctx: CanvasRenderingContext2D,
  words: WordSpan[],
  fontSize: number,
  fontFamily: string,
  baseFontWeight: number,
  baseFontStyle: string,
  spaceWidth: number,
): MeasuredLine {
  const spans: InlineSpan[] = [];
  let totalWidth = 0;

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const prefix = i > 0 ? " " : "";
    const text = prefix + w.word;

    if (
      spans.length > 0 &&
      spans[spans.length - 1].bold === w.bold &&
      spans[spans.length - 1].italic === w.italic &&
      spans[spans.length - 1].underline === w.underline &&
      spans[spans.length - 1].strikethrough === w.strikethrough
    ) {
      spans[spans.length - 1].text += text;
    } else {
      spans.push({
        text,
        bold: w.bold,
        italic: w.italic,
        underline: w.underline,
        strikethrough: w.strikethrough,
      });
    }

    ctx.font = buildFont(
      fontSize,
      fontFamily,
      baseFontWeight,
      baseFontStyle,
      {
        text: w.word,
        bold: w.bold,
        italic: w.italic,
        underline: w.underline,
        strikethrough: w.strikethrough,
      },
    );
    totalWidth += ctx.measureText(w.word).width;
    if (i > 0) totalWidth += spaceWidth;
  }

  return { spans, width: totalWidth };
}

// ---- Size Calculation ----

function calculateBaseFontSize(shape: string, contentWidth: number): number {
  // ============================================================
  // ADJUST FONT_CONFIG at the top of this file to change sizes
  // Current: BASE_SIZE_RATIO = 0.055 means 5.5% of content width
  // For a 1080px square with 10% padding: contentWidth = 864px
  // Base font size = 864 * 0.055 = ~47px
  // ============================================================
  const baseSize = contentWidth * FONT_CONFIG.BASE_SIZE_RATIO;
  return Math.max(
    Math.min(baseSize, FONT_CONFIG.MAX_BASE_SIZE),
    FONT_CONFIG.MIN_BASE_SIZE,
  );
}

function getBlockStyles(
  type: RichTextBlock["type"],
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
        fontSize: baseFontSize * FONT_CONFIG.HEADING1_SCALE,
        fontWeight: 700,
        fontStyle: "normal",
        opacity: 1,
        marginTop: baseFontSize * 0.8,
        marginBottom: baseFontSize * 0.5,
      };
    case "heading2":
      return {
        fontSize: baseFontSize * FONT_CONFIG.HEADING2_SCALE,
        fontWeight: 600,
        fontStyle: "normal",
        opacity: 1,
        marginTop: baseFontSize * 0.7,
        marginBottom: baseFontSize * 0.4,
      };
    case "heading3":
      return {
        fontSize: baseFontSize * FONT_CONFIG.HEADING3_SCALE,
        fontWeight: 600,
        fontStyle: "normal",
        opacity: 1,
        marginTop: baseFontSize * 0.6,
        marginBottom: baseFontSize * 0.3,
      };
    case "blockquote":
      return {
        fontSize: baseFontSize * FONT_CONFIG.BLOCKQUOTE_SCALE,
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
        marginTop: baseFontSize * 0.15,
        marginBottom: baseFontSize * 0.35,
      };
  }
}

// ---- Rendering ----

function measureRichTextBlocks(
  ctx: CanvasRenderingContext2D,
  blocks: RichTextBlock[],
  config: RenderConfig,
  contentWidth: number,
): MeasuredRichBlock[] {
  const baseFontSize = calculateBaseFontSize(config.shape, contentWidth);
  const measuredBlocks: MeasuredRichBlock[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const styles = getBlockStyles(block.type, baseFontSize);
    const { fontSize, fontWeight, fontStyle, opacity, marginBottom } = styles;
    const marginTop = i === 0 ? 0 : styles.marginTop;

    const isQuote = block.type === "blockquote";
    const quoteIndent = isQuote ? 24 : 0;
    const effectiveWidth = contentWidth - quoteIndent;

    const lines = wrapRichText(
      ctx,
      block.spans,
      effectiveWidth,
      fontSize,
      config.fontFamily,
      fontWeight,
      fontStyle,
    );

    const lineHeight = fontSize * config.lineHeight;
    const textHeight = lines.length * lineHeight;
    const totalHeight = marginTop + textHeight + marginBottom;

    measuredBlocks.push({
      block,
      lines,
      lineHeight,
      fontSize,
      baseFontWeight: fontWeight,
      baseFontStyle: fontStyle,
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

function renderRichTextBlocksCentered(
  ctx: CanvasRenderingContext2D,
  blocks: RichTextBlock[],
  config: RenderConfig,
  paddingX: number,
  paddingY: number,
  contentWidth: number,
  contentHeight: number,
): void {
  const measuredBlocks = measureRichTextBlocks(
    ctx,
    blocks,
    config,
    contentWidth,
  );

  // Calculate total content height
  let totalTextHeight = 0;
  for (const mb of measuredBlocks) {
    totalTextHeight += mb.totalHeight;
  }

  // Handle drop cap height adjustment
  let dropCapExtraHeight = 0;
  if (
    config.dropCap &&
    measuredBlocks.length > 0 &&
    measuredBlocks[0].block.type === "paragraph"
  ) {
    const firstBlock = measuredBlocks[0];
    dropCapExtraHeight = firstBlock.lineHeight * 1.2;
    totalTextHeight += dropCapExtraHeight;
  }

  // Center vertically
  const verticalOffset = Math.max(0, (contentHeight - totalTextHeight) / 2);
  let currentY = paddingY + verticalOffset;
  let isFirstParagraph = true;

  for (const mb of measuredBlocks) {
    const {
      block,
      lines,
      lineHeight,
      fontSize,
      baseFontWeight,
      baseFontStyle,
      opacity,
      marginTop,
      marginBottom,
      isQuote,
      quoteIndent,
    } = mb;

    if (currentY > paddingY + contentHeight) break;

    currentY += marginTop;

    ctx.save();
    ctx.globalAlpha = opacity;

    // Handle drop cap for first paragraph
    if (
      config.dropCap &&
      isFirstParagraph &&
      block.type === "paragraph" &&
      block.spans.length > 0
    ) {
      const allText = block.spans.map((s) => s.text).join("");
      if (allText.length > 1) {
        currentY = renderDropCapRich(
          ctx,
          block,
          config,
          paddingX,
          currentY,
          contentWidth,
          fontSize,
          lineHeight,
          baseFontWeight,
          baseFontStyle,
        );
        isFirstParagraph = false;
        ctx.restore();
        currentY += marginBottom;
        continue;
      }
    }

    // Render each line with inline formatting
    const blockStartY = currentY;
    for (const line of lines) {
      if (currentY > paddingY + contentHeight) break;

      const effectiveWidth = contentWidth - quoteIndent;
      let lineX: number;

      switch (block.align) {
        case "center":
          lineX = paddingX + quoteIndent + (effectiveWidth - line.width) / 2;
          break;
        case "right":
          lineX = paddingX + quoteIndent + effectiveWidth - line.width;
          break;
        default:
          lineX = paddingX + quoteIndent;
      }

      // Draw each span in the line
      let spanX = lineX;
      for (const span of line.spans) {
        const font = buildFont(
          fontSize,
          config.fontFamily,
          baseFontWeight,
          baseFontStyle,
          span,
        );
        ctx.font = font;
        ctx.fillStyle = config.textColor;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        ctx.fillText(span.text, spanX, currentY);

        const spanWidth = ctx.measureText(span.text).width;

        // Draw underline
        if (span.underline) {
          const underlineY = currentY + fontSize * 1.1;
          ctx.save();
          ctx.strokeStyle = config.textColor;
          ctx.globalAlpha = opacity;
          ctx.lineWidth = Math.max(1, fontSize * 0.055);
          ctx.beginPath();
          ctx.moveTo(spanX, underlineY);
          ctx.lineTo(spanX + spanWidth, underlineY);
          ctx.stroke();
          ctx.restore();
        }

        // Draw strikethrough
        if (span.strikethrough) {
          const strikeY = currentY + fontSize * 0.55;
          ctx.save();
          ctx.strokeStyle = config.textColor;
          ctx.globalAlpha = opacity;
          ctx.lineWidth = Math.max(1, fontSize * 0.055);
          ctx.beginPath();
          ctx.moveTo(spanX, strikeY);
          ctx.lineTo(spanX + spanWidth, strikeY);
          ctx.stroke();
          ctx.restore();
        }

        spanX += spanWidth;
      }

      currentY += lineHeight;
    }

    // Draw blockquote bar
    if (isQuote && lines.length > 0) {
      const barX = paddingX + 6;
      const barHeight = lines.length * lineHeight;
      ctx.fillStyle = config.textColor;
      ctx.globalAlpha = 0.3;
      const barWidth = 3;
      const radius = 1.5;
      ctx.beginPath();
      ctx.roundRect(barX, blockStartY, barWidth, barHeight, radius);
      ctx.fill();
    }

    ctx.restore();

    if (block.type === "paragraph") {
      isFirstParagraph = false;
    }

    currentY += marginBottom;
  }
}

function renderDropCapRich(
  ctx: CanvasRenderingContext2D,
  block: RichTextBlock,
  config: RenderConfig,
  paddingX: number,
  startY: number,
  contentWidth: number,
  fontSize: number,
  lineHeight: number,
  baseFontWeight: number,
  baseFontStyle: string,
): number {
  const allText = block.spans.map((s) => s.text).join("");
  const dropCapSize = fontSize * FONT_CONFIG.DROP_CAP_SCALE;
  const firstChar = allText[0].toUpperCase();
  const restText = allText.slice(1);

  ctx.save();

  // Measure drop cap
  ctx.font = `700 ${dropCapSize}px "${config.fontFamily}", serif`;
  const dropCapMetrics = ctx.measureText(firstChar);
  const dropCapWidth = dropCapMetrics.width + fontSize * 0.4;
  const dropCapHeight = dropCapSize * 0.85;
  const dropCapLines = Math.ceil(dropCapHeight / lineHeight);

  // Draw drop cap
  ctx.fillStyle = config.textColor;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(firstChar, paddingX, startY);

  // Render rest of text
  ctx.font = buildFont(
    fontSize,
    config.fontFamily,
    baseFontWeight,
    baseFontStyle,
    {
      text: "",
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
    },
  );

  const indentedWidth = contentWidth - dropCapWidth;
  const normalWidth = contentWidth;

  let currentY = startY;
  let textRemaining = restText;
  let lineCount = 0;

  while (textRemaining.length > 0) {
    const isIndented = lineCount < dropCapLines;
    const width = isIndented ? indentedWidth : normalWidth;
    const x = isIndented ? paddingX + dropCapWidth : paddingX;

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

    ctx.fillStyle = config.textColor;
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

    if (lineCount > 100) break;
  }

  ctx.restore();
  return currentY;
}

export function exportCanvas(
  config: RenderConfig,
  quality: "standard" | "high" | "ultra",
  format: "png" | "svg",
): void {
  const scaleMap = { standard: 2, high: 3, ultra: 4 };
  const scale = scaleMap[quality];

  const offscreen = document.createElement("canvas");
  const shapeData = shapes[config.shape];

  offscreen.width = shapeData.width * scale;
  offscreen.height = shapeData.height * scale;

  const ctx = offscreen.getContext("2d", { alpha: false });
  if (!ctx) return;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.scale(scale, scale);

  drawBackground(ctx, config, shapeData.width, shapeData.height);

  const paddingX = (config.paddingHorizontal / 100) * shapeData.width;
  const paddingY = (config.paddingVertical / 100) * shapeData.height;
  const contentWidth = shapeData.width - paddingX * 2;
  const contentHeight = shapeData.height - paddingY * 2;

  if (!config.text.trim()) {
    drawPlaceholder(ctx, config, shapeData.width, shapeData.height);
  } else {
    const blocks = parseHtmlToRichBlocks(config.htmlContent);
    renderRichTextBlocksCentered(
      ctx,
      blocks,
      config,
      paddingX,
      paddingY,
      contentWidth,
      contentHeight,
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
