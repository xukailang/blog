import { Metadata } from 'next'
import { getAllPosts, getAllTags, getAllCategories } from '@/lib/mdx'
import BlogPageClient from './BlogPageClient'

export const metadata: Metadata = {
  title: '博客',
  description: '探索所有文章，发现精彩内容',
}

export default function BlogPage() {
  const posts = getAllPosts()
  const tags = getAllTags()
  const categories = getAllCategories()

  return <BlogPageClient posts={posts} tags={tags} categories={categories} />
}
