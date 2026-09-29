/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    // Fluid type: every text-* utility reads the --text-* variables from
    // globals.css (rem on desktop, vw under 768px), so headlines and body
    // scale smoothly on every viewport without per-component clamp() work.
    fontSize: {
      xs: ["var(--text-xs)", { lineHeight: "1.35" }],
      sm: ["var(--text-sm)", { lineHeight: "1.43" }],
      base: ["var(--text-base)", { lineHeight: "1.5" }],
      lg: ["var(--text-lg)", { lineHeight: "1.55" }],
      xl: ["var(--text-xl)", { lineHeight: "1.4" }],
      "2xl": ["var(--text-2xl)", { lineHeight: "1.33" }],
      "3xl": ["var(--text-3xl)", { lineHeight: "1.2" }],
      "4xl": ["var(--text-4xl)", { lineHeight: "1.1" }],
      "5xl": ["var(--text-5xl)", { lineHeight: "1.05" }],
      "6xl": ["var(--text-6xl)", { lineHeight: "1.05" }],
      "7xl": ["var(--text-7xl)", { lineHeight: "1" }],
      "8xl": ["var(--text-8xl)", { lineHeight: "1" }],
      "9xl": ["var(--text-9xl)", { lineHeight: "1" }],
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        accent: "hsl(var(--accent))",
      },
      borderRadius: {
        md: "8px",
      },
    },
  },
  plugins: [],
};
