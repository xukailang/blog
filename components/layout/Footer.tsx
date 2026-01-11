'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Github, Twitter, Mail, Rss, Heart, Zap } from 'lucide-react'
import { siteConfig } from '@/config/site'
import NewsletterForm from '@/components/newsletter/NewsletterForm'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: Github, href: siteConfig.author.github, label: 'GitHub' },
    { icon: Twitter, href: siteConfig.author.twitter, label: 'Twitter' },
    { icon: Mail, href: `mailto:${siteConfig.author.email}`, label: 'Email' },
    { icon: Rss, href: '/rss.xml', label: 'RSS' },
  ]

  return (
    <footer className="relative mt-20 border-t border-cyber-cyan/20">
      {/* Gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-cyan to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Newsletter Section */}
        <div className="mb-12 max-w-xl mx-auto">
          <NewsletterForm variant="inline" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-cyber-cyan to-cyber-pink rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyber-black" />
              </div>
              <span className="font-cyber text-lg font-bold text-cyber-cyan">
                {siteConfig.name}
              </span>
            </Link>
            <p className="text-gray-500 text-sm font-mono">
              {siteConfig.description}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-cyber text-sm uppercase tracking-wider text-cyber-pink">
              快速链接
            </h3>
            <ul className="space-y-2">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-cyber-cyan transition-colors text-sm font-mono"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="font-cyber text-sm uppercase tracking-wider text-cyber-pink">
              社交媒体
            </h3>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-cyber-dark border border-cyber-cyan/30 rounded-lg flex items-center justify-center text-gray-400 hover:text-cyber-cyan hover:border-cyber-cyan transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-cyber-cyan/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm font-mono flex items-center gap-1">
            &copy; {currentYear} {siteConfig.name}. Made with
            <Heart className="w-4 h-4 text-cyber-pink animate-pulse" />
            and
            <span className="text-cyber-cyan">code</span>
          </p>
          <p className="text-gray-600 text-xs font-mono">
            Powered by Next.js & Tailwind CSS
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyber-cyan/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyber-pink/5 rounded-full blur-3xl" />
    </footer>
  )
}
