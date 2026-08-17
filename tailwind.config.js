/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      /*
       * **Only `fontFamily` lives here.** A `colors` scale used to sit beside
       * it and was deleted on 2026-08-17: nothing in `src` referenced it — not
       * one `text-primary-900` — and several of its values disagreed with
       * Figma (`primary.900` `#04342C` vs `#00352C`, `gray.100` `#D3D1C7` vs
       * `#D3D1C6`, `gray.400` `#888780` vs `#88877F`). So reaching for those
       * classes silently produced a slightly wrong colour.
       *
       * Colour comes from `src/lib/design.ts` and explicit hex taken off the
       * Figma node. Do not reintroduce a palette here — a second source of
       * truth for colour is how the drift happened in the first place.
       */
      fontFamily: {
        'pretendard-light': ['Pretendard-Light'],
        pretendard: ['Pretendard-Regular'],
        'pretendard-medium': ['Pretendard-Medium'],
        'pretendard-semibold': ['Pretendard-SemiBold'],
        'pretendard-bold': ['Pretendard-Bold'],
        'pretendard-extrabold': ['Pretendard-ExtraBold'],
        'pretendard-black': ['Pretendard-Black'],
      },
    },
  },
  plugins: [],
};
