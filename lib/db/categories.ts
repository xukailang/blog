import { prisma } from '@/lib/prisma'

export interface CreateCategoryData {
  name: string
  description?: string
  color?: string
}

export interface UpdateCategoryData {
  name?: string
  description?: string
  color?: string
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\u4e00-\u9fa5]/g, (char) => {
      // Keep Chinese characters as-is for now, or use pinyin lib
      return char
    })
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function createCategory(data: CreateCategoryData) {
  const slug = generateSlug(data.name)

  return prisma.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      color: data.color,
    },
  })
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { postMeta: true },
      },
    },
  })
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
  })
}

export async function getCategoryByName(name: string) {
  return prisma.category.findUnique({
    where: { name },
  })
}

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { postMeta: true },
      },
    },
  })
}

export async function updateCategory(id: string, data: UpdateCategoryData) {
  const updateData: UpdateCategoryData & { slug?: string } = { ...data }

  if (data.name) {
    updateData.slug = generateSlug(data.name)
  }

  return prisma.category.update({
    where: { id },
    data: updateData,
  })
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({
    where: { id },
  })
}

export async function getOrCreateCategory(name: string) {
  const existing = await getCategoryByName(name)
  if (existing) return existing

  return createCategory({ name })
}
