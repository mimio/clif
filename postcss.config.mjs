// Tailwind runs as a PostCSS plugin; Turbopack picks this file up on its own.
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
