import { Metadata } from 'next'
import { getAllSeries } from '@/lib/db/series'
import { siteConfig } from '@/config/site'
import SeriesListClient from './SeriesListClient'

export const metadata: Metadata = {
  title: '文章系列',
  description: '探索精心整理的文章系列，系统学习各个主题',
  openGraph: {
    title: '文章系列 | ' + siteConfig.name,
    description: '探索精心整理的文章系列，系统学习各个主题',
  },
}

export default async function SeriesPage() {
  const series = await getAllSeries(false)

  return <SeriesListClient series={series} />
}
