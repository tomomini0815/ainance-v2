
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: {
          DEFAULT: "var(--surface)",
          highlight: "var(--surface-highlight)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          light: "var(--primary-light)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          hover: "var(--secondary-hover)",
          light: "var(--secondary-light)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          light: "var(--accent-light)",
        },
        text: {
          main: "var(--text-main)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          disabled: "var(--text-disabled)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        success: {
          DEFAULT: "var(--success)",
          light: "var(--success-light)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          light: "var(--warning-light)",
        },
        error: {
          DEFAULT: "var(--error)",
          light: "var(--error-light)",
        },
        info: {
          DEFAULT: "var(--info)",
          light: "var(--info-light)",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'DEFAULT': 'var(--shadow)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
      },
    },
  },
  darkMode: 'class',
  plugins: [
    function ({ addComponents }) {
      addComponents({
        '.btn-primary': {
          '@apply px-4 py-2 bg-primary text-white rounded-lg font-medium shadow-sm hover:bg-primary-hover hover:shadow-md transition-all duration-200 active:scale-95': {},
        },
        '.btn-secondary': {
          '@apply px-4 py-2 bg-surface border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary-light transition-all duration-200': {},
        },
        '.btn-tertiary': {
          '@apply px-4 py-2 bg-transparent text-text-secondary rounded-lg font-medium hover:bg-surface-highlight transition-all duration-200': {},
        },
        '.btn-danger': {
          '@apply px-4 py-2 bg-error text-white rounded-lg font-medium shadow-sm transition-all duration-200 active:scale-95': {},
        },
        '.btn-success': {
          '@apply px-4 py-2 bg-success text-white rounded-lg font-medium shadow-sm transition-all duration-200 active:scale-95': {},
        },
        '.input-base': {
          '@apply w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all': {},
        },
        '.input-error': {
          '@apply border-error focus:ring-error': {},
        },
        '.input-success': {
          '@apply border-success focus:ring-success': {},
        },
        '.badge-base': {
          '@apply inline-flex items-center px-3 py-1 rounded-full text-sm font-medium': {},
        },
        '.badge-success': {
          '@apply inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-light text-success': {},
        },
        '.badge-warning': {
          '@apply inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-warning-light text-warning': {},
        },
        '.badge-error': {
          '@apply inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-error-light text-error': {},
        },
        '.badge-info': {
          '@apply inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-info-light text-info': {},
        },
        '.card-base': {
          '@apply bg-surface rounded-xl shadow-sm': {},
        },
        '.card-interactive': {
          '@apply bg-surface rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-1': {},
        },
        '.card-metric': {
          '@apply bg-surface rounded-xl shadow-sm p-6 border-l-4 hover:shadow-lg transition-shadow': {},
        },
      });
    },
  ],
}
