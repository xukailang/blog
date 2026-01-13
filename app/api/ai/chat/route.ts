import { NextRequest, NextResponse } from 'next/server'
import { answerQuestion, isAIConfigured } from '@/lib/ai/ai-service'
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
    const { question, postSlug } = await request.json()

    if (!question || !postSlug) {
      return NextResponse.json(
        { error: '缺少必要参数' },
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

    // 调用 AI 回答问题
    const answer = await answerQuestion(question, content, post.title)

    const response = NextResponse.json({
      success: true,
      answer,
    })

    return addRateLimitHeaders(response, remaining, resetTime, 'interaction')
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI 服务出错' },
      { status: 500 }
    )
  }
}
