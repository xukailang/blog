'use client'

import Giscus from '@giscus/react'
import { siteConfig } from '@/config/site'

export default function Comments() {
  return (
    <div className="mt-16 pt-8 border-t border-cyber-cyan/20">
      <h3 className="font-cyber text-xl text-cyber-cyan mb-8">评论</h3>
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
  )
}
