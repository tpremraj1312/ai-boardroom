/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                board: {
                    bg: '#FFFFFF',
                    bgSecondary: '#FAFAFA',
                    card: '#F8F9FA',
                    border: '#E9ECEF',
                    primary: '#2563EB',
                    primaryHover: '#1D4ED8',
                    textMain: '#1F2937',
                    textSecondary: '#64748B',
                    heading: '#111827',
                    success: '#10B981',
                    warning: '#F59E0B',
                    danger: '#EF4444',
                    info: '#3B82F6',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'minimal': '0 1px 3px rgba(0,0,0,0.08)',
            },
        },
    },
    plugins: [],
}
