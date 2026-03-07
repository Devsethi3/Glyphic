// src/types/index.ts
export type CanvasShape = "square" | "portrait" | "landscape" | "vertical";
export type ColorMode = "dark" | "light";
export type ExportQuality = "standard" | "high" | "ultra";
export type ExportFormat = "png" | "svg";

export type FontFamily =
  | "EB Garamond"
  | "Playfair Display"
  | "Instrument Serif"
  | "Inter"
  | "Space Grotesk"
  | "Syne"
  | "JetBrains Mono"
  | "IBM Plex Mono";

export type BackgroundType = "solid" | "linear-gradient" | "radial-gradient";

export interface ThemePreset {
  id: string;
  name: string;
  fontFamily: FontFamily;
  backgroundColor: string;
  textColor: string;
  lineHeight: number;
  dropCap: boolean;
  backgroundType: BackgroundType;
  gradientColors?: string[];
  gradientAngle?: number;
  category: "default";
}

export interface PaddingConfig {
  locked: boolean;
  horizontal: number;
  vertical: number;
}

export interface TypographyConfig {
  fontFamily: FontFamily;
  lineHeight: number;
  dropCap: boolean;
}

export interface ThemeConfig {
  backgroundColor: string;
  textColor: string;
  colorMode: ColorMode;
  activePreset: string | null;
  backgroundType: BackgroundType;
  gradientColors: string[];
  gradientAngle: number;
}

export interface ExportConfig {
  quality: ExportQuality;
  format: ExportFormat;
  themeOverride: string | null;
}

export interface KaomojiCategory {
  name: string;
  items: string[];
}

export interface DecorationCategory {
  name: string;
  items: string[];
}

export interface ShapeDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface RenderConfig {
  text: string;
  htmlContent: string;
  fontFamily: FontFamily;
  lineHeight: number;
  dropCap: boolean;
  backgroundColor: string;
  textColor: string;
  backgroundType: BackgroundType;
  gradientColors: string[];
  gradientAngle: number;
  paddingHorizontal: number;
  paddingVertical: number;
  shape: CanvasShape;
}

export interface TextBlock {
  text: string;
  type: "paragraph" | "heading1" | "heading2" | "heading3" | "blockquote";
  align?: "left" | "center" | "right";
}
