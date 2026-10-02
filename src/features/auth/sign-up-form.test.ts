import { describe, expect, it } from '@jest/globals';

import {
  isBirthDate,
  isNickname,
  isPassword,
  isPersonalInfoComplete,
  type SignUpForm,
} from './sign-up-form';

/**
 * The server's own rule, pinned here because it arrived late (backlog 19) and a
 * client that is looser than the server hands the user a 400 three screens
 * after the field they got wrong.
 */
describe('isNickname', () => {
  it('accepts Hangul, Latin and digits within 2–16', () => {
    for (const ok of ['안자', 'anza', 'anza01', '안자01', 'a1', '가'.repeat(16)]) {
      expect(isNickname(ok)).toBe(true);
    }
  });

  it('rejects anything shorter than 2 or longer than 16', () => {
    expect(isNickname('a')).toBe(false);
    expect(isNickname('가')).toBe(false);
    expect(isNickname('')).toBe(false);
    expect(isNickname('가'.repeat(17))).toBe(false);
  });

  it('rejects spaces and separators, rather than trimming them away', () => {
    for (const bad of ['안자 님', 'an za', ' 안자', '안자 ', 'an-za', 'an_za', 'an.za']) {
      expect(isNickname(bad)).toBe(false);
    }
  });

  it('rejects emoji and Hangul jamo, which the pattern excludes', () => {
    expect(isNickname('안자🙂')).toBe(false);
    expect(isNickname('ㅇㅈ')).toBe(false);
  });
});

/** Backlog 37 — the spec's rule, so a weak password stops at STEP 1, not at 가입. */
describe('isPassword', () => {
  it('accepts 8–72 characters with a letter and a digit', () => {
    for (const ok of ['abcd1234', 'A1234567', '1234567a', 'abc!@#12', '비밀번호abc123', 'a1'.repeat(36)]) {
      expect(isPassword(ok)).toBe(true);
    }
  });

  it('rejects anything shorter than 8 or longer than 72', () => {
    expect(isPassword('abc1234')).toBe(false);
    expect(isPassword('a1'.repeat(36) + 'a')).toBe(false);
  });

  it('needs both a Latin letter and a digit', () => {
    expect(isPassword('abcdefgh')).toBe(false);
    expect(isPassword('12345678')).toBe(false);
    // Hangul is not a Latin letter.
    expect(isPassword('비밀번호12345')).toBe(false);
  });
});

describe('isBirthDate', () => {
  it('accepts a real past date, with or without a leading zero', () => {
    expect(isBirthDate('1999', '12', '24')).toBe(true);
    expect(isBirthDate('1999', '1', '5')).toBe(true);
    expect(isBirthDate('2000', '02', '29')).toBe(true);
  });

  it('rejects days the month does not have', () => {
    expect(isBirthDate('1999', '2', '29')).toBe(false);
    expect(isBirthDate('1999', '4', '31')).toBe(false);
    expect(isBirthDate('1999', '13', '1')).toBe(false);
    expect(isBirthDate('1999', '0', '1')).toBe(false);
    expect(isBirthDate('1999', '1', '0')).toBe(false);
  });

  it('rejects a partial date, a year before 1900 and the future', () => {
    expect(isBirthDate('1999', '', '24')).toBe(false);
    expect(isBirthDate('99', '12', '24')).toBe(false);
    expect(isBirthDate('1899', '12', '31')).toBe(false);
    expect(isBirthDate(String(new Date().getFullYear() + 1), '1', '1')).toBe(false);
  });
});

/**
 * 성별·직업 are not sent (backlog 13) but v3 asks them, so an unanswered one
 * must still keep 다음 disabled.
 */
describe('isPersonalInfoComplete', () => {
  const filled = {
    loginId: 'anza01',
    nickname: '안자',
    email: 'a@b.co',
    password: 'abcd1234',
    passwordConfirm: 'abcd1234',
    birthYear: '1999',
    birthMonth: '12',
    birthDay: '24',
    gender: '여성',
    job: '학생',
  } as SignUpForm;

  it('passes a fully answered step', () => {
    expect(isPersonalInfoComplete(filled)).toBe(true);
  });

  it('blocks on a password the server would refuse', () => {
    expect(isPersonalInfoComplete({ ...filled, password: 'abcdefgh', passwordConfirm: 'abcdefgh' })).toBe(false);
  });

  it('blocks on a missing 성별, 직업 or an impossible date', () => {
    expect(isPersonalInfoComplete({ ...filled, gender: null })).toBe(false);
    expect(isPersonalInfoComplete({ ...filled, job: null })).toBe(false);
    expect(isPersonalInfoComplete({ ...filled, birthDay: '31', birthMonth: '2' })).toBe(false);
  });
});
