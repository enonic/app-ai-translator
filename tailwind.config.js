/** @type {import('tailwindcss').Config} */
import {isolateInsideOfContainer, scopedPreflightStyles} from 'tailwindcss-scoped-preflight';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
    content: ['./src/main/resources/assets/**/*.tsx'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Open Sans"', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                'enonic-gray': {
                    700: '#333333',
                    600: '#777777',
                    500: '#999999',
                    400: '#acacac',
                    100: '#f7f7f7',
                },
                'enonic-green': {
                    DEFAULT: '#609e24',
                },
                'enonic-red': {
                    DEFAULT: '#cb0300',
                },
                'enonic-blue': {
                    DEFAULT: '#2c76e9',
                    400: '#5a94ee',
                    500: '#4279d9',
                    700: '#1a56b8',
                    800: '#123d8a',
                },
            },
            screens: {
                sm2: '720px',
            },
            spacing: {
                8.5: '2.125rem',
                30: '7.5rem',
                '1/2': '50%',
                '4/5': '80%',
            },
            margin: {
                17: '4.25rem',
            },
            padding: {
                0.25: '.0625rem',
                2.5: '.625rem',
                7.5: '1.875rem',
            },
            lineHeight: {
                initial: 'initial',
                3.5: '.875rem',
                'header-title': '2rem',
            },
            fontSize: {
                '2xs': '.625rem',
                'header-title': '1.725rem',
            },
            backgroundImage: {
                'gradient-middle':
                    'linear-gradient(90deg, var(--tw-gradient-from) 25%, var(--tw-gradient-to) 50%, var(--tw-gradient-from) 75%)',
                'gradient-fade-to-t': 'linear-gradient(0deg, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 15%)',
            },
            backgroundSize: {
                'text-gradient-size': '200% 100%',
            },
            flex: {
                max: '1 0 100%',
                '1-0-auto': '1 0 auto',
            },
            gridTemplateColumns: {
                auto: 'auto',
                'min-280': 'repeat(auto-fill, minmax(300px, 1fr))',
                header: '1fr minmax(auto, min-content)',
                'fit-1fr': 'minmax(auto, min-content) 1fr',
                'fit-fit-1fr': 'minmax(auto, min-content) minmax(auto, min-content) 1fr',
            },
            gridTemplateRows: {
                auto: 'auto',
                'fit-1fr': 'minmax(auto, min-content) 1fr',
            },
            blur: {
                xs: '2px',
            },
            transitionProperty: {
                padding: 'padding',
            },
            keyframes: {
                'slide-fade-in': {
                    '0%': {
                        opacity: '0',
                        'padding-bottom': '0',
                        'padding-top': '0.5rem',
                    },
                    '100%': {
                        opacity: '1',
                        'padding-bottom': '0.5rem',
                        'padding-top': '0',
                    },
                },
                'move-gradient': {
                    '0%': {
                        'background-position': '200% 0%',
                    },
                    '100%': {
                        'background-position': '-200% 0%',
                    },
                },
            },
            animation: {
                'slide-fade-in': 'slide-fade-in 300ms ease-in-out forwards',
                'move-gradient': 'move-gradient 3000ms linear infinite',
            },
        },
    },
    important: '.ai-translator', // isolate tailwind utility styles
    plugins: [
        require('@tailwindcss/typography'),
        scopedPreflightStyles({
            isolationStrategy: isolateInsideOfContainer('.ai-translator'), // isolate preflight styles
        }),
    ],
};
