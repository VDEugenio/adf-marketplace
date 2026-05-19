/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Exact rawl.ai palette extracted from live site
        base:    '#08090f',   // page background (near-black w/ blue tint)
        raised:  '#111119',   // nav / elevated surfaces
        surface: '#1a1a26',   // cards
        'surface-hover': '#212132',
        border:  '#252535',   // subtle borders
        text: {
          primary: '#f0f0f8',
          muted:   '#7a7a9a',
          dim:     '#4a4a6a',
        },
        accent: {
          DEFAULT: '#3ecf8e',  // rawl teal — numbered badges, labels, links
          hover:   '#5adba0',
          dim:     '#3ecf8e18',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      fontWeight: {
        black: '900',
      },
      borderRadius: {
        pill: '9999px',
      },
      backgroundImage: {
        // Subtle radial glow matching rawl.ai hero
        'page-gradient': 'radial-gradient(ellipse 80% 50% at 20% 30%, #0d1526 0%, #08090f 60%)',
      },
    },
  },
  plugins: [],
}
