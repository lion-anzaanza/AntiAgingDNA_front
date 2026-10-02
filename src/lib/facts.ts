import { type Tone } from '@/lib/design';
import { type AreaScores, type Grade, type OrbState } from '@/lib/score';

/**
 * Every sentence and label the app writes from server numbers, in one place.
 *
 * The server writes no sentences (backlog 27), and 기획 has not settled the
 * rules for them. These are the **interim rules the owner chose on
 * 2026-10-02**: state only what the numbers say — a difference, a mean, a
 * count, the lowest value — and never interpret ("흐린 날 컨디션이 낮아져요").
 * Each rule is listed for 기획 in `docs/frontend-status.md` (45), so replacing
 * one means editing it here and nowhere else.
 */

const TONE_OF: Record<Grade, Tone> = { GOOD: 'good', WARN: 'warn', DANGER: 'danger' };

export function toneFor(grade: Grade | null | undefined): Tone | null {
  return grade ? TONE_OF[grade] : null;
}

/** `435` → `7.3시간`, Figma's one-decimal form. */
export function hoursLabel(minutes: number): string {
  return `${(minutes / 60).toFixed(1)}시간`;
}

/** A signed difference: `+40`, `−1` (U+2212, as Figma writes it), `0`. */
function signed(n: number): string {
  if (n > 0) return `+${n}`;
  if (n < 0) return `−${Math.abs(n)}`;
  return '0';
}

/* ------------------------------------------------------------------------- *
 * 홈 · 오브 카드
 * ------------------------------------------------------------------------- */

/**
 * The colour each of the seven orb bitmaps actually is, read off the artwork
 * (`assets/images/home/orb-*.png`), so the sentence describes the orb on screen.
 */
const ORB_COLOUR: Record<OrbState, string> = {
  DANGER_LOW: '회색',
  DANGER_HIGH: '붉은빛',
  WARN_LOW: '노란빛',
  WARN_HIGH: '초록빛',
  GOOD_LOW: '푸른빛',
  GOOD_MID: '분홍빛',
  GOOD_HIGH: '파스텔빛',
};

/** The state chip: Figma's 좋음 wording, one wording per grade below it. */
const ORB_CHIP: Record<Grade, string> = {
  GOOD: '안정적으로 성장 중',
  WARN: '주의가 필요해요',
  DANGER: '회복이 필요해요',
};

/** How the sentence opens, per grade — Figma's "컨디션이 좋아" for GOOD. */
const ORB_LEAD: Record<Grade, string> = {
  GOOD: '컨디션이 좋아',
  WARN: '컨디션이 조금 떨어져',
  DANGER: '컨디션이 많이 떨어져',
};

function orbGrade(state: OrbState): Grade {
  return state.split('_')[0] as Grade;
}

/**
 * The chip and the sentence under the orb. `null` while there is no state to
 * describe — the card then draws neither rather than Figma's 좋음 copy.
 */
export function orbCopy(state: OrbState | null | undefined): {
  chip: string;
  tone: Tone;
  lead: string;
  colour: string;
} | null {
  if (!state) return null;
  const grade = orbGrade(state);
  return {
    chip: ORB_CHIP[grade],
    tone: TONE_OF[grade],
    lead: ORB_LEAD[grade],
    colour: ORB_COLOUR[state],
  };
}

/* ------------------------------------------------------------------------- *
 * 홈 · 나의 LifeDNA 정보 captions
 * ------------------------------------------------------------------------- */

/** `최근 7일 평균 7.3시간\n6일 기록` — `''` when no day has a value. */
export function sleepCaption(minutes: (number | null)[]): string {
  const present = minutes.filter((m): m is number => m !== null);
  if (present.length === 0) return '';
  const mean = present.reduce((sum, m) => sum + m, 0) / present.length;
  return `최근 ${minutes.length}일 평균 ${hoursLabel(mean)}\n${present.length}일 기록`;
}

/**
 * `최근 7일 중 6일 기록\n가장 최근 8잔 이상`. Water is a cup *band*, so there is
 * no mean to take (backlog 26) — the latest answer is the fact to show.
 */
export function waterCaption(bands: (string | null)[]): string {
  const present = bands.filter((b): b is string => b !== null);
  if (present.length === 0) return '';
  return `최근 ${bands.length}일 중 ${present.length}일 기록\n가장 최근 ${present[present.length - 1]}`;
}

/** `최근 7일 평균 76점\n6일 기록` — for an area's own daily score. */
export function scoreCaption(scores: (number | null)[]): string {
  const present = scores.filter((s): s is number => s !== null);
  if (present.length === 0) return '';
  const mean = Math.round(present.reduce((sum, s) => sum + s, 0) / present.length);
  return `최근 ${scores.length}일 평균 ${mean}점\n${present.length}일 기록`;
}

/* ------------------------------------------------------------------------- *
 * 일지 · 그래프 요약, 캘린더 코멘트
 * ------------------------------------------------------------------------- */

type DayFacts = { sleepMinutes?: number | null; stressLevel?: number | null };

/**
 * Figma's `어제보다 수면 +40분 · 스트레스 −1`, built from whichever of the two
 * both days answered. `''` when neither can be compared.
 */
export function dayOverDayLine(today: DayFacts | undefined, yesterday: DayFacts | undefined): string {
  const parts: string[] = [];
  if (today?.sleepMinutes != null && yesterday?.sleepMinutes != null) {
    parts.push(`수면 ${signed(today.sleepMinutes - yesterday.sleepMinutes)}분`);
  }
  if (today?.stressLevel != null && yesterday?.stressLevel != null) {
    parts.push(`스트레스 ${signed(today.stressLevel - yesterday.stressLevel)}`);
  }
  return parts.length === 0 ? '' : `어제보다 ${parts.join(' · ')}`;
}

export const AREA_LABEL: Record<keyof AreaScores['grades'], string> = {
  physical: '신체',
  mental: '정신',
  emotion: '감정',
  social: '사회',
  environment: '환경',
};

/**
 * 캘린더's 2-line comment for one day: the change from the day before and the
 * lowest-scoring area. Each line appears only if its numbers exist.
 */
export function dayComment(
  total: number | null,
  previousTotal: number | null,
  areas: AreaScores | undefined,
): string {
  const lines: string[] = [];
  if (total !== null && previousTotal !== null) {
    lines.push(`전날보다 ${signed(Math.round(total) - Math.round(previousTotal))}점`);
  }
  if (total !== null && areas) {
    const scored = (Object.keys(AREA_LABEL) as (keyof typeof AREA_LABEL)[])
      .map((key) => ({ key, score: areas[key] }))
      .filter((area): area is { key: keyof typeof AREA_LABEL; score: number } => area.score !== null);
    if (scored.length > 0) {
      const lowest = scored.reduce((low, area) => (area.score < low.score ? area : low));
      lines.push(`가장 낮은 영역: ${AREA_LABEL[lowest.key]} ${Math.round(lowest.score)}점`);
    }
  }
  return lines.join('\n');
}

/* ------------------------------------------------------------------------- *
 * MY
 * ------------------------------------------------------------------------- */

/** The survey's own words for `sleepType`, as the user picked them. */
const SLEEP_TYPE_LABEL: Record<string, string> = {
  MORNING: '아침형',
  EVENING: '저녁형',
  NORMAL: '일반형',
  SENSITIVE: '예민형',
};

const SENSITIVITY_RANK = ['NONE', 'SLIGHT', 'MODERATE', 'HIGH'] as const;
const SENSITIVITY_LABEL: Record<(typeof SENSITIVITY_RANK)[number], string> = {
  NONE: '저민감',
  SLIGHT: '저민감',
  MODERATE: '중민감',
  HIGH: '고민감',
};

/**
 * Figma's `올빼미 - 고민감 - 누적형`, from `/api/dna`: the sleep type, then the
 * *highest* of the three sensitivities. Figma's third word (누적형) has no
 * field that defines it, so it is left out rather than guessed. `null` when the
 * diagnosis is missing.
 */
export function profileLabel(
  dna: { sleepType?: string | null; sensitivity?: Record<string, string | null> | null } | undefined,
): string | null {
  if (!dna?.sleepType || !SLEEP_TYPE_LABEL[dna.sleepType]) return null;
  const levels = Object.values(dna.sensitivity ?? {})
    .map((level) => SENSITIVITY_RANK.indexOf(level as (typeof SENSITIVITY_RANK)[number]))
    .filter((rank) => rank >= 0);
  if (levels.length === 0) return SLEEP_TYPE_LABEL[dna.sleepType];
  const top = SENSITIVITY_RANK[Math.max(...levels)];
  return `${SLEEP_TYPE_LABEL[dna.sleepType]} - ${SENSITIVITY_LABEL[top]}`;
}

/**
 * 데이터 개인정보's 기록한 날. `/api/diaries` answers at most 366 days, so a
 * count that fills the whole window may be short — it reads `366일+`.
 */
export const RECORD_WINDOW_DAYS = 366;

export function recordedDaysLabel(count: number): string {
  return count >= RECORD_WINDOW_DAYS ? `${RECORD_WINDOW_DAYS}일+` : `${count}일`;
}

