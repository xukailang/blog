export const siteConfig = {
  name: 'CyberBlog',
  description: '一个赛博朋克风格的个人博客',
  url: 'https://your-domain.com',
  author: {
    name: 'Your Name',
    email: 'your@email.com',
    github: 'https://github.com/yourusername',
    twitter: 'https://twitter.com/yourusername',
  },
  nav: [
    { name: '首页', href: '/' },
    { name: '博客', href: '/blog' },
    { name: 'Vlog', href: '/vlogs' },
    { name: '画廊', href: '/gallery' },
    { name: '关于', href: '/about' },
  ],
  giscus: {
    repo: 'xukailang/blog',
    repoId: 'R_kgDOQ1zHvw',
    category: 'Announcements',
    categoryId: 'DIC_kwDOQ1zHv84C0t2q',
  },
}

export type SiteConfig = typeof siteConfig
