import { Roboto, Roboto_Condensed, Kanit, Ranga } from 'next/font/google';

export const roboto = Roboto({
    subsets: ['latin'],
    variable: '--font-roboto',
    weight: ['100', '300', '400', '500', '700', '900'],
    display: "swap",
})

export const roboto_condensed = Roboto_Condensed({
    subsets: ['latin'],
    variable: '--font-roboto-condensed',
    weight: ['300', '400', '700'],
    display: "swap",
})

export const kanit = Kanit({
    subsets: ['latin'],
    variable: '--font-kanit',
    weight: ['200','400','500','700'],
    display: "swap",
})

export const ranga = Ranga({
    subsets: ['latin'],
    variable: '--font-ranga',
    weight: ['400','700'],
    display: "swap",
})
