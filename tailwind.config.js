/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        pretendard: ['Pretendard-Regular'],
        'pretendard-medium': ['Pretendard-Medium'],
        'pretendard-semibold': ['Pretendard-SemiBold'],
        'pretendard-bold': ['Pretendard-Bold'],
        'pretendard-extrabold': ['Pretendard-ExtraBold'],
        'pretendard-black': ['Pretendard-Black'],
      },
      colors: {
        brand: {
          400: '#4655F6',
          500: '#8B2AFE',
          600: '#9423FF',
        },
        primary: {
          50: '#E1F5EE',
          100: '#9FE1CB',
          200: '#5DCAA5',
          400: '#1D9E75',
          600: '#0F6E56',
          900: '#04342C',
        },
        gray: {
          50: '#F1EFE8',
          100: '#D3D1C7',
          200: '#B4B2A9',
          400: '#888780',
          600: '#5F5E5A',
          900: '#2C2C2A',
        },
        error: {
          50: '#FCEBEB',
          100: '#F7C1C1',
          200: '#F09595',
          400: '#E24B4A',
          600: '#A32D2D',
          900: '#501313',
        },
        warning: {
          50: '#FAEEDA',
          100: '#FAC775',
          200: '#EF9F27',
          400: '#BA7517',
          600: '#854F08',
          900: '#412402',
        },
      },
    },
  },
  plugins: [],
};
