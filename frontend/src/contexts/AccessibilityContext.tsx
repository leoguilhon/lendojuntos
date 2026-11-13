/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ColorVisionProfile =
  | "default"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "grayscale";

export type AccessibilityPreferences = {
  fontScale: number;
  brightness: number;
  contrast: number;
  colorVision: ColorVisionProfile;
  comfortableSpacing: boolean;
  underlineLinks: boolean;
  reduceMotion: boolean;
  simpleFont: boolean;
};

type AccessibilityContextValue = {
  preferences: AccessibilityPreferences;
  isModified: boolean;
  updatePreference: <Key extends keyof AccessibilityPreferences>(
    key: Key,
    value: AccessibilityPreferences[Key],
  ) => void;
  resetPreferences: () => void;
};

const STORAGE_KEY = "lendojuntos:accessibility-preferences";

export const DEFAULT_ACCESSIBILITY_PREFERENCES: AccessibilityPreferences = {
  fontScale: 100,
  brightness: 100,
  contrast: 100,
  colorVision: "default",
  comfortableSpacing: false,
  underlineLinks: false,
  reduceMotion: false,
  simpleFont: false,
};

const COLOR_VISION_PROFILES: ColorVisionProfile[] = [
  "default",
  "protanopia",
  "deuteranopia",
  "tritanopia",
  "grayscale",
];

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

function clamp(value: unknown, minimum: number, maximum: number, fallback: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(maximum, Math.max(minimum, value))
    : fallback;
}

function normalizePreferences(value: unknown): AccessibilityPreferences {
  if (!value || typeof value !== "object") return DEFAULT_ACCESSIBILITY_PREFERENCES;

  const candidate = value as Partial<AccessibilityPreferences>;
  const colorVision = COLOR_VISION_PROFILES.includes(candidate.colorVision as ColorVisionProfile)
    ? candidate.colorVision as ColorVisionProfile
    : DEFAULT_ACCESSIBILITY_PREFERENCES.colorVision;

  return {
    fontScale: clamp(candidate.fontScale, 80, 150, DEFAULT_ACCESSIBILITY_PREFERENCES.fontScale),
    brightness: clamp(candidate.brightness, 70, 130, DEFAULT_ACCESSIBILITY_PREFERENCES.brightness),
    contrast: clamp(candidate.contrast, 80, 150, DEFAULT_ACCESSIBILITY_PREFERENCES.contrast),
    colorVision,
    comfortableSpacing: candidate.comfortableSpacing === true,
    underlineLinks: candidate.underlineLinks === true,
    reduceMotion: candidate.reduceMotion === true,
    simpleFont: candidate.simpleFont === true,
  };
}

function readStoredPreferences() {
  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    return storedValue
      ? normalizePreferences(JSON.parse(storedValue))
      : DEFAULT_ACCESSIBILITY_PREFERENCES;
  } catch {
    return DEFAULT_ACCESSIBILITY_PREFERENCES;
  }
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(readStoredPreferences);

  useEffect(() => {
    const root = document.documentElement;

    root.style.fontSize = `${preferences.fontScale}%`;
    root.style.setProperty("--a11y-brightness", `${preferences.brightness / 100}`);
    root.style.setProperty("--a11y-contrast", `${preferences.contrast / 100}`);
    root.dataset.a11yColorVision = preferences.colorVision;
    root.dataset.a11yComfortableSpacing = String(preferences.comfortableSpacing);
    root.dataset.a11yUnderlineLinks = String(preferences.underlineLinks);
    root.dataset.a11yReduceMotion = String(preferences.reduceMotion);
    root.dataset.a11ySimpleFont = String(preferences.simpleFont);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // A interface continua funcional quando o navegador bloqueia armazenamento local.
    }
  }, [preferences]);

  const value = useMemo<AccessibilityContextValue>(() => ({
    preferences,
    isModified: JSON.stringify(preferences) !== JSON.stringify(DEFAULT_ACCESSIBILITY_PREFERENCES),
    updatePreference: (key, nextValue) => {
      setPreferences((current) => normalizePreferences({ ...current, [key]: nextValue }));
    },
    resetPreferences: () => setPreferences(DEFAULT_ACCESSIBILITY_PREFERENCES),
  }), [preferences]);

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility deve ser usado dentro de AccessibilityProvider.");
  }
  return context;
}
