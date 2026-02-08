/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem', // Super arrondi pour l'effet "Bulle"
            },
            colors: {
                primary: '#3b82f6',
                secondary: '#64748b',
                'glass-white': 'rgba(255, 255, 255, 0.7)',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                'bubble': '0 4px 14px 0 rgba(0, 118, 255, 0.15)',
            }
        },
    },
    plugins: [],
}
