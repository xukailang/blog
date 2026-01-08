'use client'

import { motion } from 'framer-motion'
import GlitchText from '@/components/ui/GlitchText'
import Gallery from '@/components/media/Gallery'

const sampleImages = [
  { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', alt: '赛博朋克城市' },
  { src: 'https://images.unsplash.com/photo-1515630278258-407f66498911?w=800', alt: '霓虹灯光' },
  { src: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800', alt: '复古科技' },
  { src: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800', alt: '未来都市' },
  { src: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800', alt: '数字世界' },
  { src: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800', alt: '代码矩阵' },
]

export default function GalleryPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <GlitchText
            text="GALLERY"
            as="h1"
            className="text-4xl md:text-5xl font-bold text-cyber-cyan mb-4"
          />
          <p className="text-gray-500 font-mono">
            视觉灵感收藏
          </p>
        </motion.div>

        {/* Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Gallery images={sampleImages} columns={3} />
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 font-mono text-sm">
            点击图片查看大图 | 使用方向键切换
          </p>
        </motion.div>
      </div>
    </div>
  )
}
