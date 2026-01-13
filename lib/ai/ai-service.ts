/**
 * AI 服务配置和客户端
 *
 * 支持多种 AI 提供商：
 * - OpenAI (GPT-4, GPT-3.5)
 * - Anthropic (Claude)
 * - 其他兼容 OpenAI API 的服务
 */

// AI 提供商配置
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai' // openai, anthropic, custom
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307'

// 检查 AI 是否配置
export const isAIConfigured = !!(OPENAI_API_KEY || ANTHROPIC_API_KEY)

// AI 消息类型
export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// AI 响应类型
export interface AIResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

// OpenAI 兼容 API 调用
async function callOpenAI(messages: AIMessage[], options: {
  maxTokens?: number
  temperature?: number
} = {}): Promise<AIResponse> {
  const { maxTokens = 1000, temperature = 0.7 } = options

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()

  return {
    content: data.choices[0]?.message?.content || '',
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    } : undefined,
  }
}

// Anthropic API 调用
async function callAnthropic(messages: AIMessage[], options: {
  maxTokens?: number
  temperature?: number
} = {}): Promise<AIResponse> {
  const { maxTokens = 1000, temperature = 0.7 } = options

  // 提取系统消息
  const systemMessage = messages.find(m => m.role === 'system')?.content || ''
  const chatMessages = messages.filter(m => m.role !== 'system')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: maxTokens,
      temperature,
      system: systemMessage,
      messages: chatMessages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Anthropic API error: ${error}`)
  }

  const data = await response.json()

  return {
    content: data.content[0]?.text || '',
    usage: data.usage ? {
      promptTokens: data.usage.input_tokens,
      completionTokens: data.usage.output_tokens,
      totalTokens: data.usage.input_tokens + data.usage.output_tokens,
    } : undefined,
  }
}

// 统一的 AI 调用接口
export async function callAI(messages: AIMessage[], options: {
  maxTokens?: number
  temperature?: number
} = {}): Promise<AIResponse> {
  if (!isAIConfigured) {
    throw new Error('AI service is not configured')
  }

  if (AI_PROVIDER === 'anthropic' && ANTHROPIC_API_KEY) {
    return callAnthropic(messages, options)
  }

  return callOpenAI(messages, options)
}

// 文章摘要生成
export async function generateSummary(content: string, maxLength = 200): Promise<string> {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `你是一个专业的内容摘要助手。请用简洁的中文总结文章的主要内容，不超过${maxLength}字。`,
    },
    {
      role: 'user',
      content: `请总结以下文章：\n\n${content.slice(0, 3000)}`,
    },
  ]

  const response = await callAI(messages, { maxTokens: 500, temperature: 0.3 })
  return response.content
}

// 文章问答
export async function answerQuestion(
  question: string,
  articleContent: string,
  articleTitle: string
): Promise<string> {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `你是一个博客文章助手。基于提供的文章内容回答用户的问题。
如果问题与文章内容无关，请礼貌地告知用户。
回答要简洁、准确、有帮助。使用中文回答。`,
    },
    {
      role: 'user',
      content: `文章标题：${articleTitle}

文章内容：
${articleContent.slice(0, 4000)}

用户问题：${question}`,
    },
  ]

  const response = await callAI(messages, { maxTokens: 800, temperature: 0.5 })
  return response.content
}

// 相关问题推荐
export async function suggestQuestions(
  articleContent: string,
  articleTitle: string,
  count = 3
): Promise<string[]> {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `你是一个博客文章助手。基于文章内容，生成${count}个读者可能感兴趣的问题。
每个问题一行，不要编号，不要其他格式。`,
    },
    {
      role: 'user',
      content: `文章标题：${articleTitle}

文章内容：
${articleContent.slice(0, 2000)}

请生成${count}个相关问题：`,
    },
  ]

  const response = await callAI(messages, { maxTokens: 300, temperature: 0.7 })

  return response.content
    .split('\n')
    .map(q => q.trim())
    .filter(q => q.length > 0)
    .slice(0, count)
}

// 关键词提取
export async function extractKeywords(content: string, count = 5): Promise<string[]> {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `你是一个关键词提取助手。从文章中提取${count}个最重要的关键词或短语。
每个关键词一行，不要编号，不要其他格式。`,
    },
    {
      role: 'user',
      content: `请从以下文章中提取关键词：\n\n${content.slice(0, 2000)}`,
    },
  ]

  const response = await callAI(messages, { maxTokens: 200, temperature: 0.3 })

  return response.content
    .split('\n')
    .map(k => k.trim())
    .filter(k => k.length > 0)
    .slice(0, count)
}

// 内容改进建议
export async function suggestImprovements(content: string): Promise<string> {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `你是一个专业的内容编辑。请分析文章并提供改进建议，包括：
1. 结构优化
2. 内容补充
3. 表达改进
4. SEO 优化

请用简洁的中文列出建议。`,
    },
    {
      role: 'user',
      content: `请分析以下文章并提供改进建议：\n\n${content.slice(0, 3000)}`,
    },
  ]

  const response = await callAI(messages, { maxTokens: 800, temperature: 0.5 })
  return response.content
}
