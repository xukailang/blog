// 微信开放平台 OAuth 工具库

// 微信配置
export const wechatConfig = {
  appId: process.env.WECHAT_APP_ID || '',
  appSecret: process.env.WECHAT_APP_SECRET || '',

  // 微信 OAuth 端点
  endpoints: {
    authorize: 'https://open.weixin.qq.com/connect/qrconnect',
    accessToken: 'https://api.weixin.qq.com/sns/oauth2/access_token',
    userInfo: 'https://api.weixin.qq.com/sns/userinfo',
    refreshToken: 'https://api.weixin.qq.com/sns/oauth2/refresh_token',
  },

  // 状态过期时间（5分钟）
  stateExpireSeconds: 300,
}

// 类型定义
export interface WechatAccessTokenResponse {
  access_token: string
  expires_in: number
  refresh_token: string
  openid: string
  scope: string
  unionid?: string
  errcode?: number
  errmsg?: string
}

export interface WechatUserInfo {
  openid: string
  nickname: string
  sex: number
  province: string
  city: string
  country: string
  headimgurl: string
  privilege: string[]
  unionid?: string
  errcode?: number
  errmsg?: string
}

export interface QRCodeResponse {
  state: string
  qrcodeUrl: string
  expiresAt: string
}

export interface PollResponse {
  status: 'pending' | 'scanned' | 'confirmed' | 'expired' | 'error'
  message?: string
  token?: string
  needBind?: boolean
  wechatInfo?: {
    nickname: string
    avatar: string
    openId: string
  }
}

/**
 * 生成随机 state（用于防止 CSRF 攻击）
 */
export function generateState(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * 生成微信授权 URL
 */
export function generateAuthUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    appid: wechatConfig.appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'snsapi_login',
    state: state,
  })

  return `${wechatConfig.endpoints.authorize}?${params.toString()}#wechat_redirect`
}

/**
 * 通过 code 获取 access_token
 */
export async function getAccessToken(code: string): Promise<WechatAccessTokenResponse> {
  const params = new URLSearchParams({
    appid: wechatConfig.appId,
    secret: wechatConfig.appSecret,
    code: code,
    grant_type: 'authorization_code',
  })

  const response = await fetch(
    `${wechatConfig.endpoints.accessToken}?${params.toString()}`
  )

  const data = await response.json()

  if (data.errcode) {
    throw new Error(`微信授权失败: ${data.errcode} - ${data.errmsg}`)
  }

  return data
}

/**
 * 获取微信用户信息
 */
export async function getUserInfo(
  accessToken: string,
  openId: string
): Promise<WechatUserInfo> {
  const params = new URLSearchParams({
    access_token: accessToken,
    openid: openId,
    lang: 'zh_CN',
  })

  const response = await fetch(
    `${wechatConfig.endpoints.userInfo}?${params.toString()}`
  )

  const data = await response.json()

  if (data.errcode) {
    throw new Error(`获取用户信息失败: ${data.errcode} - ${data.errmsg}`)
  }

  return data
}

/**
 * 刷新 access_token
 */
export async function refreshAccessToken(refreshToken: string): Promise<WechatAccessTokenResponse> {
  const params = new URLSearchParams({
    appid: wechatConfig.appId,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })

  const response = await fetch(
    `${wechatConfig.endpoints.refreshToken}?${params.toString()}`
  )

  const data = await response.json()

  if (data.errcode) {
    throw new Error(`刷新 token 失败: ${data.errcode} - ${data.errmsg}`)
  }

  return data
}
