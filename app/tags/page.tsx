import { Metadata } from 'next'
import { getTagsWithCount } from '@/lib/mdx'
import TagsPageClient from './TagsPageClient'

export const metadata: Metadata = {
  title: '标签',
  description: '浏览所有文章标签',
}

export default function TagsPage() {
  const tags = getTagsWithCount()

  return <TagsPageClient tags={tags} />
}
