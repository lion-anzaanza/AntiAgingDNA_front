import { describe, expect, it } from '@jest/globals';

import {
  toDiaryDraft,
  toDiaryRequest,
  type DiaryAnswers,
  type DiaryFields,
} from './diary-request';

/**
 * `PUT /api/diaries/{date}` **replaces** the entry, so 오늘의 기록 loads the day,
 * fills the form, and writes the whole thing back. That makes
 * `toDiaryDraft → toDiaryRequest` a round trip, and a single label that fails to
 * survive it is a field the user silently loses. That is the bug these tests
 * exist for; it shipped once already.
 */
const FULL: DiaryAnswers = {
  condition: 4,
  sleepOnset: '15분 이내',
  sleepFeel: 3,
  meals: '3끼',
  junkFood: '1~2회',
  caffeineCups: '1~2잔',
  caffeineTime: '오전',
  water: '3~5잔',
  didExercise: '네',
  exerciseMinutes: '30분',
  exerciseKind: '걷기',
  walked: '30분~1시간',
  sat: '4~8시간',
  stress: 6,
  screenTime: '2~4시간',
  moodRecovery: '잠깐',
  metPeople: '잠깐',
};

/** What the server hands back for that same day. */
const SAVED: DiaryFields = {
  conditionLevel: 4,
  sleepLatency: 'WITHIN_15',
  sleepSatisfaction: 3,
  mealCount: 3,
  sugarIntake: 'ONE_TO_TWO',
  caffeineCups: 'ONE_TO_TWO',
  caffeineLastTime: 'MORNING',
  waterIntake: 'THREE_TO_FIVE',
  exercised: true,
  exerciseDuration: 'ABOUT_30',
  exerciseType: 'WALKING',
  walkDuration: 'THIRTY_TO_60',
  sittingHours: 'FOUR_TO_EIGHT',
  stressLevel: 6,
  screenTime: 'TWO_TO_FOUR',
  moodRecovery: 'BRIEF',
  socialContact: 'BRIEF',
};

describe('toDiaryRequest', () => {
  it('maps every answered field to its enum', () => {
    expect(toDiaryRequest(FULL)).toEqual(SAVED);
  });

  it('omits unanswered fields rather than sending null', () => {
    const request = toDiaryRequest({ ...FULL, water: null, exerciseKind: null });
    expect('waterIntake' in request).toBe(false);
    expect('exerciseType' in request).toBe(false);
    // The one required field is still there.
    expect(request.conditionLevel).toBe(4);
  });

  it('never sends 취침·기상 시각 — the screen cannot collect them (backlog 29)', () => {
    const request = toDiaryRequest(FULL) as Record<string, unknown>;
    expect('sleepStartedAt' in request).toBe(false);
    expect('sleepEndedAt' in request).toBe(false);
  });

  it('omits stressLevel 0, which the server still rejects (backlog 7)', () => {
    const request = toDiaryRequest({ ...FULL, stress: 0 });
    expect('stressLevel' in request).toBe(false);
    // 1 is legal and must survive.
    expect(toDiaryRequest({ ...FULL, stress: 1 }).stressLevel).toBe(1);
  });

  it('throws on a label it does not know, instead of dropping it', () => {
    // A silently dropped answer is how a renamed Figma option goes unnoticed.
    expect(() => toDiaryRequest({ ...FULL, water: '2리터' })).toThrow(/수분 섭취량/);
  });
});

describe('toDiaryDraft', () => {
  it('turns a saved entry back into the screen’s labels', () => {
    expect(toDiaryDraft(SAVED)).toEqual(FULL);
  });

  it('reads an empty entry as an untouched form', () => {
    const draft = toDiaryDraft({});
    expect(draft.condition).toBeNull();
    expect(draft.water).toBeNull();
    expect(draft.stress).toBe(0);
  });

  it('treats an out-of-range level as unanswered rather than crashing', () => {
    expect(toDiaryDraft({ conditionLevel: 9 }).condition).toBeNull();
    expect(toDiaryDraft({ sleepSatisfaction: 0 }).sleepFeel).toBeNull();
  });

  it('maps both booleans of 오늘 운동했나요', () => {
    expect(toDiaryDraft({ exercised: true }).didExercise).toBe('네');
    expect(toDiaryDraft({ exercised: false }).didExercise).toBe('아니요');
    expect(toDiaryDraft({}).didExercise).toBeNull();
  });

  it('maps 0끼, which is falsy and must not read as missing', () => {
    expect(toDiaryDraft({ mealCount: 0 }).meals).toBe('0끼');
  });
});

describe('round trip', () => {
  it('survives save → reload → save without losing a field', () => {
    const reloaded = toDiaryDraft(SAVED);
    // The form only becomes submittable once 컨디션 is answered.
    expect(reloaded.condition).not.toBeNull();
    const rewritten = toDiaryRequest(reloaded as DiaryAnswers);
    expect(rewritten).toEqual(SAVED);
  });

  it('survives a half-filled day', () => {
    const partial: DiaryFields = {
      conditionLevel: 2,
      sleepLatency: 'OVER_60',
      waterIntake: 'UNDER_2',
    };
    const rewritten = toDiaryRequest(toDiaryDraft(partial) as DiaryAnswers);
    expect(rewritten).toEqual(partial);
  });

  it('keeps every 0-ish enum position through the trip', () => {
    const edges: DiaryFields = {
      conditionLevel: 1,
      mealCount: 0,
      sugarIntake: 'NONE',
      caffeineCups: 'NONE',
      caffeineLastTime: 'NONE',
      moodRecovery: 'NONE',
      socialContact: 'RARELY',
      exercised: false,
      stressLevel: 1,
    };
    expect(toDiaryRequest(toDiaryDraft(edges) as DiaryAnswers)).toEqual(edges);
  });
});
