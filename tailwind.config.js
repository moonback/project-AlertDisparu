/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Rajdhani', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'Consolas', 'monospace'],
      },
      colors: {
        // Palette futuriste sombre
        dark: {
          900: '#0a0a0a',
          800: '#1a1a1a',
          700: '#2a2a2a',
          600: '#3a3a3a',
          500: '#4a4a4a',
          400: '#6a6a6a',
          300: '#8a8a8a',
          200: '#aaaaaa',
          100: '#cacaca',
          50: '#eaeaea',
        },
        // Couleurs d'accent futuristes
        neon: {
          blue: '#00d4ff',
          green: '#00ff88',
          purple: '#b347d9',
          amber: '#ffb347',
          red: '#ff4757',
          cyan: '#00f5ff',
        },
        // Couleurs de statut système
        system: {
          success: '#00ff88',
          warning: '#ffb347',
          error: '#ff4757',
          info: '#00d4ff',
          critical: '#ff1744',
        },
        // Couleurs primaires modernisées
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Couleurs d'alerte
        alert: {
          50: '#fefce8',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'scan-line': 'scanLine 3s linear infinite',
        'data-stream': 'dataStream 4s linear infinite',
        'neon-flicker': 'neonFlicker 0.15s infinite linear',
        'matrix-rain': 'matrixRain 20s linear infinite',
        'hologram': 'hologram 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glowPulse: {
          '0%': { 
            boxShadow: '0 0 5px rgba(0, 212, 255, 0.5), 0 0 10px rgba(0, 212, 255, 0.3), 0 0 15px rgba(0, 212, 255, 0.2)',
          },
          '100%': { 
            boxShadow: '0 0 10px rgba(0, 212, 255, 0.8), 0 0 20px rgba(0, 212, 255, 0.6), 0 0 30px rgba(0, 212, 255, 0.4)',
          },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        dataStream: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        neonFlicker: {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': {
            opacity: '1',
            filter: 'brightness(1)',
          },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': {
            opacity: '0.4',
            filter: 'brightness(0.8)',
          },
        },
        matrixRain: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        hologram: {
          '0%': { 
            opacity: '0.8',
            transform: 'translateY(0) scaleY(1)',
            filter: 'hue-rotate(0deg)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(-2px) scaleY(1.02)',
            filter: 'hue-rotate(90deg)',
          },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        // Ombres futuristes
        'neon-blue': '0 0 5px rgba(0, 212, 255, 0.5), 0 0 10px rgba(0, 212, 255, 0.3), 0 0 15px rgba(0, 212, 255, 0.2)',
        'neon-green': '0 0 5px rgba(0, 255, 136, 0.5), 0 0 10px rgba(0, 255, 136, 0.3), 0 0 15px rgba(0, 255, 136, 0.2)',
        'neon-purple': '0 0 5px rgba(179, 71, 217, 0.5), 0 0 10px rgba(179, 71, 217, 0.3), 0 0 15px rgba(179, 71, 217, 0.2)',
        'neon-amber': '0 0 5px rgba(255, 179, 71, 0.5), 0 0 10px rgba(255, 179, 71, 0.3), 0 0 15px rgba(255, 179, 71, 0.2)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'dark-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        'circuit-pattern': 'radial-gradient(circle at 25% 25%, rgba(0, 212, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(0, 255, 136, 0.1) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
};
