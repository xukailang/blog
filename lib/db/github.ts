import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

interface GithubUserInfo {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string
}

export async function findUserByGithubId(githubId: number) {
  const bind = await prisma.githubBind.findUnique({
    where: { githubId },
    include: { user: true },
  })
  return bind?.user || null
}

export async function createUserWithGithub(githubUser: GithubUserInfo) {
  const user = await prisma.user.create({
    data: {
      email: githubUser.email,
      name: githubUser.name || githubUser.login,
      avatar: githubUser.avatar_url,
      githubBind: {
        create: {
          githubId: githubUser.id,
          username: githubUser.login,
          displayName: githubUser.name,
          email: githubUser.email,
          avatar: githubUser.avatar_url,
        },
      },
    },
    include: { githubBind: true },
  })

  return user
}

export async function bindGithubToUser(userId: string, githubUser: GithubUserInfo) {
  // Check if GitHub account is already bound to another user
  const existingBind = await prisma.githubBind.findUnique({
    where: { githubId: githubUser.id },
  })

  if (existingBind && existingBind.userId !== userId) {
    throw new Error('该 GitHub 账号已绑定其他用户')
  }

  // Check if user already has a GitHub bind
  const userBind = await prisma.githubBind.findUnique({
    where: { userId },
  })

  if (userBind) {
    // Update existing bind
    return prisma.githubBind.update({
      where: { userId },
      data: {
        githubId: githubUser.id,
        username: githubUser.login,
        displayName: githubUser.name,
        email: githubUser.email,
        avatar: githubUser.avatar_url,
      },
    })
  }

  // Create new bind
  return prisma.githubBind.create({
    data: {
      userId,
      githubId: githubUser.id,
      username: githubUser.login,
      displayName: githubUser.name,
      email: githubUser.email,
      avatar: githubUser.avatar_url,
    },
  })
}

export async function unbindGithub(userId: string) {
  const bind = await prisma.githubBind.findUnique({
    where: { userId },
  })

  if (!bind) {
    throw new Error('未绑定 GitHub 账号')
  }

  return prisma.githubBind.delete({
    where: { userId },
  })
}

export async function getGithubBindStatus(userId: string) {
  const bind = await prisma.githubBind.findUnique({
    where: { userId },
    select: {
      username: true,
      displayName: true,
      avatar: true,
      bindAt: true,
    },
  })

  return bind
}

// Generate state for OAuth flow
export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString('hex')
}

// GitHub OAuth URLs
export function getGithubAuthUrl(state: string, redirectUri: string): string {
  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) {
    throw new Error('GITHUB_CLIENT_ID is not configured')
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read:user user:email',
    state,
  })

  return `https://github.com/login/oauth/authorize?${params.toString()}`
}

// Exchange code for access token
export async function exchangeCodeForToken(code: string): Promise<string> {
  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('GitHub OAuth is not configured')
  }

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  })

  const data = await response.json()

  if (data.error) {
    throw new Error(data.error_description || data.error)
  }

  return data.access_token
}

// Get GitHub user info
export async function getGithubUser(accessToken: string): Promise<GithubUserInfo> {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch GitHub user info')
  }

  const user = await response.json()

  // Get primary email if not public
  if (!user.email) {
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (emailResponse.ok) {
      const emails = await emailResponse.json()
      const primaryEmail = emails.find((e: { primary: boolean }) => e.primary)
      user.email = primaryEmail?.email || null
    }
  }

  return {
    id: user.id,
    login: user.login,
    name: user.name,
    email: user.email,
    avatar_url: user.avatar_url,
  }
}
