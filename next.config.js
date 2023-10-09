/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    compiler: {
        styledComponents: true,
    },
    env: {
        NEXT_PUBLIC_MAIL_USER: 'rene',
        NEXT_PUBLIC_MAIL_PASS: 'LP8jnJ#V+L',
        NEXT_PUBLIC_MAIL_ADDRESS: 'kontakt@rene-van-dinter.de'
    }
}

module.exports = nextConfig
