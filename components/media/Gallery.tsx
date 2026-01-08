'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GalleryImage {
  src: string
  alt: string
  width?: number
  height?: number
}

interface GalleryProps {
  images: GalleryImage[]
  columns?: 2 | 3 | 4
  className?: string
}

export default function Gallery({ images, columns = 3, className }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => {
    setSelectedIndex(index)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setSelectedIndex(null)
    document.body.style.overflow = 'auto'
  }

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length)
    }
  }

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowLeft') goToPrevious()
    if (e.key === 'ArrowRight') goToNext()
  }

  const columnClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className={cn(`grid ${columnClass[columns]} gap-4`, className)}>
        {images.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative aspect-square overflow-hidden rounded-lg border border-cyber-cyan/20 cursor-pointer group"
            onClick={() => openLightbox(index)}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-cyber-black/0 group-hover:bg-cyber-black/50 transition-colors flex items-center justify-center">
              <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {/* Neon border on hover */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyber-cyan transition-colors rounded-lg" />
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-cyber-black/95 flex items-center justify-center"
            onClick={closeLightbox}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </motion.button>

            {/* Previous Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation()
                goToPrevious()
              }}
              className="absolute left-4 p-2 text-gray-400 hover:text-cyber-cyan transition-colors z-10"
            >
              <ChevronLeft className="w-10 h-10" />
            </motion.button>

            {/* Next Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
              className="absolute right-4 p-2 text-gray-400 hover:text-cyber-cyan transition-colors z-10"
            >
              <ChevronRight className="w-10 h-10" />
            </motion.button>

            {/* Image */}
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-[90vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[selectedIndex].src}
                alt={images[selectedIndex].alt}
                width={images[selectedIndex].width || 1200}
                height={images[selectedIndex].height || 800}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              <p className="text-center text-gray-400 mt-4 font-mono">
                {images[selectedIndex].alt}
              </p>
            </motion.div>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-500 font-mono">
              {selectedIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
