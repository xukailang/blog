import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

export interface CreateUserData {
  email: string
  password: string
  name?: string
  role?: UserRole
}

export interface UpdateUserData {
  name?: string
  avatar?: string
  email?: string
}

export async function createUser(data: CreateUserData) {
  const passwordHash = await bcrypt.hash(data.password, 10)

  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      name: data.name,
      role: data.role || 'USER',
    },
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true,
      createdAt: true,
    },
  })
}

export async function updateUser(id: string, data: UpdateUserData) {
  return prisma.user.update({
    where: { id },
    data,
  })
}

export async function verifyUserPassword(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) return null

  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) return null

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
  }
}

export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id },
  })
}

export async function updateUserRole(id: string, role: UserRole) {
  return prisma.user.update({
    where: { id },
    data: { role },
  })
}
