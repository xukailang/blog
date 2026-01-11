import { Metadata } from 'next'
import { getAllPosts } from '@/lib/mdx'
import TimelinePageClient from './TimelinePageClient'

export const metadata: Metadata = {
  title: '时间线',
  description: '按时间顺序浏览所有文章',
}

export default function TimelinePage() {
  const posts = getAllPosts()

  return <TimelinePageClient posts={posts} />
}
