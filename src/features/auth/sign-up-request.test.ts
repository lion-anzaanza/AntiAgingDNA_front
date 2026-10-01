import { describe, expect, it } from '@jest/globals';

import type { SignUpForm } from './sign-up-form';
import { toSignUpRequest } from './sign-up-request';

/**
 * 회원가입/1 collects 성별, 직업 and a full 년/월/일 date because v3 draws them
 * (owner's decision, 2026-10-01), but the server stores only `birthYear`
 * (backlog 13). This pins that the extra answers never reach the wire — a rule
 * that only lives in a comment gets edited away.
 */
const FULL_FORM: SignUpForm = {
  loginId: ' anza01 ',
  nickname: '안자',
  email: 'a@b.co',
  password: 'abcd1234',
  passwordConfirm: 'abcd1234',
  birthYear: '1999',
  birthMonth: '12',
  birthDay: '24',
  gender: '여성',
  job: '학생',

  sleepType: '아침형',
  sleepQuality: ['낮에 졸림이 잦아요'],
  sugarSensitivity: '약간',
  caffeineSensitivity: '보통',
  stressSensitivity: '매우',
  exercise: '주 150분 미만',
  workType: ['해당없음'],
  drink: '월 1회 이하',
  smoking: '비흡연',
  lifeRhythm: '대체로 규칙적이에요',
  socialFrequency: null,
  mood: {},

  agreed: { service: true, sensitive: true, marketing: false, age: true },
};

describe('toSignUpRequest', () => {
  it('sends the birth year as a number', () => {
    expect(toSignUpRequest(FULL_FORM).birthYear).toBe(1999);
  });

  it('never sends 성별, 직업 or the birth month and day', () => {
    const request = toSignUpRequest(FULL_FORM) as unknown as Record<string, unknown>;
    const wire = JSON.stringify(request);
    for (const key of ['gender', 'job', 'birthMonth', 'birthDay']) {
      expect(request).not.toHaveProperty(key);
      expect(request.diagnosis).not.toHaveProperty(key);
    }
    // Nor the answers themselves, under any key.
    for (const value of ['여성', '학생']) {
      expect(wire).not.toContain(value);
    }
  });
});
