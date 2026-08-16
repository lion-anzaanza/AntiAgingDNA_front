/**
 * The answer sets for 일지. 오늘의 기록 and 상세보기 ask the same questions — the
 * card titles differ (오늘 vs 이날) but the options are identical — so they live
 * here rather than being kept in step by hand.
 *
 * These are display labels. Mapping them onto `DiaryRequest`'s enums is in
 * `docs/backend-api.md`, and every one of them has been checked against
 * `/v3/api-docs` — the four that used to disagree are fixed below.
 */
export const SLEEP_ONSET = ['5분 이내', '15분 이내', '30분 이내', '1시간 이상'];
export const MEAL_COUNT = ['0끼', '1끼', '2끼', '3끼', '4끼', '5끼 +'];
export const JUNK_FOOD = ['0회', '1~2회', '3회 이상'];
export const CAFFEINE_CUPS = ['0잔', '1~2잔', '3~4잔', '5잔 이상'];
export const CAFFEINE_TIME = ['안 마심', '오전', '오후 (~5시)', '저녁 (6시 이후)'];
/** Figma sizes these four to their text rather than to an even grid. */
export const CAFFEINE_TIME_WIDTH = [27, 27, 39, 46];
export const WATER = ['2잔 이하', '3~5잔', '6~7잔', '8잔 이상'];
export const DID_EXERCISE = ['네', '아니요'];
export const EXERCISE_MINUTES = ['15분 이하', '30분', '1시간', '1시간 이상'];
/** `STRENGTH_AND_AEROBIC`; the API has no `OTHER`, so 기타 had nothing to map to. */
export const EXERCISE_KIND = ['걷기', '유산소', '근력', '근력+유산소'];
/**
 * `UNDER_30` / `THIRTY_TO_60` / `ONE_TO_TWO_HOURS` / `OVER_2_HOURS`. Figma's
 * middle two read 1시간 and 2시간, which name the boundary rather than the band
 * — the backlog caught the second (item 9) and the third turned up in the same
 * pass.
 */
export const WALKED = ['30분 이하', '30분~1시간', '1~2시간', '2시간 이상'];
export const SAT = ['4시간 이하', '4~8시간', '8~10시간', '10시간 이상'];
export const SCREEN_TIME = ['2시간 이하', '2~4시간', '4~6시간', '6시간 이상'];
export const MOOD_RECOVERY = ['안 함', '잠깐', '충분히'];
export const MET_PEOPLE = ['거의 안 만남', '잠깐', '여러 번·길게'];

export const JUNK_FOOD_CAPTION = '기준 : 패스트푸드·디저트·가당음료 각 1건 = 1회';
export const WATER_CAPTION = '1잔 ≈ 200ml';
export const CAFFEINE_CAPTION = '커피·에너지드링크·차 등';
export const CAFFEINE_TIME_CAPTION = '취침 6시간 전 섭취는 수면을 방해해요';
export const MOOD_RECOVERY_CAPTION = '산책·취미·대화 등 기분을 회복하는 활동';
export const MET_PEOPLE_CAPTION = '대면·통화·영상 모두 포함';

/** Space above a section heading, below it, and between consecutive cards. */
export const SECTION_GAP = 13;
export const HEADING_GAP = 6;
export const CARD_GAP = 5;
