'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { List } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TOCItem {
  id: string
  text: string
  level: number
}

interface TOCProps {
  content: string
}

export default function TOC({ content }: TOCProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    // Parse headings from content
    const headingRegex = /^(#{1,3})\s+(.+)$/gm
    const items: TOCItem[] = []
    let match

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length
      const text = match[2]
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
      items.push({ id, text, level })
    }

    setHeadings(items)
  }, [content])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-80px 0px -80% 0px' }
    )

    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <motion.nav
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="sticky top-24 p-4 bg-cyber-dark/50 border border-cyber-cyan/20 rounded-lg backdrop-blur-sm"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left font-cyber text-sm uppercase tracking-wider text-cyber-cyan mb-4"
      >
        <List className="w-4 h-4" />
        目录
      </button>

      {isOpen && (
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li
              key={heading.id}
              style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
            >
              <a
                href={`#${heading.id}`}
                className={cn(
                  'block text-sm py-1 transition-all duration-200 font-mono',
                  activeId === heading.id
                    ? 'text-cyber-cyan border-l-2 border-cyber-cyan pl-2 -ml-2'
                    : 'text-gray-500 hover:text-gray-300'
                )}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </motion.nav>
  )
}
