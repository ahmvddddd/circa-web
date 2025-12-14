// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  // 1. Content: Specifies where Tailwind should look for classes to compile.
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
  // 2. Theme: Allows you to customize Tailwind's default design system.
  theme: {
    // Extend adds new values to the default theme (e.g., a custom color).
    extend: {
      colors: {
        'primary': '#1E40AF', // Example custom primary color (indigo-700 equivalent)
        'secondary': '#D97706', // Example custom secondary color (amber-700 equivalent)
      },
      spacing: {
        '18': '4.5rem', // Adds a new utility class: w-18, h-18, p-18, etc.
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  
  // 3. Plugins: Allows you to add extra utilities, base styles, or components.
  plugins: [
    require('@tailwindcss/forms'), // Example plugin for better form styling
    // require('@tailwindcss/typography'), // Common plugin for markdown rendering
  ],
  
  // 4. Prefix: Optional. Adds a prefix to all Tailwind classes (e.g., tw-bg-red-500).
  // prefix: 'tw-', 
};

export default config;