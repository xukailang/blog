import { NextRequest, NextResponse } from 'next/server'
import { getPostForExport } from '@/lib/export/exporter'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json({ error: '缺少文章 slug' }, { status: 400 })
    }

    const exported = await getPostForExport(slug)

    if (!exported) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    }

    // 返回 HTML 文件（可以用浏览器打印为 PDF）
    const filename = `${slug}.html`

    return new Response(exported.html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    })
  } catch (error) {
    console.error('Export PDF error:', error)
    return NextResponse.json({ error: '导出失败' }, { status: 500 })
  }
}
