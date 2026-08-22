/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      /*
       * ========================================
       * FMH Budget — Warm Pixel Family Theme
       * ========================================
       */

      colors: {
        canvas: "#FFF6E5",
        surface: "#FFFFFF",

        primary: "#F28C77",
        "primary-dark": "#D96F61",

        accent: "#FAD02C",
        ink: "#2A2356",
        "ink-soft": "#554F70",

        muted: "#8F8995",
        "muted-warm": "#A69D91",

        success: "#78B88A",
        danger: "#E56B6F",

        "surface-soft": "#FFFDF8",
        "surface-warm": "#FFF9EF",
      },

      /*
       * Typography
       */
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          '"PingFang TC"',
          '"Microsoft JhengHei"',
          "sans-serif",
        ],

        pixel: [
          '"Fusion Pixel"',
          "monospace",
        ],
      },

      fontSize: {
        "pixel-sm": [
          "12px",
          {
            lineHeight: "1.4",
            letterSpacing: "0.02em",
          },
        ],

        "pixel-base": [
          "16px",
          {
            lineHeight: "1.4",
            letterSpacing: "0.01em",
          },
        ],

        "pixel-lg": [
          "24px",
          {
            lineHeight: "1.2",
            letterSpacing: "0.01em",
          },
        ],

        "pixel-xl": [
          "32px",
          {
            lineHeight: "1.15",
            letterSpacing: "0.01em",
          },
        ],
      },

      /*
       * Radius
       */
      borderRadius: {
        "pixel-sm": "8px",
        "pixel-card": "14px",
        "pixel-lg": "18px",
      },

      /*
       * Pixel-style hard shadows
       */
      boxShadow: {
        pixel: "2px 3px 0 #2A2356",
        "pixel-sm": "1px 2px 0 #2A2356",
        "pixel-lg": "3px 4px 0 #2A2356",

        "pixel-primary": "2px 3px 0 #D96F61",
        "pixel-accent": "2px 3px 0 #D9AE16",
      },

      /*
       * Global spacing rhythm
       */
      spacing: {
        "pixel-1": "4px",
        "pixel-2": "8px",
        "pixel-3": "12px",
        "pixel-4": "16px",
        "pixel-5": "20px",
        "pixel-6": "24px",
        "pixel-8": "32px",
        "pixel-10": "40px",
        "pixel-12": "48px",
      },

      /*
       * Pixel border widths
       */
      borderWidth: {
        pixel: "2px",
        "pixel-thick": "4px",
      },

      /*
       * Small animation language for buttons
       */
      transitionTimingFunction: {
        pixel: "cubic-bezier(0.25, 0.8, 0.25, 1)",
      },
    },
  },

  plugins: [],
};