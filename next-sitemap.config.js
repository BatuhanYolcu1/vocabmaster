/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://vocabmaster-mu.vercel.app', // Update with actual URL when custom domain is set
    generateRobotsTxt: true,
    exclude: ['/server-sitemap.xml', '/select/*'], // Exclude paths if needed
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
            },
        ],
    },
}
