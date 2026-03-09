// src/engine/renderer.ts
import type { RenderConfig } from "@/types";
import { shapes } from "@/data/shapes";

// ============================================================
// FONT SIZE CONFIGURATION
// ============================================================
const FONT_CONFIG = {
  BASE_SIZE_RATIO: 0.055,
  MAX_BASE_SIZE: 64,
  MIN_BASE_SIZE: 18,
  HEADING1_SCALE: 1.8,
  HEADING2_SCALE: 1.45,
  HEADING3_SCALE: 1.25,
  BLOCKQUOTE_SCALE: 1.0,
  DROP_CAP_SCALE: 3.2,
};
// ============================================================

const getPixelRatio = () => Math.min(window.devicePixelRatio || 1, 3);

// ---- Types ----

interface InlineSpan {
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  color: string | null;
  opacity: number;
  highlight: string | null;
  superscript: boolean;
  subscript: boolean;
  smallCaps: boolean;
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
  baseOpacity: number;
  marginTop: number;
  marginBottom: number;
  totalHeight: number;
  isQuote: boolean;
  quoteIndent: number;
}

interface WordSpan {
  word: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  color: string | null;
  opacity: number;
  highlight: string | null;
  superscript: boolean;
  subscript: boolean;
  smallCaps: boolean;
  trailingSpace?: boolean;
}

// ---- Main Render ----

export function renderCanvas(
  canvas: HTMLCanvasElement,
  config: RenderConfig,
  scale: number = 1,
): void {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;

  const shapeData = shapes[config.shape];
  const pixelRatio = getPixelRatio();
  const effectiveScale = scale > 1 ? scale : pixelRatio;

  canvas.width = shapeData.width * effectiveScale;
  canvas.height = shapeData.height * effectiveScale;

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

// ---- Background ----

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
    const cx = width / 2;
    const cy = height / 2;
    const len = Math.sqrt(width * width + height * height);
    const gradient = ctx.createLinearGradient(
      cx - (Math.cos(angle) * len) / 2,
      cy - (Math.sin(angle) * len) / 2,
      cx + (Math.cos(angle) * len) / 2,
      cy + (Math.sin(angle) * len) / 2,
    );
    config.gradientColors.forEach((c, i) => {
      gradient.addColorStop(i / (config.gradientColors.length - 1), c);
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
    config.gradientColors.forEach((c, i) => {
      gradient.addColorStop(i / (config.gradientColors.length - 1), c);
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
  const size = Math.max(width * 0.028, 20);
  ctx.font = `italic ${size}px "${config.fontFamily}", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Your styled text will appear here...", width / 2, height / 2);
  ctx.restore();
}

// ---- HTML Parsing ----

const DEFAULT_SPAN: Omit<InlineSpan, "text"> = {
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  color: null,
  opacity: 1,
  highlight: null,
  superscript: false,
  subscript: false,
  smallCaps: false,
};

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
          spans: [{ ...DEFAULT_SPAN, text }],
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
  walkInlineNodes(el, { ...DEFAULT_SPAN, text: "" }, spans);
  return spans;
}

function walkInlineNodes(
  node: Node,
  inherited: InlineSpan,
  spans: InlineSpan[],
): void {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || "";
    if (text.length > 0) {
      spans.push({ ...inherited, text });
    }
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();

  const current: InlineSpan = { ...inherited, text: "" };

  // Tag-based formatting
  if (tag === "strong" || tag === "b") current.bold = true;
  if (tag === "em" || tag === "i") current.italic = true;
  if (tag === "u") current.underline = true;
  if (tag === "s" || tag === "del" || tag === "strike")
    current.strikethrough = true;
  if (tag === "sub") current.subscript = true;
  if (tag === "sup") current.superscript = true;

  // Handle <mark> for highlights
  if (tag === "mark") {
    const bgColor =
      el.getAttribute("data-color") ||
      el.style.backgroundColor ||
      el.getAttribute("style")?.match(/background-color:\s*([^;]+)/)?.[1] ||
      null;
    if (bgColor) current.highlight = bgColor.trim();
  }

  // Style-based formatting
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

  // Color from style (TipTap uses style="color: #xxx")
  const colorMatch = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/);
  if (colorMatch) {
    current.color = colorMatch[1].trim();
  }

  // Opacity from style
  const opacityMatch = style.match(/(?:^|;)\s*opacity\s*:\s*([^;]+)/);
  if (opacityMatch) {
    const val = parseFloat(opacityMatch[1].trim());
    if (!isNaN(val)) current.opacity = val;
  }

  // Font-variant for small caps
  if (
    style.includes("font-variant: small-caps") ||
    style.includes("font-variant:small-caps")
  ) {
    current.smallCaps = true;
  }

  // Background color from span style (for highlights applied via style)
  const bgMatch = style.match(/background-color\s*:\s*([^;]+)/);
  if (bgMatch && tag !== "mark") {
    current.highlight = bgMatch[1].trim();
  }

  for (let i = 0; i < el.childNodes.length; i++) {
    walkInlineNodes(el.childNodes[i], current, spans);
  }
}

// ---- Font Building ----

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

// ---- Text Wrapping ----

function flattenSpansToWords(spans: InlineSpan[]): WordSpan[] {
  const words: WordSpan[] = [];

  for (const span of spans) {
    const parts = span.text.split(/( +)/);
    for (const part of parts) {
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
          color: span.color,
          opacity: span.opacity,
          highlight: span.highlight,
          superscript: span.superscript,
          subscript: span.subscript,
          smallCaps: span.smallCaps,
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
    ...DEFAULT_SPAN,
    text: "",
  });
  const spaceWidth = ctx.measureText(" ").width;

  for (const wordSpan of words) {
    const spanFontSize =
      wordSpan.superscript || wordSpan.subscript ? fontSize * 0.7 : fontSize;
    const displayText = wordSpan.smallCaps
      ? wordSpan.word.toUpperCase()
      : wordSpan.word;

    ctx.font = buildFont(
      spanFontSize,
      fontFamily,
      baseFontWeight,
      baseFontStyle,
      wordSpan as unknown as InlineSpan,
    );
    const wordWidth = ctx.measureText(displayText).width;

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

function wordSpanToInlineSpan(w: WordSpan, text: string): InlineSpan {
  return {
    text,
    bold: w.bold,
    italic: w.italic,
    underline: w.underline,
    strikethrough: w.strikethrough,
    color: w.color,
    opacity: w.opacity,
    highlight: w.highlight,
    superscript: w.superscript,
    subscript: w.subscript,
    smallCaps: w.smallCaps,
  };
}

function spansMatch(a: InlineSpan | WordSpan, b: WordSpan): boolean {
  return (
    a.bold === b.bold &&
    a.italic === b.italic &&
    a.underline === b.underline &&
    a.strikethrough === b.strikethrough &&
    a.color === b.color &&
    a.opacity === b.opacity &&
    a.highlight === b.highlight &&
    a.superscript === b.superscript &&
    a.subscript === b.subscript &&
    a.smallCaps === b.smallCaps
  );
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

    if (spans.length > 0 && spansMatch(spans[spans.length - 1], w)) {
      spans[spans.length - 1].text += text;
    } else {
      spans.push(wordSpanToInlineSpan(w, text));
    }

    const spanFontSize =
      w.superscript || w.subscript ? fontSize * 0.7 : fontSize;
    const displayWord = w.smallCaps ? w.word.toUpperCase() : w.word;
    ctx.font = buildFont(
      spanFontSize,
      fontFamily,
      baseFontWeight,
      baseFontStyle,
      wordSpanToInlineSpan(w, ""),
    );
    totalWidth += ctx.measureText(displayWord).width;
    if (i > 0) totalWidth += spaceWidth;
  }

  return { spans, width: totalWidth };
}

// ---- Block Styles ----

function calculateBaseFontSize(_shape: string, contentWidth: number): number {
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

// ---- Measurement ----

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
      baseOpacity: opacity,
      marginTop,
      marginBottom,
      totalHeight,
      isQuote,
      quoteIndent,
    });
  }

  return measuredBlocks;
}

// ---- Rendering ----

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

  let totalTextHeight = 0;
  for (const mb of measuredBlocks) {
    totalTextHeight += mb.totalHeight;
  }

  // Drop cap adjustment
  if (
    config.dropCap &&
    measuredBlocks.length > 0 &&
    measuredBlocks[0].block.type === "paragraph"
  ) {
    totalTextHeight += measuredBlocks[0].lineHeight * 1.2;
  }

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
      baseOpacity,
      marginTop,
      marginBottom,
      isQuote,
      quoteIndent,
    } = mb;

    if (currentY > paddingY + contentHeight) break;
    currentY += marginTop;

    ctx.save();

    // Handle drop cap
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
          baseOpacity,
        );
        isFirstParagraph = false;
        ctx.restore();
        currentY += marginBottom;
        continue;
      }
    }

    // Render each line
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

      let spanX = lineX;
      for (const span of line.spans) {
        const isSuperSub = span.superscript || span.subscript;
        const spanFontSize = isSuperSub ? fontSize * 0.7 : fontSize;
        const displayText = span.smallCaps
          ? span.text.toUpperCase()
          : span.text;
        const smallCapsFontSize = span.smallCaps
          ? fontSize * 0.85
          : spanFontSize;
        const finalFontSize = span.smallCaps ? smallCapsFontSize : spanFontSize;

        const font = buildFont(
          finalFontSize,
          config.fontFamily,
          baseFontWeight,
          baseFontStyle,
          span,
        );
        ctx.font = font;

        const spanWidth = ctx.measureText(displayText).width;

        // Calculate vertical offset for super/subscript
        let yOffset = 0;
        if (span.superscript) yOffset = -fontSize * 0.3;
        if (span.subscript) yOffset = fontSize * 0.25;

        const spanY = currentY + yOffset;

        // Draw highlight background
        if (span.highlight) {
          ctx.save();
          ctx.fillStyle = span.highlight;
          ctx.globalAlpha = baseOpacity * span.opacity * 0.6;
          const hlPadding = 2;
          ctx.fillRect(
            spanX - hlPadding,
            spanY - 1,
            spanWidth + hlPadding * 2,
            finalFontSize * 1.2 + 2,
          );
          ctx.restore();
        }

        // Draw text
        ctx.save();
        ctx.fillStyle = span.color || config.textColor;
        ctx.globalAlpha = baseOpacity * span.opacity;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(displayText, spanX, spanY);
        ctx.restore();

        // Draw underline
        if (span.underline) {
          ctx.save();
          ctx.strokeStyle = span.color || config.textColor;
          ctx.globalAlpha = baseOpacity * span.opacity;
          ctx.lineWidth = Math.max(1, finalFontSize * 0.055);
          const underlineY = spanY + finalFontSize * 1.1;
          ctx.beginPath();
          ctx.moveTo(spanX, underlineY);
          ctx.lineTo(spanX + spanWidth, underlineY);
          ctx.stroke();
          ctx.restore();
        }

        // Draw strikethrough
        if (span.strikethrough) {
          ctx.save();
          ctx.strokeStyle = span.color || config.textColor;
          ctx.globalAlpha = baseOpacity * span.opacity;
          ctx.lineWidth = Math.max(1, finalFontSize * 0.055);
          const strikeY = spanY + finalFontSize * 0.55;
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

    // Blockquote bar
    if (isQuote && lines.length > 0) {
      const barX = paddingX + 6;
      const barHeight = lines.length * lineHeight;
      ctx.fillStyle = config.textColor;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.roundRect(barX, blockStartY, 3, barHeight, 1.5);
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
  baseOpacity: number,
): number {
  const allText = block.spans.map((s) => s.text).join("");
  const dropCapSize = fontSize * FONT_CONFIG.DROP_CAP_SCALE;
  const firstChar = allText[0].toUpperCase();
  const restText = allText.slice(1);

  ctx.save();
  ctx.globalAlpha = baseOpacity;

  ctx.font = `700 ${dropCapSize}px "${config.fontFamily}", serif`;
  const dropCapMetrics = ctx.measureText(firstChar);
  const dropCapWidth = dropCapMetrics.width + fontSize * 0.4;
  const dropCapHeight = dropCapSize * 0.85;
  const dropCapLines = Math.ceil(dropCapHeight / lineHeight);

  ctx.fillStyle = config.textColor;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(firstChar, paddingX, startY);

  ctx.font = buildFont(
    fontSize,
    config.fontFamily,
    baseFontWeight,
    baseFontStyle,
    {
      ...DEFAULT_SPAN,
      text: "",
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
      if (ctx.measureText(testLine).width > width && line) break;
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

// ---- Export ----

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
