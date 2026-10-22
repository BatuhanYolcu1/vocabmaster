/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://vocabmaster.app',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  // Only the public marketing pages are indexable.
  exclude: ['/*'],
  additionalPaths: async () => [
    { loc: '/', changefreq: 'weekly', priority: 1.0 },
    { loc: '/pricing', changefreq: 'monthly', priority: 0.8 },
    { loc: '/about', changefreq: 'monthly', priority: 0.5 },
    { loc: '/contact', changefreq: 'yearly', priority: 0.4 },
    { loc: '/privacy', changefreq: 'yearly', priority: 0.3 },
    { loc: '/terms', changefreq: 'yearly', priority: 0.3 },
    { loc: '/register', changefreq: 'yearly', priority: 0.6 },
    { loc: '/login', changefreq: 'yearly', priority: 0.4 },
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin', '/dashboard', '/study', '/lists', '/library', '/stats', '/leaderboard', '/achievements', '/settings', '/onboarding'],
      },
    ],
  },
};
