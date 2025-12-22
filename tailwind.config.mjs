/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'umbra-black': '#050505',
                'umbra-obsidian': '#111111',
                'solana-purple': '#9945FF',
                'solana-green': '#14F195',
                'cyber-violet': '#8A2BE2',
                'cyber-cyan': '#00FFFF',
            },
            fontFamily: {
                display: ['Cinzel', 'serif'],
                body: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            boxShadow: {
                'neon-purple': '0 0 10px #9945FF, 0 0 20px #9945FF',
                'neon-cyan': '0 0 10px #00FFFF, 0 0 20px #00FFFF',
            }
        },
    },
    plugins: [],
}
