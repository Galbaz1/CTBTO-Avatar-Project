/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 🎨 CTBTO BRAND COLOR SYSTEM
      colors: {
        // Primary CTBTO colors from brand guidelines
        'ctbto': {
          navy: '#204054',        // Official CTBTO header color
          seafoam: '#7DD3C0',     // Official CTBTO accent (estimated from "Seafoam")
          charcoal: '#1a1a1a',   // High contrast text (WCAG AAA)
        },
        // Professional conference palette
        'conference': {
          50: '#f8fafc',   // Lightest backgrounds
          100: '#f1f5f9',  // Card backgrounds
          200: '#e2e8f0',  // Subtle borders
          300: '#cbd5e1',  // Muted elements
          400: '#94a3b8',  // Secondary text
          500: '#64748b',  // Tertiary text
          600: '#475569',  // Primary text
          700: '#334155',  // Headings
          800: '#1e293b',  // Strong emphasis
          900: '#0f172a',  // Maximum contrast
        },
        // Semantic color system
        'science': {
          physics: '#3b82f6',     // Blue for physics sessions
          chemistry: '#10b981',   // Green for chemistry
          technology: '#8b5cf6',  // Purple for technology
          policy: '#f59e0b',      // Amber for policy/diplomacy
          keynote: '#dc2626',     // Red for keynote sessions
        },
        // Status & priority colors
        'priority': {
          high: '#dc2626',     // Red
          medium: '#f59e0b',   // Amber  
          low: '#6b7280',      // Gray
        }
      },

      // 📐 PROFESSIONAL SPACING SYSTEM
      spacing: {
        '18': '4.5rem',   // 72px - Large card spacing
        '22': '5.5rem',   // 88px - Extra large spacing
        '26': '6.5rem',   // 104px - Kiosk-appropriate gaps
        '30': '7.5rem',   // 120px - Major layout spacing
      },

      // 🔤 SCIENTIFIC TYPOGRAPHY SYSTEM
      fontFamily: {
        'primary': ['Verdana', 'Geneva', 'sans-serif'],  // CTBTO official font
        'display': ['Inter', 'system-ui', 'sans-serif'], // Modern headings
        'mono': ['JetBrains Mono', 'monospace'],         // Technical content
      },

      // 📏 SOPHISTICATED TYPE SCALE
      fontSize: {
        // Kiosk-optimized scale (18px minimum)
        'kiosk-xs': ['18px', { lineHeight: '1.4', fontWeight: '500' }],   // Minimum readable
        'kiosk-sm': ['20px', { lineHeight: '1.4', fontWeight: '500' }],   // Small text
        'kiosk-base': ['24px', { lineHeight: '1.5', fontWeight: '600' }], // Body text
        'kiosk-lg': ['28px', { lineHeight: '1.4', fontWeight: '600' }],   // Subheadings
        'kiosk-xl': ['32px', { lineHeight: '1.3', fontWeight: '700' }],   // Headings
        'kiosk-2xl': ['40px', { lineHeight: '1.2', fontWeight: '700' }],  // Main headings
        'kiosk-3xl': ['48px', { lineHeight: '1.1', fontWeight: '800' }],  // Display text
      },

      // 🎪 SOPHISTICATED SHADOWS
      boxShadow: {
        'professional': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'premium': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'ctbto': '0 8px 16px -4px rgba(32, 64, 84, 0.15), 0 4px 8px -2px rgba(32, 64, 84, 0.08)',
      },

      // 🎯 PROFESSIONAL BORDER RADIUS
      borderRadius: {
        'card': '16px',      // Standard cards
        'premium': '20px',   // Premium cards  
        'speaker': '24px',   // Speaker cards
        'display': '28px',   // Hero cards
      },

      // ⚡ SOPHISTICATED ANIMATIONS
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'stagger-in': 'staggerIn 0.6s ease-out',
      },

      // 🎬 ANIMATION KEYFRAMES
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        staggerIn: {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },

      // 📱 KIOSK BREAKPOINTS
      screens: {
        'kiosk-sm': '1024px',  // Small kiosk displays
        'kiosk-md': '1280px',  // Medium kiosk displays  
        'kiosk-lg': '1536px',  // Large kiosk displays
        'kiosk-xl': '1920px',  // Extra large displays
      },
    },
  },
  plugins: [
    // Custom utilities for kiosk design
    function({ addUtilities }) {
      const kioskUtilities = {
        '.text-ctbto-contrast': {
          color: '#1a1a1a',
          fontWeight: '600',
        },
        '.bg-ctbto-primary': {
          background: 'linear-gradient(135deg, #204054 0%, #2d5a6f 100%)',
        },
        '.bg-ctbto-card': {
          background: 'linear-gradient(145deg, #ffffff 0%, #fafafa 100%)',
        },
        '.shadow-ctbto': {
          boxShadow: '0 8px 16px -4px rgba(32, 64, 84, 0.15), 0 4px 8px -2px rgba(32, 64, 84, 0.08)',
        },
        '.border-ctbto': {
          borderColor: 'rgba(32, 64, 84, 0.2)',
        },
      };
      addUtilities(kioskUtilities);
    },
  ],
} 