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

const STORAGE_KEY = "glyphic-editor-state";
const STORAGE_VERSION = 1;

interface PersistedState {
  version: number;
  content: string;
  htmlContent: string;
  fontFamily: FontFamily;
  lineHeight: number;
  dropCap: boolean;
  backgroundColor: string;
  textColor: string;
  colorMode: ColorMode;
  activePreset: string | null;
  backgroundType: BackgroundType;
  gradientColors: string[];
  gradientAngle: number;
  paddingLocked: boolean;
  paddingHorizontal: number;
  paddingVertical: number;
  shape: CanvasShape;
  exportQuality: ExportQuality;
  exportFormat: ExportFormat;
  paperTexture: boolean;
  noiseIntensity: number;
}

function loadPersistedState(): Partial<PersistedState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== STORAGE_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function savePersistedState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable - silently fail
  }
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
function debouncedSave(state: PersistedState): void {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    savePersistedState(state);
  }, 300);
}


const persisted = loadPersistedState();

interface EditorState {
  content: string;
  htmlContent: string;
  fontFamily: FontFamily;
  lineHeight: number;
  dropCap: boolean;
  backgroundColor: string;
  textColor: string;
  colorMode: ColorMode;
  activePreset: string | null;
  backgroundType: BackgroundType;
  gradientColors: string[];
  gradientAngle: number;
  paperTexture: boolean;
  noiseIntensity: number;
  paddingLocked: boolean;
  paddingHorizontal: number;
  paddingVertical: number;
  shape: CanvasShape;
  exportQuality: ExportQuality;
  exportFormat: ExportFormat;
  exportThemeOverride: string | null;
  editorRef: Editor | null;
  _hydrated: boolean;
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
  setPaperTexture: (enabled: boolean) => void;
  setNoiseIntensity: (value: number) => void;
}

function getStateToPersist(state: EditorState): PersistedState {
  return {
    version: STORAGE_VERSION,
    content: state.content,
    htmlContent: state.htmlContent,
    fontFamily: state.fontFamily,
    lineHeight: state.lineHeight,
    dropCap: state.dropCap,
    backgroundColor: state.backgroundColor,
    textColor: state.textColor,
    colorMode: state.colorMode,
    activePreset: state.activePreset,
    backgroundType: state.backgroundType,
    gradientColors: state.gradientColors,
    gradientAngle: state.gradientAngle,
    paddingLocked: state.paddingLocked,
    paddingHorizontal: state.paddingHorizontal,
    paddingVertical: state.paddingVertical,
    shape: state.shape,
    exportQuality: state.exportQuality,
    exportFormat: state.exportFormat,
    paperTexture: state.paperTexture,
    noiseIntensity: state.noiseIntensity,
  };
}

export const useEditorStore = create<EditorState>()(
  subscribeWithSelector((set, get) => {
    const persistSet = (
      partial:
        | Partial<EditorState>
        | ((state: EditorState) => Partial<EditorState>),
    ) => {
      set(partial);
      const state = get();
      debouncedSave(getStateToPersist(state));
    };

    return {
      content: persisted?.content ?? "",
      htmlContent: persisted?.htmlContent ?? "",
      fontFamily: persisted?.fontFamily ?? "EB Garamond",
      lineHeight: persisted?.lineHeight ?? 1.7,
      dropCap: persisted?.dropCap ?? false,
      backgroundColor: persisted?.backgroundColor ?? "#192118",
      textColor: persisted?.textColor ?? "#ededed",
      colorMode: persisted?.colorMode ?? "dark",
      activePreset: persisted?.activePreset ?? "serif-dark-dropcap",
      backgroundType: persisted?.backgroundType ?? "solid",
      gradientColors: persisted?.gradientColors ?? [],
      gradientAngle: persisted?.gradientAngle ?? 0,
      paddingLocked: persisted?.paddingLocked ?? true,
      paddingHorizontal: persisted?.paddingHorizontal ?? 10,
      paddingVertical: persisted?.paddingVertical ?? 10,
      shape: persisted?.shape ?? "square",
      exportQuality: persisted?.exportQuality ?? "high",
      exportFormat: persisted?.exportFormat ?? "png",
      exportThemeOverride: null,
      editorRef: null,
      _hydrated: !!persisted,
      paperTexture: persisted?.paperTexture ?? false,
      noiseIntensity: persisted?.noiseIntensity ?? 0.75,

      setContent: (content) => persistSet({ content }),
      setHtmlContent: (htmlContent) => persistSet({ htmlContent }),

      setFontFamily: (fontFamily) =>
        persistSet({ fontFamily, activePreset: null }),

      setLineHeight: (lineHeight) =>
        persistSet({ lineHeight, activePreset: null }),

      toggleDropCap: () =>
        persistSet((state) => ({
          dropCap: !state.dropCap,
          activePreset: null,
        })),

      setBackgroundColor: (backgroundColor) =>
        persistSet({ backgroundColor, activePreset: null }),

      setTextColor: (textColor) =>
        persistSet({ textColor, activePreset: null }),

      setColorMode: (mode) => {
        const state = get();

        if (state.colorMode === mode) {
          const palettes =
            mode === "dark" ? colorPalettes.dark : colorPalettes.light;
          const randomPalette =
            palettes[Math.floor(Math.random() * palettes.length)];
          persistSet({
            backgroundColor: randomPalette.bg,
            textColor: randomPalette.text,
            activePreset: null,
          });
          return;
        }

        const palettes =
          mode === "dark" ? colorPalettes.dark : colorPalettes.light;
        const randomPalette =
          palettes[Math.floor(Math.random() * palettes.length)];
        persistSet({
          colorMode: mode,
          backgroundColor: randomPalette.bg,
          textColor: randomPalette.text,
          activePreset: null,
        });
      },

      randomizeTheme: () => {
        const state = get();
        const palettes =
          state.colorMode === "dark" ? colorPalettes.dark : colorPalettes.light;
        const randomPalette =
          palettes[Math.floor(Math.random() * palettes.length)];
        persistSet({
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

        persistSet({
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
          paperTexture: preset.paperTexture ?? false,
        });
      },

      setPaddingLocked: (paddingLocked) => persistSet({ paddingLocked }),

      setPaddingHorizontal: (paddingHorizontal) => {
        const state = get();
        if (state.paddingLocked) {
          persistSet({ paddingHorizontal, paddingVertical: paddingHorizontal });
        } else {
          persistSet({ paddingHorizontal });
        }
      },

      setPaddingVertical: (paddingVertical) => {
        const state = get();
        if (state.paddingLocked) {
          persistSet({ paddingVertical, paddingHorizontal: paddingVertical });
        } else {
          persistSet({ paddingVertical });
        }
      },

      setShape: (shape) => persistSet({ shape }),

      setExportQuality: (exportQuality) => persistSet({ exportQuality }),

      setExportFormat: (exportFormat) => persistSet({ exportFormat }),

      setExportThemeOverride: (exportThemeOverride) =>
        set({ exportThemeOverride }),

      setEditorRef: (editorRef) => set({ editorRef }),

      setPaperTexture: (paperTexture) =>
        persistSet({ paperTexture, activePreset: null }),

      setNoiseIntensity: (noiseIntensity) =>
        persistSet({ noiseIntensity, activePreset: null }),
    };
  }),
);
