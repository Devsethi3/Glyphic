import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { Editor } from "@tiptap/react";
import type {
  CanvasShape,
  ColorMode,
  ExportQuality,
  ExportFormat,
  FontFamily,
  BackgroundType,
} from "@/types";
import { themePresets, colorPalettes } from "@/data/themes";
import { getLuminance } from "@/lib/utils";

interface EditorState {
  // Content
  content: string;
  htmlContent: string;

  // Typography
  fontFamily: FontFamily;
  lineHeight: number;
  dropCap: boolean;

  // Theme
  backgroundColor: string;
  textColor: string;
  colorMode: ColorMode;
  activePreset: string | null;
  backgroundType: BackgroundType;
  gradientColors: string[];
  gradientAngle: number;

  // Padding
  paddingLocked: boolean;
  paddingHorizontal: number;
  paddingVertical: number;

  // Shape
  shape: CanvasShape;

  // Export
  exportQuality: ExportQuality;
  exportFormat: ExportFormat;
  exportThemeOverride: string | null;

  // Editor reference
  editorRef: Editor | null;

  // Actions
  setContent: (content: string) => void;
  setHtmlContent: (htmlContent: string) => void;
  setFontFamily: (fontFamily: FontFamily) => void;
  setLineHeight: (lineHeight: number) => void;
  toggleDropCap: () => void;
  setBackgroundColor: (color: string) => void;
  setTextColor: (color: string) => void;
  setColorMode: (mode: ColorMode) => void;
  randomizeTheme: () => void;
  applyPreset: (presetId: string) => void;
  setPaddingLocked: (locked: boolean) => void;
  setPaddingHorizontal: (value: number) => void;
  setPaddingVertical: (value: number) => void;
  setShape: (shape: CanvasShape) => void;
  setExportQuality: (quality: ExportQuality) => void;
  setExportFormat: (format: ExportFormat) => void;
  setExportThemeOverride: (override: string | null) => void;
  setEditorRef: (editor: Editor | null) => void;
}

export const useEditorStore = create<EditorState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    content: "",
    htmlContent: "",
    fontFamily: "EB Garamond",
    lineHeight: 1.7,
    dropCap: false,
    backgroundColor: "#192118",
    textColor: "#ededed",
    colorMode: "dark",
    activePreset: "serif-dark-dropcap",
    backgroundType: "solid",
    gradientColors: [],
    gradientAngle: 0,
    paddingLocked: true,
    paddingHorizontal: 10,
    paddingVertical: 10,
    shape: "square",
    exportQuality: "high",
    exportFormat: "png",
    exportThemeOverride: null,
    editorRef: null,

    // Actions
    setContent: (content) => set({ content }),
    setHtmlContent: (htmlContent) => set({ htmlContent }),

    setFontFamily: (fontFamily) => set({ fontFamily, activePreset: null }),

    setLineHeight: (lineHeight) => set({ lineHeight, activePreset: null }),

    toggleDropCap: () =>
      set((state) => ({ dropCap: !state.dropCap, activePreset: null })),

    setBackgroundColor: (backgroundColor) =>
      set({ backgroundColor, activePreset: null }),

    setTextColor: (textColor) => set({ textColor, activePreset: null }),

    setColorMode: (colorMode) => {
      const state = get();
      set({
        colorMode,
        backgroundColor: state.textColor,
        textColor: state.backgroundColor,
        activePreset: null,
      });
    },

    randomizeTheme: () => {
      const state = get();
      const palettes =
        state.colorMode === "dark" ? colorPalettes.dark : colorPalettes.light;
      const randomPalette =
        palettes[Math.floor(Math.random() * palettes.length)];
      set({
        backgroundColor: randomPalette.bg,
        textColor: randomPalette.text,
        activePreset: null,
      });
    },

    applyPreset: (presetId) => {
      const preset = themePresets.find((p) => p.id === presetId);
      if (!preset) return;

      const luminance = getLuminance(preset.backgroundColor);
      const colorMode: ColorMode = luminance < 0.5 ? "dark" : "light";

      set({
        fontFamily: preset.fontFamily,
        lineHeight: preset.lineHeight,
        dropCap: preset.dropCap,
        backgroundColor: preset.backgroundColor,
        textColor: preset.textColor,
        colorMode,
        activePreset: presetId,
        backgroundType: preset.backgroundType,
        gradientColors: preset.gradientColors || [],
        gradientAngle: preset.gradientAngle || 0,
      });
    },

    setPaddingLocked: (paddingLocked) => set({ paddingLocked }),

    setPaddingHorizontal: (paddingHorizontal) => {
      const state = get();
      if (state.paddingLocked) {
        set({ paddingHorizontal, paddingVertical: paddingHorizontal });
      } else {
        set({ paddingHorizontal });
      }
    },

    setPaddingVertical: (paddingVertical) => {
      const state = get();
      if (state.paddingLocked) {
        set({ paddingVertical, paddingHorizontal: paddingVertical });
      } else {
        set({ paddingVertical });
      }
    },

    setShape: (shape) => set({ shape }),

    setExportQuality: (exportQuality) => set({ exportQuality }),

    setExportFormat: (exportFormat) => set({ exportFormat }),

    setExportThemeOverride: (exportThemeOverride) =>
      set({ exportThemeOverride }),

    setEditorRef: (editorRef) => set({ editorRef }),
  })),
);
