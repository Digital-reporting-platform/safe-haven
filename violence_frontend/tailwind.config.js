/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        inter: ["Inter", "sans-serif"],
        mono: [
          "JetBrains Mono",
          "Courier New",
          "monospace",
        ],
        jetbrains: ["JetBrains Mono", "monospace"],
        lato: ["Lato", "sans-serif"],
        nunito: ["Nunito", "sans-serif"],
        ethiopic: ["Noto Sans Ethiopic", "sans-serif"],
        serif: [
          "Playfair Display",
          "Crimson Pro",
          "Georgia",
          "Times New Roman",
          "serif",
        ],
        editorial: [
          "Playfair Display",
          "Crimson Pro",
          "Georgia",
          "serif",
        ],
      },
      fontSize: {
        xs: ["clamp(0.6875rem, 0.625rem + 0.3125vw, 0.75rem)", { lineHeight: "1.4", letterSpacing: "0.02em" }],
        sm: ["clamp(0.8125rem, 0.75rem + 0.3125vw, 0.875rem)", { lineHeight: "1.45", letterSpacing: "0.02em" }],
        base: ["clamp(1rem, 0.9375rem + 0.3125vw, 1rem)", { lineHeight: "1.6", letterSpacing: "0" }],
        lg: ["clamp(1.0625rem, 1rem + 0.3125vw, 1.125rem)", { lineHeight: "1.65", letterSpacing: "0" }],
        xl: ["clamp(1.1875rem, 1.125rem + 0.3125vw, 1.25rem)", { lineHeight: "1.65", letterSpacing: "-0.01em" }],
        "2xl": ["clamp(1.375rem, 1.25rem + 0.625vw, 1.5rem)", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        "3xl": ["clamp(1.625rem, 1.5rem + 0.625vw, 1.875rem)", { lineHeight: "1.3", letterSpacing: "-0.02em" }],
        "4xl": ["clamp(2rem, 1.75rem + 1.25vw, 2.25rem)", { lineHeight: "1.2", letterSpacing: "0.05em" }],
        "5xl": ["clamp(2.5rem, 2.25rem + 1.25vw, 3rem)", { lineHeight: "1.2", letterSpacing: "0.05em" }],
        "6xl": ["clamp(3rem, 2.75rem + 1.25vw, 3.75rem)", { lineHeight: "1.2", letterSpacing: "0.08em" }],
        
        // Role-based font sizes
        "public-body": ["clamp(1.125rem, 1.0625rem + 0.3125vw, 1.25rem)", { lineHeight: "1.7", letterSpacing: "0" }],
        "public-heading-sm": ["clamp(1.5rem, 1.375rem + 0.625vw, 1.75rem)", { lineHeight: "1.3", letterSpacing: "0.05em" }],
        "public-heading-md": ["clamp(2rem, 1.75rem + 1.25vw, 2.5rem)", { lineHeight: "1.3", letterSpacing: "0.05em" }],
        "public-heading-lg": ["clamp(2.5rem, 2.25rem + 1.25vw, 3rem)", { lineHeight: "1.3", letterSpacing: "0.05em" }],
        
        "survivor-body": ["clamp(1rem, 0.9375rem + 0.3125vw, 1.125rem)", { lineHeight: "1.8", letterSpacing: "0" }],
        "survivor-heading-sm": ["clamp(1.25rem, 1.1875rem + 0.3125vw, 1.375rem)", { lineHeight: "1.4", letterSpacing: "0" }],
        "survivor-heading-md": ["clamp(1.5rem, 1.375rem + 0.625vw, 1.75rem)", { lineHeight: "1.4", letterSpacing: "0" }],
        "survivor-heading-lg": ["clamp(1.875rem, 1.75rem + 0.625vw, 2.125rem)", { lineHeight: "1.4", letterSpacing: "0" }],
        
        "counselor-body": ["clamp(1rem, 0.9375rem + 0.3125vw, 1rem)", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        "counselor-heading-sm": ["clamp(1.1875rem, 1.125rem + 0.3125vw, 1.25rem)", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        "counselor-heading-md": ["clamp(1.375rem, 1.25rem + 0.625vw, 1.5rem)", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        "counselor-heading-lg": ["clamp(1.625rem, 1.5rem + 0.625vw, 1.875rem)", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        
        "medical-body": ["clamp(0.9375rem, 0.875rem + 0.3125vw, 1rem)", { lineHeight: "1.4", letterSpacing: "-0.01em" }],
        "medical-heading-sm": ["clamp(1.125rem, 1.0625rem + 0.3125vw, 1.1875rem)", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "medical-heading-md": ["clamp(1.25rem, 1.1875rem + 0.3125vw, 1.375rem)", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "medical-heading-lg": ["clamp(1.5rem, 1.375rem + 0.625vw, 1.625rem)", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        
        "legal-body": ["clamp(1rem, 0.9375rem + 0.3125vw, 1rem)", { lineHeight: "1.6", letterSpacing: "0" }],
        "legal-heading-sm": ["clamp(1.1875rem, 1.125rem + 0.3125vw, 1.25rem)", { lineHeight: "1.3", letterSpacing: "0" }],
        "legal-heading-md": ["clamp(1.375rem, 1.25rem + 0.625vw, 1.5rem)", { lineHeight: "1.3", letterSpacing: "0" }],
        "legal-heading-lg": ["clamp(1.625rem, 1.5rem + 0.625vw, 1.875rem)", { lineHeight: "1.3", letterSpacing: "0" }],
        
        "moderator-body": ["clamp(0.9375rem, 0.875rem + 0.3125vw, 1rem)", { lineHeight: "1.4", letterSpacing: "-0.01em" }],
        "moderator-heading-sm": ["clamp(1.125rem, 1.0625rem + 0.3125vw, 1.1875rem)", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "moderator-heading-md": ["clamp(1.25rem, 1.1875rem + 0.3125vw, 1.375rem)", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "moderator-heading-lg": ["clamp(1.5rem, 1.375rem + 0.625vw, 1.625rem)", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        
        "admin-body": ["clamp(0.875rem, 0.8125rem + 0.3125vw, 0.9375rem)", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        "admin-heading-sm": ["clamp(1rem, 0.9375rem + 0.3125vw, 1.0625rem)", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        "admin-heading-md": ["clamp(1.125rem, 1.0625rem + 0.3125vw, 1.1875rem)", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        "admin-heading-lg": ["clamp(1.375rem, 1.25rem + 0.625vw, 1.5rem)", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
      },
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        black: "900",
      },
      lineHeight: {
        tight: "1.3",
        normal: "1.6",
        loose: "1.75",
        heading: "1.2",
      },
      letterSpacing: {
        tight: "-0.02em",
        normal: "0",
        wide: "0.02em",
        light: "0.05em", // Light tracking for large headers (calming effect)
        lighter: "0.08em", // Extra light for very large headers
      },
      maxWidth: {
        readable: "65ch",
        "readable-narrow": "45ch",
        "readable-wide": "90ch",
      },
      colors: {
        "electric-teal": "#00F5D4",
        "bright-coral": "#FF6B6B",
        "golden-amber": "#FFB400",
        "midnight-blue": "#0D1B2A",
        "charcoal": "#1C1C1E",
        "warm-brown": "#2C1A1D",
      },
    },
  },
  plugins: [],
};

