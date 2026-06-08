import localFont from 'next/font/local';

// Self-hosted to keep the production build network-independent (CI builds
// previously failed fetching these from Google Fonts at build time).
// Roboto and Roboto Condensed are variable fonts (single file, weight range);
// Kanit and Ranga are static per-weight files. Latin subset only.

export const roboto = localFont({
    src: './fonts/roboto-variable.woff2',
    weight: '100 900',
    variable: '--font-roboto',
    display: 'swap',
})

export const roboto_condensed = localFont({
    src: './fonts/roboto-condensed-variable.woff2',
    weight: '100 900',
    variable: '--font-roboto-condensed',
    display: 'swap',
})

export const kanit = localFont({
    src: [
        { path: './fonts/kanit-200.woff2', weight: '200', style: 'normal' },
        { path: './fonts/kanit-400.woff2', weight: '400', style: 'normal' },
        { path: './fonts/kanit-500.woff2', weight: '500', style: 'normal' },
        { path: './fonts/kanit-700.woff2', weight: '700', style: 'normal' },
    ],
    variable: '--font-kanit',
    display: 'swap',
})

export const ranga = localFont({
    src: [
        { path: './fonts/ranga-400.woff2', weight: '400', style: 'normal' },
        { path: './fonts/ranga-700.woff2', weight: '700', style: 'normal' },
    ],
    variable: '--font-ranga',
    display: 'swap',
})
