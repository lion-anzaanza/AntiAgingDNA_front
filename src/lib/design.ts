/**
 * Raw design values lifted from the lifeDNA Figma file — shadows, gradients,
 * tones and the v4 colour tokens — so they live here rather than being retyped
 * per file. v4 surfaces carry `SHADOW_V4` and pastel fills use
 * `GRADIENT_PASTEL`; the older `SHADOW` and `GRADIENT_BRAND` remain only where
 * v4 still draws them.
 */

/**
 * `0px 0px 4px 0px rgba(169,169,169,0.25)` — the pre-v4 ambient shadow. v4
 * keeps it only on 홈's cards and the WHO-5 Likert cards; everything else is
 * `SHADOW_V4`.
 */
export const SHADOW = '0px 0px 4px rgba(169, 169, 169, 0.25)';

/**
 * The older, wider brand ramp. No screen fills with it any more; v4's 예상 성장
 * 곡선 stroke (개선책/한달뒤) is drawn in exactly these two stops.
 */
export const GRADIENT_BRAND: readonly [string, string] = ['#4655F6', '#9423FF'];

/**
 * 홈 grades everything three ways — 좋음 / 주의 / 위험 — and both `DNAKind` and
 * `LifeDNA_WeeklyInfo_Word` colour themselves from this one trio.
 */
export type Tone = 'good' | 'warn' | 'danger';

export const TONE_TEXT: Record<Tone, string> = {
  // v3 darkened 좋음 from #00A172 — every v3 green word (홈, 주간 리포트, 한달뒤) is this.
  good: '#007D59',
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
 *
 * Values are the collection's default `Pink` mode, which is what v3 (the final
 * design, 2026-10-01) uses. Three moved after the v4 copy — violet-text, bg and
 * muted all darkened — and `brand/accent` · `icon/primary` are new.
 */
export const COLOR = {
  brand: {
    pink: '#FFDFF3',
    violet: '#DCCFF8',
    periwinkle: '#D5E4FA',
    violetText: '#6642C4',
    pinkText: '#B04FB0',
    selected: '#FAE0F3',
    accent: '#A88DEB',
  },
  surface: {
    bg: '#FBF9FD',
    card: '#FFFFFF',
    chip: '#F3EFFA',
    tint: '#F8EEFA',
    tint2: '#EFE6FB',
    track: '#E6E0F2',
  },
  border: { soft: '#E9E3F5' },
  calendar: { level1: '#F5EFFC', level2: '#E4D9F8' },
  icon: { primary: '#9C7BE6' },
  text: {
    heading: '#2E2545',
    strong: '#1F1B2E',
    body: '#6B6680',
    muted: '#726D86',
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

/**
 * v3's fill for anything that shows *progress*. In use: the 회원가입 step bar,
 * 홈's page dots and weekly progress bars. v3 draws the 0–10 slider fill, the
 * calendar legend and 개선책's 실천 bar in it too — those still use
 * `GRADIENT_PASTEL` and switch over in the 일지·개선책 tab work (not yet).
 * The same stops as `GRADIENT_PASTEL`, more saturated; buttons, banners and
 * chips keep the pastel one. Angles are per box, as with the pastel ramp.
 */
export const GRADIENT_PROGRESS = {
  colors: ['#F6B8DF', '#C7B2F3', '#A8C0F2'] as const,
  locations: GRADIENT_PASTEL.locations,
};
