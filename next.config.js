/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    compiler: {
        styledComponents: true,
    },
    env: {
        NEXT_CONTACT_MAIL_HOST: 'server.gambit24.de',
        NEXT_CONTACT_MAIL_SERVICE: 'gambit24mailer',
        NEXT_CONTACT_MAIL_PORT: '587',
        NEXT_CONTACT_MAIL_USER: 'rene',
        NEXT_CONTACT_MAIL_PASS: 'LP8jnJ#V+L',
        NEXT_CONTACT_MAIL_ADDRESS: 'kontakt@rene-van-dinter.de',
        MONGODB_URI: 'mongodb://gambit24:LP8jnJ%23V%2BL@mongodb.gambit24.de:27017/GambitDb1?authSource=GambitDb1',
    }
}

module.exports = nextConfig
