import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSeriesBySlug } from '@/lib/db/series'
import { getPostBySlug } from '@/lib/mdx'
import { siteConfig } from '@/config/site'
import SeriesDetailClient from './SeriesDetailClient'

interface Props {
  params: Promise<{ slug: string }>
}

interface SeriesPost {
  id: string
  seriesId: string
  postSlug: string
  order: number
  createdAt: Date
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const series = await getSeriesBySlug(slug)

  if (!series) {
    return { title: '系列不存在' }
  }

  return {
    title: series.name,
    description: series.description || `${series.name} 系列文章`,
    openGraph: {
      title: `${series.name} | ${siteConfig.name}`,
      description: series.description || `${series.name} 系列文章`,
      images: series.coverImage ? [series.coverImage] : undefined,
    },
  }
}

export default async function SeriesDetailPage({ params }: Props) {
  const { slug } = await params
  const series = await getSeriesBySlug(slug)

  if (!series || !series.isPublished) {
    notFound()
  }

  // 获取每篇文章的详细信息
  const postsWithDetails = series.posts.map((sp: SeriesPost) => {
    const post = getPostBySlug(sp.postSlug)
    return {
      ...sp,
      post: post || null,
    }
  })

  return (
    <SeriesDetailClient
      series={{
        ...series,
        posts: postsWithDetails,
      }}
    />
  )
}
