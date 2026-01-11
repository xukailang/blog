'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles, Code, Palette, Zap } from 'lucide-react'
import GlitchText from '@/components/ui/GlitchText'
import TypeWriter from '@/components/effects/TypeWriter'
import NeonBorder from '@/components/effects/NeonBorder'
import PopularPosts from '@/components/blog/PopularPosts'

const features = [
  {
    icon: Code,
    title: '技术分享',
    description: '深入探索前沿技术，分享编程心得与最佳实践',
    color: 'cyan' as const,
  },
  {
    icon: Palette,
    title: '创意设计',
    description: '赛博朋克美学，打造独特的视觉体验',
    color: 'pink' as const,
  },
  {
    icon: Sparkles,
    title: '灵感记录',
    description: '捕捉生活中的灵感火花，记录思考与感悟',
    color: 'purple' as const,
  },
  {
    icon: Zap,
    title: '极致体验',
    description: '流畅的动画效果，沉浸式的阅读体验',
    color: 'green' as const,
  },
]

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="min-h-[90vh] flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Glitch Title */}
            <div className="mb-6">
              <GlitchText
                text="CYBER BLOG"
                as="h1"
                className="text-5xl md:text-7xl font-bold text-cyber-cyan"
              />
            </div>

            {/* Subtitle with TypeWriter */}
            <div className="h-8 mb-8">
              <TypeWriter
                text="欢迎来到数字世界的边缘..."
                speed={80}
                className="text-xl md:text-2xl text-gray-400 font-mono"
              />
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
              className="text-gray-500 text-lg mb-12 max-w-2xl mx-auto font-mono"
            >
              在这里，代码与艺术交织，技术与创意碰撞。
              探索未来，记录当下，分享思考。
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/blog">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cyber-button text-white rounded-lg flex items-center gap-2 justify-center"
                >
                  开始探索
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="/about">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 border border-cyber-cyan text-cyber-cyan rounded-lg font-cyber uppercase tracking-wider hover:bg-cyber-cyan/10 transition-colors"
                >
                  了解更多
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-6 h-10 border-2 border-cyber-cyan/50 rounded-full flex justify-center"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-1.5 h-3 bg-cyber-cyan rounded-full mt-2"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-cyber text-3xl md:text-4xl text-white mb-4">
              <span className="text-cyber-pink">_</span>特色功能
            </h2>
            <p className="text-gray-500 font-mono">
              打造极致的博客体验
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <NeonBorder color={feature.color} className="p-6 h-full bg-cyber-dark/50">
                  <feature.icon className={`w-10 h-10 mb-4 text-cyber-${feature.color}`} />
                  <h3 className="font-cyber text-lg text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-500 text-sm font-mono">{feature.description}</p>
                </NeonBorder>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Posts Section */}
      <section className="py-20 px-4 bg-cyber-dark/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <PopularPosts limit={5} />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <NeonBorder color="pink" className="p-12 text-center bg-cyber-dark/50">
            <h2 className="font-cyber text-2xl md:text-3xl text-white mb-4">
              准备好开始你的旅程了吗？
            </h2>
            <p className="text-gray-400 font-mono mb-8">
              探索博客，发现更多精彩内容
            </p>
            <Link href="/blog">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cyber-button text-white rounded-lg"
              >
                浏览全部文章
              </motion.button>
            </Link>
          </NeonBorder>
        </div>
      </section>
    </div>
  )
}
