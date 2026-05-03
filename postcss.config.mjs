// postcss.config.mjs
// tailwind v4 dropped the old postcss plugin — use @tailwindcss/postcss instead.
// no separate tailwind.config.js either; all config lives in globals.css via @theme.

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;

