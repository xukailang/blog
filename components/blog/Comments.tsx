'use client'

import { useState } from 'react'
import Giscus from '@giscus/react'
import { siteConfig } from '@/config/site'
import EnhancedComments from './EnhancedComments'

interface CommentsProps {
  postSlug: string
  currentUserId?: string
  useBuiltIn?: boolean // 是否使用自建评论系统
}

export default function Comments({ postSlug, currentUserId, useBuiltIn = true }: CommentsProps) {
  const [commentSystem, setCommentSystem] = useState<'builtin' | 'giscus'>(
    useBuiltIn ? 'builtin' : 'giscus'
  )

  return (
    <div className="mt-16 pt-8 border-t border-cyber-cyan/20">
      {/* 评论系统切换（可选） */}
      {useBuiltIn && siteConfig.giscus.repo && (
        <div className="flex justify-end mb-4">
          <div
            className="inline-flex rounded-lg p-1"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
          >
            <button
              onClick={() => setCommentSystem('builtin')}
              className="px-3 py-1 text-sm rounded-md transition-colors"
              style={{
                backgroundColor: commentSystem === 'builtin' ? 'var(--accent-primary)' : 'transparent',
                color: commentSystem === 'builtin' ? 'var(--bg-primary)' : 'var(--text-muted)',
              }}
            >
              评论
            </button>
            <button
              onClick={() => setCommentSystem('giscus')}
              className="px-3 py-1 text-sm rounded-md transition-colors"
              style={{
                backgroundColor: commentSystem === 'giscus' ? 'var(--accent-primary)' : 'transparent',
                color: commentSystem === 'giscus' ? 'var(--bg-primary)' : 'var(--text-muted)',
              }}
            >
              GitHub 讨论
            </button>
          </div>
        </div>
      )}

      {commentSystem === 'builtin' ? (
        <EnhancedComments postSlug={postSlug} currentUserId={currentUserId} />
      ) : (
        <div>
          <h3 className="font-cyber text-xl text-cyber-cyan mb-8">GitHub 讨论</h3>
          <Giscus
            repo={siteConfig.giscus.repo as `${string}/${string}`}
            repoId={siteConfig.giscus.repoId}
            category={siteConfig.giscus.category}
            categoryId={siteConfig.giscus.categoryId}
            mapping="pathname"
            strict="0"
            reactionsEnabled="1"
            emitMetadata="0"
            inputPosition="top"
            theme="transparent_dark"
            lang="zh-CN"
            loading="lazy"
          />
        </div>
      )}
    </div>
  )
}
