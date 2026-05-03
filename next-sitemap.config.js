/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://vocabmaster.app',
    generateRobotsTxt: true,
    generateIndexSitemap: false,
    exclude: [
        '/api/*',
        '/study/*',
        '/wordlists/*',
        '/profile',
        '/onboarding',
        '/server-sitemap.xml',
    ],
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/study/', '/wordlists/', '/profile', '/onboarding'],
            },
        ],
        additionalSitemaps: [],
    },
    additionalPaths: async () => [
        { loc: '/', changefreq: 'daily', priority: 1.0, lastmod: new Date().toISOString() },
        { loc: '/pricing', changefreq: 'weekly', priority: 0.9 },
        { loc: '/about', changefreq: 'monthly', priority: 0.7 },
        { loc: '/contact', changefreq: 'monthly', priority: 0.6 },
        { loc: '/privacy', changefreq: 'yearly', priority: 0.3 },
        { loc: '/terms', changefreq: 'yearly', priority: 0.3 },
        { loc: '/login', changefreq: 'monthly', priority: 0.5 },
        { loc: '/register', changefreq: 'monthly', priority: 0.8 },
    ],
}
