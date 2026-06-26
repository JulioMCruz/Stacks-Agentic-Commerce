export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#5546FF", // Stacks purple
          700: "#3B2BD1",
          600: "#4836E6",
          500: "#5546FF",
          400: "#7C6CFF",
          300: "#A99EFF",
        },
        bitcoin: { DEFAULT: "#F7931A", 400: "#FFA940" },
        ink: {
          950: "#08090F",
          900: "#0B0D14",
          850: "#0F121B",
          800: "#141823",
          700: "#1B2030",
        },
        mist: {
          DEFAULT: "#E8E9F2",
          100: "#E8E9F2",
          300: "#A6AABC",
          500: "#71768A",
        },
      },
      fontFamily: {
        sans: ['Satoshi', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 10px 34px -16px rgba(0,0,0,0.7)",
        glow: "0 0 0 1px rgba(85,70,255,0.30), 0 18px 50px -18px rgba(85,70,255,0.55)",
      },
      maxWidth: { content: "1180px" },
    },
  },
  plugins: [],
}
