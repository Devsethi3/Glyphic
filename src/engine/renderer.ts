// src/engine/renderer.ts
import type { RenderConfig } from "@/types";
import { shapes } from "@/data/shapes";
import { getLuminance } from "@/lib/utils";

// ============================================================
// FONT SIZE CONFIGURATION
// Adjust BASE_SIZE_RATIO to change the default canvas text size
// 0.065 = 6.5% of content width
// For 1080px square with 10% padding: contentWidth=864, base=~56px
// ============================================================
const FONT_CONFIG = {
  BASE_SIZE_RATIO: 0.065,
  MAX_BASE_SIZE: 72,
  MIN_BASE_SIZE: 20,
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
  fontSize: number | null; // null means use block default
}

type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "blockquote"
  | "bullet-item"
  | "ordered-item"
  | "horizontal-rule";

interface RichTextBlock {
  spans: InlineSpan[];
  type: BlockType;
  align: "left" | "center" | "right";
  listIndex?: number;
  listDepth?: number;
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
  bulletIndent: number;
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
  fontSize: number | null;
  trailingSpace?: boolean;
}

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
  fontSize: null,
};

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

  // Draw paper texture after background, before text
  if (config.paperTexture) {
    const luminance = getLuminance(config.backgroundColor);
    drawPaperTexture(ctx, baseWidth, baseHeight, luminance < 0.5);
  }

  const paddingX = (config.paddingHorizontal / 100) * baseWidth;
  const paddingY = (config.paddingVertical / 100) * baseHeight;
  const contentWidth = baseWidth - paddingX * 2;
  const contentHeight = baseHeight - paddingY * 2;

  if (!config.text.trim()) {
    drawPlaceholder(
      ctx,
      config,
      baseWidth,
      baseHeight,
      contentWidth,
      contentHeight,
      paddingX,
      paddingY,
    );
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

// ---- Placeholder ----

function drawPlaceholder(
  ctx: CanvasRenderingContext2D,
  config: RenderConfig,
  canvasWidth: number,
  canvasHeight: number,
  contentWidth: number,
  contentHeight: number,
  paddingX: number,
  paddingY: number,
): void {
  ctx.save();

  const placeholderText = "Start writing...";

  // Use a larger font size — proportional to content width like body text
  // but slightly smaller than the main body text would be
  const baseFontSize = calculateBaseFontSize(config.shape, contentWidth);
  const fontSize = baseFontSize * 0.85;

  ctx.font = `400 ${fontSize}px "${config.fontFamily}", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Use the exact theme text color at reduced opacity
  // This ensures it looks correct on both light and dark backgrounds
  ctx.fillStyle = config.textColor;
  ctx.globalAlpha = 0.35;

  // Center within the content area
  const centerX = paddingX + contentWidth / 2;
  const centerY = paddingY + contentHeight / 2;

  ctx.fillText(placeholderText, centerX, centerY);

  ctx.restore();
}

// ---- Style Extraction ----

function extractStyleProperty(style: string, property: string): string | null {
  if (!style) return null;
  const declarations = style.split(";");
  for (const decl of declarations) {
    const trimmed = decl.trim();
    if (!trimmed) continue;
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;
    const prop = trimmed.substring(0, colonIndex).trim().toLowerCase();
    const value = trimmed.substring(colonIndex + 1).trim();
    if (prop === property.toLowerCase() && value) {
      return value;
    }
  }
  return null;
}

// ---- Paper Noise Texture ----

let noiseCanvas: HTMLCanvasElement | null = null;
let noiseWidth = 0;
let noiseHeight = 0;

function getNoiseCanvas(width: number, height: number): HTMLCanvasElement {
  // Cache the noise canvas — regenerate only if size changes
  if (noiseCanvas && noiseWidth === width && noiseHeight === height) {
    return noiseCanvas;
  }

  noiseCanvas = document.createElement("canvas");
  noiseCanvas.width = width;
  noiseCanvas.height = height;
  noiseWidth = width;
  noiseHeight = height;

  const ctx = noiseCanvas.getContext("2d");
  if (!ctx) return noiseCanvas;

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    // Generate subtle grain — random grayscale value
    const grain = Math.random() * 255;
    data[i] = grain; // R
    data[i + 1] = grain; // G
    data[i + 2] = grain; // B
    data[i + 3] = 255; // A (full, we control opacity via globalAlpha)
  }

  ctx.putImageData(imageData, 0, 0);
  return noiseCanvas;
}

function drawPaperTexture(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  isDarkBackground: boolean,
): void {
  ctx.save();

  // Use a noise pattern at very low opacity
  // Lighter on dark backgrounds, darker on light backgrounds
  const opacity = isDarkBackground ? 0.06 : 0.04;
  ctx.globalAlpha = opacity;

  // Use "overlay" for dark backgrounds (adds subtle light grain)
  // Use "multiply" for light backgrounds (adds subtle dark grain)
  ctx.globalCompositeOperation = isDarkBackground ? "overlay" : "multiply";

  const noise = getNoiseCanvas(Math.ceil(width), Math.ceil(height));

  ctx.drawImage(noise, 0, 0, width, height);

  ctx.restore();
}

// ---- HTML Parsing ----

function parseHtmlToRichBlocks(html: string): RichTextBlock[] {
  if (!html) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const blocks: RichTextBlock[] = [];
  processChildNodes(doc.body, blocks, 0);
  return blocks;
}

function processChildNodes(
  parent: Node,
  blocks: RichTextBlock[],
  listDepth: number,
): void {
  const children = parent.childNodes;
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
    const tag = el.tagName.toLowerCase();

    if (tag === "ul") {
      processListItems(el, "bullet-item", blocks, listDepth);
      continue;
    }
    if (tag === "ol") {
      processListItems(el, "ordered-item", blocks, listDepth);
      continue;
    }
    if (tag === "hr") {
      blocks.push({ spans: [], type: "horizontal-rule", align: "left" });
      continue;
    }

    const text = el.textContent?.trim() || "";
    if (!text) continue;

    const style = el.getAttribute("style") || "";
    const alignMatch = style.match(/text-align:\s*(left|center|right)/);
    const align = (alignMatch?.[1] || "left") as "left" | "center" | "right";

    let type: BlockType = "paragraph";

    switch (tag) {
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
        const bqChildren = el.children;
        if (bqChildren.length > 0) {
          for (let j = 0; j < bqChildren.length; j++) {
            const innerEl = bqChildren[j] as HTMLElement;
            const innerText = innerEl.textContent?.trim() || "";
            if (!innerText) continue;
            const innerSpans = extractInlineSpans(innerEl);
            if (innerSpans.length > 0) {
              blocks.push({ spans: innerSpans, type: "blockquote", align });
            }
          }
          continue;
        }
        break;
    }

    const spans = extractInlineSpans(el);
    if (spans.length > 0) {
      blocks.push({ spans, type, align });
    }
  }
}

function processListItems(
  listEl: HTMLElement,
  type: "bullet-item" | "ordered-item",
  blocks: RichTextBlock[],
  depth: number,
): void {
  const items = listEl.children;
  let orderIndex = 1;

  for (let i = 0; i < items.length; i++) {
    const li = items[i] as HTMLElement;
    if (li.tagName.toLowerCase() !== "li") continue;

    const nestedUl = li.querySelector(":scope > ul");
    const nestedOl = li.querySelector(":scope > ol");

    let hasDirectText = false;
    for (let j = 0; j < li.childNodes.length; j++) {
      const child = li.childNodes[j];
      if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
        hasDirectText = true;
        break;
      }
      if (
        child.nodeType === Node.ELEMENT_NODE &&
        !["ul", "ol"].includes((child as HTMLElement).tagName.toLowerCase())
      ) {
        hasDirectText = true;
        break;
      }
    }

    if (hasDirectText) {
      const contentEl =
        li.querySelector(":scope > p") ||
        (() => {
          const temp = document.createElement("span");
          for (let j = 0; j < li.childNodes.length; j++) {
            const child = li.childNodes[j];
            if (
              child.nodeType === Node.TEXT_NODE ||
              (child.nodeType === Node.ELEMENT_NODE &&
                !["ul", "ol"].includes(
                  (child as HTMLElement).tagName.toLowerCase(),
                ))
            ) {
              temp.appendChild(child.cloneNode(true));
            }
          }
          return temp;
        })();

      const spans = extractInlineSpans(contentEl as HTMLElement);
      if (spans.length > 0) {
        const style = li.getAttribute("style") || "";
        const alignMatch = style.match(/text-align:\s*(left|center|right)/);
        const align = (alignMatch?.[1] || "left") as
          | "left"
          | "center"
          | "right";
        blocks.push({
          spans,
          type,
          align,
          listIndex: type === "ordered-item" ? orderIndex : undefined,
          listDepth: depth,
        });
      }
    }

    orderIndex++;
    if (nestedUl)
      processListItems(
        nestedUl as HTMLElement,
        "bullet-item",
        blocks,
        depth + 1,
      );
    if (nestedOl)
      processListItems(
        nestedOl as HTMLElement,
        "ordered-item",
        blocks,
        depth + 1,
      );
  }
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

  if (["ul", "ol", "li", "hr"].includes(tag)) return;

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
      extractStyleProperty(
        el.getAttribute("style") || "",
        "background-color",
      ) ||
      el.style.backgroundColor ||
      null;
    if (bgColor) current.highlight = bgColor.trim();
  }

  // Style-based formatting
  const style = el.getAttribute("style") || "";

  const fontWeight = extractStyleProperty(style, "font-weight");
  if (
    fontWeight === "bold" ||
    fontWeight === "700" ||
    fontWeight === "800" ||
    fontWeight === "900"
  ) {
    current.bold = true;
  }

  const fontStyleVal = extractStyleProperty(style, "font-style");
  if (fontStyleVal === "italic") current.italic = true;

  const textDecoration = extractStyleProperty(style, "text-decoration");
  if (textDecoration) {
    if (textDecoration.includes("underline")) current.underline = true;
    if (textDecoration.includes("line-through")) current.strikethrough = true;
  }

  // Color — skip on <mark> elements
  if (tag !== "mark") {
    const colorValue = extractStyleProperty(style, "color");
    if (colorValue) {
      current.color = colorValue;
    } else if (el.style && el.style.color && el.style.color !== "") {
      current.color = el.style.color;
    }
  }

  // Opacity
  const opacityValue = extractStyleProperty(style, "opacity");
  if (opacityValue) {
    const val = parseFloat(opacityValue);
    if (!isNaN(val)) current.opacity = val;
  }

  // Font-variant
  const fontVariant = extractStyleProperty(style, "font-variant");
  if (fontVariant === "small-caps") current.smallCaps = true;

  // Font-size from inline style
  const fontSizeValue = extractStyleProperty(style, "font-size");
  if (fontSizeValue) {
    const parsed = parseFloat(fontSizeValue);
    if (!isNaN(parsed)) {
      // Convert to px if needed
      if (fontSizeValue.includes("rem")) {
        current.fontSize = parsed * 16; // assume 16px base
      } else if (fontSizeValue.includes("em")) {
        // em relative — store as-is, will be multiplied by block font size
        current.fontSize = parsed * 16;
      } else {
        // px or unitless
        current.fontSize = parsed;
      }
    }
  }

  // Background color from non-mark elements
  if (tag !== "mark") {
    const bgColor = extractStyleProperty(style, "background-color");
    if (bgColor) current.highlight = bgColor.trim();
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
        if (words.length > 0) words[words.length - 1].trailingSpace = true;
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
          fontSize: span.fontSize,
        });
      }
    }
  }
  return words;
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
    fontSize: w.fontSize,
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
    a.smallCaps === b.smallCaps &&
    a.fontSize === b.fontSize
  );
}

function resolveSpanFontSize(
  span: InlineSpan | WordSpan,
  blockFontSize: number,
): number {
  let size = blockFontSize;

  // If span has an explicit font size from the editor, scale it proportionally
  // Editor font sizes (12px-72px) get mapped relative to the block's base size
  if (span.fontSize !== null && span.fontSize !== undefined) {
    // The editor uses pixel values. We scale them relative to a "normal" editor
    // paragraph size of ~16px so that canvas rendering stays proportional.
    const editorBasePx = 16;
    const ratio = span.fontSize / editorBasePx;
    size = blockFontSize * ratio;
  }

  if (span.superscript || span.subscript) {
    size *= 0.7;
  }

  if (span.smallCaps) {
    size *= 0.85;
  }

  return size;
}

function wrapRichText(
  ctx: CanvasRenderingContext2D,
  spans: InlineSpan[],
  maxWidth: number,
  blockFontSize: number,
  fontFamily: string,
  baseFontWeight: number,
  baseFontStyle: string,
): MeasuredLine[] {
  const words = flattenSpansToWords(spans);
  if (words.length === 0) return [];

  const lines: MeasuredLine[] = [];
  let currentLineWords: WordSpan[] = [];
  let currentLineWidth = 0;

  ctx.font = buildFont(
    blockFontSize,
    fontFamily,
    baseFontWeight,
    baseFontStyle,
    { ...DEFAULT_SPAN, text: "" },
  );
  const spaceWidth = ctx.measureText(" ").width;

  for (const wordSpan of words) {
    const spanSize = resolveSpanFontSize(wordSpan, blockFontSize);
    const displayText = wordSpan.smallCaps
      ? wordSpan.word.toUpperCase()
      : wordSpan.word;

    ctx.font = buildFont(
      spanSize,
      fontFamily,
      baseFontWeight,
      baseFontStyle,
      wordSpanToInlineSpan(wordSpan, ""),
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
          blockFontSize,
          fontFamily,
          baseFontWeight,
          baseFontStyle,
          spaceWidth,
        ),
      );
      currentLineWords = [wordSpan];
      currentLineWidth = wordWidth;
    } else {
      if (currentLineWords.length > 0) currentLineWidth += spaceWidth;
      currentLineWords.push(wordSpan);
      currentLineWidth += wordWidth;
    }
  }

  if (currentLineWords.length > 0) {
    lines.push(
      buildMeasuredLine(
        ctx,
        currentLineWords,
        blockFontSize,
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
  blockFontSize: number,
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

    const spanSize = resolveSpanFontSize(w, blockFontSize);
    const displayWord = w.smallCaps ? w.word.toUpperCase() : w.word;
    ctx.font = buildFont(
      spanSize,
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

function getBlockStyles(type: BlockType, baseFontSize: number) {
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
    case "bullet-item":
    case "ordered-item":
      return {
        fontSize: baseFontSize,
        fontWeight: 400,
        fontStyle: "normal",
        opacity: 1,
        marginTop: baseFontSize * 0.08,
        marginBottom: baseFontSize * 0.08,
      };
    case "horizontal-rule":
      return {
        fontSize: baseFontSize,
        fontWeight: 400,
        fontStyle: "normal",
        opacity: 0.3,
        marginTop: baseFontSize * 0.6,
        marginBottom: baseFontSize * 0.6,
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
    const marginTop = i === 0 ? 0 : styles.marginTop;

    const isQuote = block.type === "blockquote";
    const quoteIndent = isQuote ? 24 : 0;
    const isList =
      block.type === "bullet-item" || block.type === "ordered-item";
    const depth = block.listDepth || 0;
    const bulletIndent = isList ? 28 + depth * 20 : 0;
    const effectiveWidth = contentWidth - quoteIndent - bulletIndent;

    if (block.type === "horizontal-rule") {
      measuredBlocks.push({
        block,
        lines: [],
        lineHeight: 0,
        fontSize: styles.fontSize,
        baseFontWeight: styles.fontWeight,
        baseFontStyle: styles.fontStyle,
        baseOpacity: styles.opacity,
        marginTop,
        marginBottom: styles.marginBottom,
        totalHeight: marginTop + 2 + styles.marginBottom,
        isQuote: false,
        quoteIndent: 0,
        bulletIndent: 0,
      });
      continue;
    }

    const lines = wrapRichText(
      ctx,
      block.spans,
      effectiveWidth,
      styles.fontSize,
      config.fontFamily,
      styles.fontWeight,
      styles.fontStyle,
    );
    const lineHeight = styles.fontSize * config.lineHeight;
    const textHeight = lines.length * lineHeight;

    measuredBlocks.push({
      block,
      lines,
      lineHeight,
      fontSize: styles.fontSize,
      baseFontWeight: styles.fontWeight,
      baseFontStyle: styles.fontStyle,
      baseOpacity: styles.opacity,
      marginTop,
      marginBottom: styles.marginBottom,
      totalHeight: marginTop + textHeight + styles.marginBottom,
      isQuote,
      quoteIndent,
      bulletIndent,
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
  for (const mb of measuredBlocks) totalTextHeight += mb.totalHeight;

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
      bulletIndent,
    } = mb;

    if (currentY > paddingY + contentHeight) break;
    currentY += marginTop;

    if (block.type === "horizontal-rule") {
      ctx.save();
      ctx.strokeStyle = config.textColor;
      ctx.globalAlpha = baseOpacity;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(paddingX, currentY);
      ctx.lineTo(paddingX + contentWidth, currentY);
      ctx.stroke();
      ctx.restore();
      currentY += 2 + marginBottom;
      continue;
    }

    ctx.save();

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

    const totalIndent = quoteIndent + bulletIndent;

    if (
      (block.type === "bullet-item" || block.type === "ordered-item") &&
      lines.length > 0
    ) {
      ctx.save();
      ctx.fillStyle = config.textColor;
      ctx.globalAlpha = baseOpacity * 0.8;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const depth = block.listDepth || 0;
      const indentX = paddingX + depth * 20;

      if (block.type === "bullet-item") {
        const bulletChars = ["•", "◦", "▪"];
        ctx.font = `400 ${fontSize}px "${config.fontFamily}", serif`;
        ctx.fillText(
          bulletChars[Math.min(depth, bulletChars.length - 1)],
          indentX + 8,
          currentY,
        );
      } else {
        ctx.font = `400 ${fontSize}px "${config.fontFamily}", serif`;
        ctx.fillText(`${block.listIndex || 1}.`, indentX + 4, currentY);
      }
      ctx.restore();
    }

    const blockStartY = currentY;

    for (const line of lines) {
      if (currentY > paddingY + contentHeight) break;

      const effectiveWidth = contentWidth - totalIndent;
      let lineX: number;
      switch (block.align) {
        case "center":
          lineX = paddingX + totalIndent + (effectiveWidth - line.width) / 2;
          break;
        case "right":
          lineX = paddingX + totalIndent + effectiveWidth - line.width;
          break;
        default:
          lineX = paddingX + totalIndent;
      }

      let spanX = lineX;
      for (const span of line.spans) {
        const finalFontSize = resolveSpanFontSize(span, fontSize);
        const displayText = span.smallCaps
          ? span.text.toUpperCase()
          : span.text;

        ctx.font = buildFont(
          finalFontSize,
          config.fontFamily,
          baseFontWeight,
          baseFontStyle,
          span,
        );
        const spanWidth = ctx.measureText(displayText).width;

        let yOffset = 0;
        if (span.superscript) yOffset = -fontSize * 0.3;
        if (span.subscript) yOffset = fontSize * 0.25;
        const spanY = currentY + yOffset;
        const effectiveOpacity = baseOpacity * span.opacity;
        const textColor = span.color || config.textColor;

        if (span.highlight) {
          ctx.save();
          ctx.fillStyle = span.highlight;
          ctx.globalAlpha = effectiveOpacity * 0.85;
          const hlPad = 2;
          const hlH = finalFontSize * 1.25;
          const hlY = spanY - finalFontSize * 0.05;
          ctx.beginPath();
          ctx.roundRect(spanX - hlPad, hlY, spanWidth + hlPad * 2, hlH, 3);
          ctx.fill();
          ctx.restore();
        }

        ctx.save();
        ctx.fillStyle = textColor;
        ctx.globalAlpha = effectiveOpacity;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(displayText, spanX, spanY);
        ctx.restore();

        if (span.underline) {
          ctx.save();
          ctx.strokeStyle = textColor;
          ctx.globalAlpha = effectiveOpacity;
          ctx.lineWidth = Math.max(1, finalFontSize * 0.055);
          ctx.beginPath();
          ctx.moveTo(spanX, spanY + finalFontSize * 1.1);
          ctx.lineTo(spanX + spanWidth, spanY + finalFontSize * 1.1);
          ctx.stroke();
          ctx.restore();
        }

        if (span.strikethrough) {
          ctx.save();
          ctx.strokeStyle = textColor;
          ctx.globalAlpha = effectiveOpacity;
          ctx.lineWidth = Math.max(1, finalFontSize * 0.055);
          ctx.beginPath();
          ctx.moveTo(spanX, spanY + finalFontSize * 0.55);
          ctx.lineTo(spanX + spanWidth, spanY + finalFontSize * 0.55);
          ctx.stroke();
          ctx.restore();
        }

        spanX += spanWidth;
      }
      currentY += lineHeight;
    }

    if (isQuote && lines.length > 0) {
      ctx.save();
      ctx.fillStyle = config.textColor;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.roundRect(
        paddingX + 6,
        blockStartY,
        3,
        lines.length * lineHeight,
        1.5,
      );
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
    if (block.type === "paragraph") isFirstParagraph = false;
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
  const dropCapWidth = ctx.measureText(firstChar).width + fontSize * 0.4;
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
    { ...DEFAULT_SPAN, text: "" },
  );

  let currentY = startY;
  let textRemaining = restText;
  let lineCount = 0;

  while (textRemaining.length > 0) {
    const isIndented = lineCount < dropCapLines;
    const width = isIndented ? contentWidth - dropCapWidth : contentWidth;
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

  // Paper texture for exports too
  if (config.paperTexture) {
    const luminance = getLuminance(config.backgroundColor);
    drawPaperTexture(ctx, shapeData.width, shapeData.height, luminance < 0.5);
  }

  const paddingX = (config.paddingHorizontal / 100) * shapeData.width;
  const paddingY = (config.paddingVertical / 100) * shapeData.height;
  const contentWidth = shapeData.width - paddingX * 2;
  const contentHeight = shapeData.height - paddingY * 2;

  if (!config.text.trim()) {
    drawPlaceholder(
      ctx,
      config,
      shapeData.width,
      shapeData.height,
      contentWidth,
      contentHeight,
      paddingX,
      paddingY,
    );
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
