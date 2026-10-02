import { describe, expect, it } from '@jest/globals';

import {
  dayComment,
  dayOverDayLine,
  hoursLabel,
  orbCopy,
  profileLabel,
  recordedDaysLabel,
  scoreCaption,
  sleepCaption,
  waterCaption,
} from './facts';
import { type AreaScores } from './score';

/**
 * The interim sentence rules (2026-10-02). The point they all share: a line
 * only states numbers that exist, and a missing number drops the line rather
 * than printing a zero.
 */
describe('orbCopy', () => {
  it('describes the colour the orb artwork actually is', () => {
    expect(orbCopy('GOOD_LOW')?.colour).toBe('푸른빛');
    expect(orbCopy('DANGER_HIGH')?.colour).toBe('붉은빛');
    expect(orbCopy('WARN_HIGH')?.colour).toBe('초록빛');
  });

  it('follows the grade the state belongs to', () => {
    expect(orbCopy('GOOD_HIGH')).toMatchObject({ tone: 'good', chip: '안정적으로 성장 중' });
    expect(orbCopy('WARN_LOW')).toMatchObject({ tone: 'warn', lead: '컨디션이 조금 떨어져' });
    expect(orbCopy('DANGER_LOW')).toMatchObject({ tone: 'danger', chip: '회복이 필요해요' });
  });

  it('says nothing without a state, rather than Figma\'s 좋음 copy', () => {
    expect(orbCopy(null)).toBeNull();
    expect(orbCopy(undefined)).toBeNull();
  });
});

describe('captions', () => {
  it('averages only the days that have sleep', () => {
    expect(sleepCaption([420, null, 480, null, null, null, null])).toBe('최근 7일 평균 7.5시간\n2일 기록');
    expect(sleepCaption([null, null])).toBe('');
  });

  it('reports water as the latest band, never a mean', () => {
    expect(waterCaption(['3~5잔', null, '8잔 이상'])).toBe('최근 3일 중 2일 기록\n가장 최근 8잔 이상');
    expect(waterCaption([null])).toBe('');
  });

  it('rounds an area mean and counts its days', () => {
    expect(scoreCaption([70, 81.5, null])).toBe('최근 3일 평균 76점\n2일 기록');
    expect(scoreCaption([])).toBe('');
  });

  it('formats hours to one decimal', () => {
    expect(hoursLabel(435)).toBe('7.3시간');
    expect(hoursLabel(450)).toBe('7.5시간');
  });
});

describe('dayOverDayLine', () => {
  it('writes Figma\'s sentence when both halves exist', () => {
    expect(
      dayOverDayLine({ sleepMinutes: 450, stressLevel: 3 }, { sleepMinutes: 410, stressLevel: 4 }),
    ).toBe('어제보다 수면 +40분 · 스트레스 −1');
  });

  it('drops a half that either day did not answer', () => {
    expect(dayOverDayLine({ sleepMinutes: null, stressLevel: 3 }, { sleepMinutes: 400, stressLevel: 3 })).toBe(
      '어제보다 스트레스 0',
    );
    expect(dayOverDayLine({ stressLevel: 3 }, undefined)).toBe('');
  });

  it('compares a real 0 stress, which is an answer since backlog 7', () => {
    expect(dayOverDayLine({ stressLevel: 0 }, { stressLevel: 2 })).toBe('어제보다 스트레스 −2');
  });
});

describe('dayComment', () => {
  const areas: AreaScores = {
    physical: 58.79,
    mental: 75.75,
    emotion: null,
    social: 100,
    environment: null,
    grades: { physical: 'WARN', mental: 'GOOD', emotion: null, social: 'GOOD', environment: null },
  };

  it('gives the change from the day before and the lowest area', () => {
    expect(dayComment(73.69, 67.6, areas)).toBe('전날보다 +6점\n가장 낮은 영역: 신체 59점');
  });

  it('skips null areas when finding the lowest', () => {
    expect(dayComment(73.69, null, areas)).toBe('가장 낮은 영역: 신체 59점');
  });

  it('is empty for a day with no entry', () => {
    expect(dayComment(null, 70, areas)).toBe('');
  });
});

describe('profileLabel', () => {
  it('joins the sleep type and the highest sensitivity', () => {
    expect(
      profileLabel({ sleepType: 'EVENING', sensitivity: { sugar: 'SLIGHT', caffeine: 'HIGH', stress: 'MODERATE' } }),
    ).toBe('저녁형 - 고민감');
    expect(
      profileLabel({ sleepType: 'MORNING', sensitivity: { sugar: 'NONE', caffeine: 'SLIGHT', stress: 'NONE' } }),
    ).toBe('아침형 - 저민감');
  });

  it('never invents Figma\'s third word', () => {
    expect(profileLabel({ sleepType: 'NORMAL', sensitivity: { sugar: 'MODERATE' } })).toBe('일반형 - 중민감');
  });

  it('is null without a diagnosis', () => {
    expect(profileLabel(undefined)).toBeNull();
    expect(profileLabel({ sleepType: null })).toBeNull();
  });
});

describe('recordedDaysLabel', () => {
  it('marks a full window as a floor', () => {
    expect(recordedDaysLabel(31)).toBe('31일');
    expect(recordedDaysLabel(366)).toBe('366일+');
  });
});
