import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1240px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        page: "#F7FAF9",
        cream: "#FBFCFB",
        ink: "#162220",
        line: "#E3EAE7",
        bodytext: "#55645F",
        brand: {
          DEFAULT: "#0F766E",
          hover: "#0B5D57",
          soft: "#F1F6F4",
          mist: "#E6F2EF",
        },
        caution: {
          DEFAULT: "#B54708",
          soft: "#FFFAEB",
          border: "#FEDF89",
          ink: "#7A2E0E",
        },
        urgent: {
          DEFAULT: "#B42318",
          soft: "#FEF3F2",
          border: "#FDA29B",
          ink: "#7A271A",
        },
      },
      fontFamily: {
        sans: ["Inter", "IBM Plex Sans Arabic", "system-ui", "sans-serif"],
        display: ["Manrope", "IBM Plex Sans Arabic", "system-ui", "sans-serif"],
        arabic: ["IBM Plex Sans Arabic", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(22 34 32 / 0.03), 0 4px 16px -6px rgb(22 34 32 / 0.06)",
        lift: "0 2px 4px 0 rgb(22 34 32 / 0.03), 0 18px 44px -24px rgb(22 34 32 / 0.18)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "alarm-pulse": {
          from: { opacity: "0.85", transform: "translate(-50%, -50%) scale(0.85)" },
          to: { opacity: "0", transform: "translate(-50%, -50%) scale(1.7)" },
        },
      },
      animation: {
        "fade-up": "fade-up 280ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "alarm-pulse":
          "alarm-pulse 1400ms cubic-bezier(0.22, 1, 0.36, 1) infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
