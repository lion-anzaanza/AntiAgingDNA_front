import { describe, expect, it } from '@jest/globals';

import { isNickname } from './sign-up-form';

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
