import { NextRequest, NextResponse } from 'next/server'
import { generateSummary, suggestQuestions, isAIConfigured } from '@/lib/ai/ai-service'
import { getPostBySlug, getPostContent } from '@/lib/mdx'
import { rateLimit, createRateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // 速率限制
  const { success, remaining, resetTime } = rateLimit(request, 'interaction')
  if (!success) {
    return createRateLimitResponse(resetTime, 'interaction')
  }

  // 检查 AI 是否配置
  if (!isAIConfigured) {
    return NextResponse.json(
      { error: 'AI 服务未配置' },
      { status: 503 }
    )
  }

  try {
    const { postSlug, type = 'summary' } = await request.json()

    if (!postSlug) {
      return NextResponse.json(
        { error: '缺少文章标识' },
        { status: 400 }
      )
    }

    // 获取文章内容
    const post = getPostBySlug(postSlug)
    if (!post) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      )
    }

    const content = getPostContent(postSlug)

    let result: { summary?: string; questions?: string[] } = {}

    if (type === 'summary' || type === 'all') {
      result.summary = await generateSummary(content)
    }

    if (type === 'questions' || type === 'all') {
      result.questions = await suggestQuestions(content, post.title)
    }

    const response = NextResponse.json({
      success: true,
      ...result,
    })

    return addRateLimitHeaders(response, remaining, resetTime, 'interaction')
  } catch (error) {
    console.error('AI summarize error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI 服务出错' },
      { status: 500 }
    )
  }
}
