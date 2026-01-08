'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Github, Twitter, Mail, MapPin, Calendar, Code, Heart } from 'lucide-react'
import { siteConfig } from '@/config/site'
import GlitchText from '@/components/ui/GlitchText'
import NeonBorder from '@/components/effects/NeonBorder'
import TypeWriter from '@/components/effects/TypeWriter'

const skills = [
  { name: 'JavaScript', level: 90 },
  { name: 'TypeScript', level: 85 },
  { name: 'React', level: 90 },
  { name: 'Next.js', level: 85 },
  { name: 'Node.js', level: 80 },
  { name: 'Python', level: 75 },
]

const timeline = [
  { year: '2024', event: '开始赛博朋克博客之旅' },
  { year: '2023', event: '深入学习 Next.js 和 React' },
  { year: '2022', event: '开始全栈开发' },
  { year: '2021', event: '踏入编程世界' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <GlitchText
            text="ABOUT ME"
            as="h1"
            className="text-4xl md:text-5xl font-bold text-cyber-cyan mb-4"
          />
          <div className="h-6">
            <TypeWriter
              text="探索代码与创意的边界..."
              speed={60}
              className="text-gray-500 font-mono"
            />
          </div>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <NeonBorder color="pink" className="p-8 bg-cyber-dark/50">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-cyber-cyan">
                  <div className="w-full h-full bg-gradient-to-br from-cyber-cyan to-cyber-pink flex items-center justify-center">
                    <Code className="w-16 h-16 text-cyber-black" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-cyber-green rounded-full border-2 border-cyber-dark flex items-center justify-center">
                  <span className="text-xs">在线</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="font-cyber text-2xl text-white mb-2">
                  {siteConfig.author.name}
                </h2>
                <p className="text-cyber-pink font-mono mb-4">
                  全栈开发者 / 创意探索者
                </p>
                <p className="text-gray-400 font-mono text-sm mb-4">
                  热爱编程，热爱设计，热爱探索未知。
                  在代码的世界里寻找艺术，在艺术的世界里融入代码。
                </p>

                {/* Quick Info */}
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    中国
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    2021 年开始编程
                  </span>
                </div>

                {/* Social Links */}
                <div className="flex justify-center md:justify-start gap-4 mt-6">
                  <motion.a
                    href={siteConfig.author.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="p-2 bg-cyber-dark border border-cyber-cyan/30 rounded-lg text-gray-400 hover:text-cyber-cyan hover:border-cyber-cyan transition-all"
                  >
                    <Github className="w-5 h-5" />
                  </motion.a>
                  <motion.a
                    href={siteConfig.author.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="p-2 bg-cyber-dark border border-cyber-cyan/30 rounded-lg text-gray-400 hover:text-cyber-cyan hover:border-cyber-cyan transition-all"
                  >
                    <Twitter className="w-5 h-5" />
                  </motion.a>
                  <motion.a
                    href={`mailto:${siteConfig.author.email}`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="p-2 bg-cyber-dark border border-cyber-cyan/30 rounded-lg text-gray-400 hover:text-cyber-cyan hover:border-cyber-cyan transition-all"
                  >
                    <Mail className="w-5 h-5" />
                  </motion.a>
                </div>
              </div>
            </div>
          </NeonBorder>
        </motion.div>

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="font-cyber text-xl text-cyber-pink mb-6 flex items-center gap-2">
            <Code className="w-5 h-5" />
            技能栈
          </h2>
          <NeonBorder color="cyan" className="p-6 bg-cyber-dark/50">
            <div className="space-y-4">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className="flex justify-between mb-1">
                    <span className="font-mono text-gray-300">{skill.name}</span>
                    <span className="font-mono text-cyber-cyan">{skill.level}%</span>
                  </div>
                  <div className="h-2 bg-cyber-dark rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                      className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-pink rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </NeonBorder>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="font-cyber text-xl text-cyber-pink mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            时间线
          </h2>
          <div className="relative">
            {/* Line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-cyber-cyan via-cyber-pink to-cyber-purple" />

            {/* Events */}
            <div className="space-y-6">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-4 pl-10 relative"
                >
                  <div className="absolute left-2 w-4 h-4 rounded-full bg-cyber-dark border-2 border-cyber-cyan" />
                  <span className="font-cyber text-cyber-cyan">{item.year}</span>
                  <span className="font-mono text-gray-400">{item.event}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <NeonBorder color="purple" className="p-8 text-center bg-cyber-dark/50">
            <Heart className="w-10 h-10 text-cyber-pink mx-auto mb-4 animate-pulse" />
            <h2 className="font-cyber text-xl text-white mb-2">
              想要联系我？
            </h2>
            <p className="text-gray-400 font-mono mb-6">
              欢迎通过邮件或社交媒体与我交流
            </p>
            <motion.a
              href={`mailto:${siteConfig.author.email}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block cyber-button text-white rounded-lg"
            >
              发送邮件
            </motion.a>
          </NeonBorder>
        </motion.div>
      </div>
    </div>
  )
}
