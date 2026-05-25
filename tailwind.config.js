/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./react.html', './app.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Plus Jakarta Sans é a fonte principal; Bebas Neue Pro fica como
        // fallback semantico apenas para componentes que ainda referenciam
        // explicitamente font-display antigo (nao ha necessidade de remove-los).
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        number: ['Plus Jakarta Sans', 'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif']
      },
      colors: {
        finance: {
          bg:          'rgb(var(--finance-bg) / <alpha-value>)',
          // novo token semantico para superficies de cards/paineis -
          // permite que componentes deixem de hard-codear bg-white/dark:bg-slate-900
          surface:     'rgb(var(--finance-surface) / <alpha-value>)',
          text:        'rgb(var(--finance-text) / <alpha-value>)',
          muted:       'rgb(var(--finance-muted) / <alpha-value>)',
          border:      'rgb(var(--finance-border) / <alpha-value>)',
          blue:        'rgb(var(--finance-blue) / <alpha-value>)',
          green:       'rgb(var(--finance-green) / <alpha-value>)',
          red:         'rgb(var(--finance-red) / <alpha-value>)',
          yellow:      'rgb(var(--finance-yellow) / <alpha-value>)',
          accent:      'rgb(var(--finance-accent) / <alpha-value>)',
          'accent-bg': 'rgb(var(--finance-accent-bg) / <alpha-value>)'
        }
      }
    }
  },
  plugins: []
};
