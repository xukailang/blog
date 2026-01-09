import type { Metadata } from 'next'
import '@/styles/globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Particles from '@/components/effects/Particles'
import Scanlines from '@/components/effects/Scanlines'
import ThemeProvider from '@/components/providers/ThemeProvider'
import BGMProvider from '@/components/media/BGMProvider'
import BGMPlayer from '@/components/media/BGMPlayer'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ['博客', '赛博朋克', 'Next.js', 'React', '个人博客'],
  authors: [{ name: siteConfig.author.name }],
  creator: siteConfig.author.name,
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    creator: '@yourusername',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-cyber-black text-gray-200 cyber-grid-bg">
        <ThemeProvider>
          <BGMProvider>
            <Particles />
            <Scanlines />
            <div className="relative z-10 flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow pt-16">
                {children}
              </main>
              <Footer />
            </div>
            <BGMPlayer />
          </BGMProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
