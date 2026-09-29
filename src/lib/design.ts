/**
 * Raw design values lifted from the lifeDNA Figma file. Every surface in the
 * design carries the same soft ambient shadow, and selection states reuse one
 * of three gradients, so both live here rather than being retyped per file.
 */

/** `0px 0px 4px 0px rgba(169,169,169,0.25)` on every card, field and pill. */
export const SHADOW = '0px 0px 4px rgba(169, 169, 169, 0.25)';

/**
 * The older, wider brand ramp — still on MY screens not yet moved to v4. v4's
 * 예상 성장 곡선 stroke (개선책/한달뒤) is drawn in exactly these two stops.
 */
export const GRADIENT_BRAND: readonly [string, string] = ['#4655F6', '#9423FF'];

/**
 * 홈 grades everything three ways — 좋음 / 주의 / 위험 — and both `DNAKind` and
 * `LifeDNA_WeeklyInfo_Word` colour themselves from this one trio.
 */
export type Tone = 'good' | 'warn' | 'danger';

export const TONE_TEXT: Record<Tone, string> = {
  good: '#00A172',
  warn: '#C57100',
  danger: '#F53942',
};

export const TONE_BG: Record<Tone, string> = {
  good: '#DCF7EF',
  warn: '#FCEFD8',
  danger: '#FFEAEB',
};

/**
 * The v4 redesign's colour tokens — Figma's `LifeDNA 색상` variable collection,
 * name for name. Nearly every v4 text and surface is bound to one of these, so
 * take the variable name off `get_design_context` (`var(--text/body, …)`) and
 * look it up here rather than copying the hex.
 */
export const COLOR = {
  brand: {
    pink: '#FFDFF3',
    violet: '#DCCFF8',
    periwinkle: '#D5E4FA',
    violetText: '#7A55D8',
    pinkText: '#B04FB0',
    selected: '#FAE0F3',
  },
  surface: {
    bg: '#F6F3FA',
    card: '#FFFFFF',
    chip: '#F3EFFA',
    tint: '#F8EEFA',
    tint2: '#EFE6FB',
    track: '#E6E0F2',
  },
  border: { soft: '#E9E3F5' },
  calendar: { level1: '#F5EFFC', level2: '#E4D9F8' },
  text: {
    heading: '#2E2545',
    strong: '#1F1B2E',
    body: '#6B6680',
    muted: '#9A95AB',
    plum: '#5A3D8A',
    onPastel: '#4A3780',
  },
} as const;

/** v4's `0px 0px 3.846px` ambient shadow — the old `SHADOW`, rescaled 220/390. */
export const SHADOW_V4 = '0px 0px 3.846px rgba(169, 169, 169, 0.25)';

/** v4 ButtonNextUI: pink → lavender → periwinkle at CSS 166.3°. */
export const GRADIENT_PASTEL = {
  colors: ['#FFDFF3', '#EDDEFA', '#D5E4FA'] as const,
  locations: [0.39435, 0.66925, 0.94414] as const,
  angle: 166.3185637562333,
};
