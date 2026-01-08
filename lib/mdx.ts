import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content/posts')
const draftsDirectory = path.join(process.cwd(), 'content/drafts')

export interface PostMeta {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  category: string
  coverImage?: string
  readingTime: number
}

export interface Post extends PostMeta {
  content: string
}

export interface PostInput {
  title: string
  date: string
  description: string
  tags: string[]
  category: string
  coverImage?: string
  content: string
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 300
  const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length
  const englishWords = content.replace(/[\u4e00-\u9fa5]/g, '').trim().split(/\s+/).filter(Boolean).length
  const totalWords = chineseChars + englishWords
  return Math.max(1, Math.ceil(totalWords / wordsPerMinute))
}

function ensureDirectory(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function generateFrontmatter(data: Omit<PostInput, 'content'>): string {
  const lines = ['---']
  lines.push(`title: ${data.title}`)
  lines.push(`date: ${data.date}`)
  lines.push(`description: ${data.description}`)
  lines.push('tags:')
  data.tags.forEach(tag => lines.push(`  - ${tag}`))
  lines.push(`category: ${data.category}`)
  if (data.coverImage) {
    lines.push(`coverImage: ${data.coverImage}`)
  }
  lines.push('---')
  return lines.join('\n')
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ============ Posts Functions ============

export function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }
  return fs.readdirSync(postsDirectory).filter(file => file.endsWith('.mdx'))
}

export function getPostBySlug(slug: string): Post | null {
  const realSlug = slug.replace(/\.mdx$/, '')
  const fullPath = path.join(postsDirectory, `${realSlug}.mdx`)

  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    slug: realSlug,
    title: data.title || 'Untitled',
    date: data.date || new Date().toISOString(),
    description: data.description || '',
    tags: data.tags || [],
    category: data.category || 'uncategorized',
    coverImage: data.coverImage,
    readingTime: calculateReadingTime(content),
    content,
  }
}

export function getAllPosts(): PostMeta[] {
  const slugs = getPostSlugs()
  const posts = slugs
    .map(slug => getPostBySlug(slug.replace(/\.mdx$/, '')))
    .filter((post): post is Post => post !== null)
    .map(({ content, ...meta }) => meta)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return posts
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPosts().filter(post => post.tags.includes(tag))
}

export function getPostsByCategory(category: string): PostMeta[] {
  return getAllPosts().filter(post => post.category === category)
}

export function getAllTags(): string[] {
  const posts = getAllPosts()
  const tags = new Set<string>()
  posts.forEach(post => post.tags.forEach(tag => tags.add(tag)))
  return Array.from(tags)
}

export function getAllCategories(): string[] {
  const posts = getAllPosts()
  const categories = new Set<string>()
  posts.forEach(post => categories.add(post.category))
  return Array.from(categories)
}

export function searchPosts(query: string): PostMeta[] {
  const lowercaseQuery = query.toLowerCase()
  return getAllPosts().filter(post =>
    post.title.toLowerCase().includes(lowercaseQuery) ||
    post.description.toLowerCase().includes(lowercaseQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}

// ============ Admin Functions ============

export function savePost(slug: string, data: PostInput): { success: boolean; slug: string } {
  ensureDirectory(postsDirectory)

  const safeSlug = slug || slugify(data.title) || `post-${Date.now()}`
  const fullPath = path.join(postsDirectory, `${safeSlug}.mdx`)

  const frontmatter = generateFrontmatter(data)
  const fileContent = `${frontmatter}\n\n${data.content}`

  fs.writeFileSync(fullPath, fileContent, 'utf8')

  return { success: true, slug: safeSlug }
}

export function updatePost(slug: string, data: PostInput): { success: boolean; slug: string } {
  const oldPath = path.join(postsDirectory, `${slug}.mdx`)

  if (!fs.existsSync(oldPath)) {
    return { success: false, slug }
  }

  const newSlug = slugify(data.title) || slug
  const newPath = path.join(postsDirectory, `${newSlug}.mdx`)

  // If slug changed, delete old file
  if (oldPath !== newPath && fs.existsSync(oldPath)) {
    fs.unlinkSync(oldPath)
  }

  const frontmatter = generateFrontmatter(data)
  const fileContent = `${frontmatter}\n\n${data.content}`

  fs.writeFileSync(newPath, fileContent, 'utf8')

  return { success: true, slug: newSlug }
}

export function deletePost(slug: string): boolean {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`)

  if (!fs.existsSync(fullPath)) {
    return false
  }

  fs.unlinkSync(fullPath)
  return true
}

// ============ Drafts Functions ============

export function getDraftSlugs(): string[] {
  if (!fs.existsSync(draftsDirectory)) {
    return []
  }
  return fs.readdirSync(draftsDirectory).filter(file => file.endsWith('.mdx'))
}

export function getDraftBySlug(slug: string): Post | null {
  const realSlug = slug.replace(/\.mdx$/, '')
  const fullPath = path.join(draftsDirectory, `${realSlug}.mdx`)

  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    slug: realSlug,
    title: data.title || 'Untitled',
    date: data.date || new Date().toISOString(),
    description: data.description || '',
    tags: data.tags || [],
    category: data.category || 'uncategorized',
    coverImage: data.coverImage,
    readingTime: calculateReadingTime(content),
    content,
  }
}

export function getAllDrafts(): PostMeta[] {
  const slugs = getDraftSlugs()
  const drafts = slugs
    .map(slug => getDraftBySlug(slug.replace(/\.mdx$/, '')))
    .filter((draft): draft is Post => draft !== null)
    .map(({ content, ...meta }) => meta)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return drafts
}

export function saveDraft(slug: string, data: PostInput): { success: boolean; slug: string } {
  ensureDirectory(draftsDirectory)

  const safeSlug = slug || slugify(data.title) || `draft-${Date.now()}`
  const fullPath = path.join(draftsDirectory, `${safeSlug}.mdx`)

  const frontmatter = generateFrontmatter(data)
  const fileContent = `${frontmatter}\n\n${data.content}`

  fs.writeFileSync(fullPath, fileContent, 'utf8')

  return { success: true, slug: safeSlug }
}

export function deleteDraft(slug: string): boolean {
  const fullPath = path.join(draftsDirectory, `${slug}.mdx`)

  if (!fs.existsSync(fullPath)) {
    return false
  }

  fs.unlinkSync(fullPath)
  return true
}

export function publishDraft(slug: string): { success: boolean; slug: string } {
  const draft = getDraftBySlug(slug)

  if (!draft) {
    return { success: false, slug }
  }

  const { content, slug: draftSlug, readingTime, ...meta } = draft
  const result = savePost(draftSlug, { ...meta, content })

  if (result.success) {
    deleteDraft(slug)
  }

  return result
}
