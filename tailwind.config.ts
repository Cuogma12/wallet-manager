import type { Config } from 'tailwindcss';
import { colors, radii, spacing } from './src/shared/constants/theme';

export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      boxShadow: {
        card: '0px 1px 2px rgba(0,0,0,0.05)',
        floating: '0px 5px 10px rgba(23,63,53,0.25)',
      },
      spacing: Object.fromEntries(
        Object.entries(spacing).map(([key, value]) => [key, `${value}px`]),
      ),
      borderRadius: Object.fromEntries(
        Object.entries(radii).map(([key, value]) => [key, `${value}px`]),
      ),
    },
  },
  plugins: [],
} satisfies Config;
