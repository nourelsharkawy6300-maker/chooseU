/**
 * ChooseU Motion & Glass Design Tokens
 * 
 * Strict Performance Rules:
 * - Only transform and opacity are animated during scroll / interaction.
 * - Backdrop-filter is strictly limited to <= 1 layer on the login card.
 * - Symmetrical dispersion coefficients ensure full RTL visual parity.
 */

export const MOTION_EASINGS = {
  cinematic: [0.16, 1, 0.3, 1] as const,
  smoothOut: [0.22, 1, 0.36, 1] as const,
  decelerate: [0.0, 0.0, 0.2, 1] as const,
  accelerate: [0.4, 0.0, 1, 1] as const,
};

export const INTRO_SCROLL_MILESTONES = {
  containerHeightVh: 300,
  logoHoldEnd: 0.12,
  hintFadeEnd: 0.15,
  spreadStart: 0.10,
  spreadEnd: 0.70,
  fadeOutStart: 0.40,
  fadeOutEnd: 0.70,
  loginCardStart: 0.55,
  loginCardFull: 0.90,
} as const;

export interface LetterDispersionToken {
  char: string;
  index: number;
  centerDelta: number; // Normalized: 0 at center, -3 at left, +3 at right
  yDelta: number; // Small vertical divergence in px
  rotDelta: number; // Subtle rotation divergence in deg
  isAccent?: boolean; // The signature 'U'
}

export const CHOOSE_U_LETTERS: readonly LetterDispersionToken[] = [
  { char: "C", index: 0, centerDelta: -3, yDelta: -14, rotDelta: -12 },
  { char: "h", index: 1, centerDelta: -2, yDelta: 8, rotDelta: -7 },
  { char: "o", index: 2, centerDelta: -1, yDelta: -6, rotDelta: -3 },
  { char: "o", index: 3, centerDelta: 0, yDelta: 0, rotDelta: 0 },
  { char: "s", index: 4, centerDelta: 1, yDelta: 6, rotDelta: 3 },
  { char: "e", index: 5, centerDelta: 2, yDelta: -8, rotDelta: 7 },
  { char: "U", index: 6, centerDelta: 3, yDelta: 14, rotDelta: 12, isAccent: true },
] as const;

export const GLASS_TOKENS = {
  obsidianSurface: "rgba(15, 23, 42, 0.75)",
  obsidianFallback: "rgba(15, 23, 42, 0.96)",
  borderSubtle: "rgba(255, 255, 255, 0.08)",
  borderHighlight: "rgba(255, 255, 255, 0.16)",
  ambientGlowBlue: "rgba(37, 99, 235, 0.20)",
  ambientGlowCyan: "rgba(6, 182, 212, 0.12)",
  cardShadow:
    "0 24px 48px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 50px -15px rgba(37, 99, 235, 0.2)",
  fallbackShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.8)",
} as const;
