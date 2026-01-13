# CyberBlog

一个赛博朋克风格的全栈个人博客系统，基于 Next.js 14 构建。

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![Prisma](https://img.shields.io/badge/Prisma-7.2-2D3748)

## 特性

### 视觉效果
- **赛博朋克主题** - 霓虹色彩、故障效果、粒子动画
- **扫描线特效** - CRT 显示器风格的扫描线覆盖
- **打字机动画** - 标题文字打字机效果
- **霓虹边框** - 发光边框效果

### 内容管理
- **MDX 支持** - Markdown + React 组件的富文本内容
- **草稿/发布工作流** - 完整的内容创作流程
- **分类管理** - 文章分类系统
- **标签系统** - 灵活的标签管理
- **全文搜索** - 快速搜索文章内容

### 互动功能
- **评论系统** - 支持嵌套回复、访客评论
- **Giscus 集成** - 基于 GitHub Discussions 的评论
- **点赞功能** - 支持登录用户和匿名用户
- **社交分享** - 一键分享到社交平台
- **阅读进度** - 实时显示阅读进度

### Vlog 系统
- **视频管理** - 上传和管理视频内容
- **视频播放** - 内置视频播放器
- **视频评论** - 独立的视频评论系统

### 用户系统
- **用户注册/登录** - 完整的用户认证
- **JWT 认证** - 安全的 Token 认证
- **用户资料** - 个人资料管理

### 管理后台
- **文章管理** - 创建、编辑、删除、发布
- **草稿管理** - 草稿保存和发布
- **分类管理** - 分类的增删改查
- **评论审核** - 评论审核和管理
- **数据统计** - 访问量、点赞数等统计

## 技术栈

| 类别 | 技术 |
|------|------|
| **框架** | Next.js 14 (App Router) |
| **语言** | TypeScript 5.0 |
| **样式** | Tailwind CSS 3.4 |
| **动画** | Framer Motion 11 |
| **数据库** | PostgreSQL |
| **ORM** | Prisma 7.2 |
| **认证** | JWT (jose) |
| **内容** | MDX, gray-matter, marked |
| **评论** | Giscus |
| **图标** | Lucide React |

## 项目结构

```
my-blog/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── admin/        # 管理员接口
│   │   ├── auth/         # 用户认证
│   │   ├── posts/        # 文章相关
│   │   ├── likes/        # 点赞功能
│   │   └── vlogs/        # Vlog 接口
│   ├── admin/            # 管理后台页面
│   ├── auth/             # 用户认证页面
│   ├── blog/             # 博客页面
│   ├── vlogs/            # Vlog 页面
│   ├── gallery/          # 图片画廊
│   ├── about/            # 关于页面
│   └── profile/          # 用户资料
├── components/            # React 组件
│   ├── admin/            # 管理后台组件
│   ├── auth/             # 认证组件
│   ├── blog/             # 博客组件
│   ├── effects/          # 视觉特效组件
│   ├── layout/           # 布局组件
│   ├── media/            # 媒体组件
│   └── ui/               # UI 组件
├── lib/                   # 工具函数
│   ├── db/               # 数据库操作
│   ├── auth.ts           # 认证工具
│   ├── mdx.ts            # MDX 处理
│   ├── prisma.ts         # Prisma 客户端
│   └── utils.ts          # 通用工具
├── config/               # 配置文件
│   └── site.ts          # 站点配置
├── content/              # 内容文件
│   ├── posts/           # 已发布文章 (MDX)
│   └── drafts/          # 草稿文章 (MDX)
├── prisma/               # Prisma 配置
│   └── schema.prisma    # 数据库模型
├── styles/               # 全局样式
│   └── globals.css      # 全局 CSS
└── public/               # 静态资源
```

## 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 数据库
- npm 或 yarn 或 pnpm

### 安装步骤

1. **克隆项目**

```bash
git clone <your-repo-url>
cd my-blog
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**

创建 `.env` 文件：

```env
# 数据库连接 (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/myblog"

# JWT 密钥 (请使用强随机字符串)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# 管理员密码
ADMIN_PASSWORD="your-admin-password"

# 环境
NODE_ENV="development"
```

4. **初始化数据库**

```bash
# 生成 Prisma 客户端
npx prisma generate

# 推送数据库结构
npx prisma db push

# 或者使用迁移 (推荐用于生产环境)
npx prisma migrate dev --name init
```

5. **启动开发服务器**

```bash
npm run dev
```

访问 http://localhost:3000 查看博客。

## 配置说明

### 站点配置

编辑 `config/site.ts` 自定义站点信息：

```typescript
export const siteConfig = {
  name: 'CyberBlog',
  description: '一个赛博朋克风格的个人博客',
  url: 'https://your-domain.com',
  author: {
    name: 'Your Name',
    email: 'your@email.com',
    github: 'https://github.com/yourusername',
    twitter: 'https://twitter.com/yourusername',
  },
  nav: [
    { name: '首页', href: '/' },
    { name: '博客', href: '/blog' },
    { name: 'Vlog', href: '/vlogs' },
    { name: '画廊', href: '/gallery' },
    { name: '关于', href: '/about' },
  ],
  // Giscus 评论配置
  giscus: {
    repo: 'your-username/your-repo',
    repoId: 'your-repo-id',
    category: 'Announcements',
    categoryId: 'your-category-id',
  },
}
```

### Giscus 评论配置

1. 访问 [giscus.app](https://giscus.app/zh-CN) 配置你的仓库
2. 启用仓库的 Discussions 功能
3. 获取 `repoId` 和 `categoryId`
4. 更新 `config/site.ts` 中的 giscus 配置

## 内容管理

### 创建文章

文章使用 MDX 格式，存放在 `content/posts/` 目录：

```mdx
---
title: '文章标题'
date: '2024-01-01'
description: '文章描述'
tags: ['标签1', '标签2']
category: '分类名称'
image: '/images/cover.jpg'
---

# 文章内容

这里是 MDX 内容，支持 Markdown 和 React 组件。

## 代码高亮

```javascript
const hello = 'world';
console.log(hello);
```

## 支持的 Markdown 特性

- GitHub Flavored Markdown (GFM)
- 代码语法高亮
- 自动生成标题锚点
- 表格、任务列表等
```

### 草稿管理

- 草稿存放在 `content/drafts/` 目录
- 通过管理后台可以将草稿发布为正式文章
- 草稿不会在前台显示

### 管理后台

访问 `/admin/login` 登录管理后台：

| 功能 | 路径 | 描述 |
|------|------|------|
| 仪表盘 | `/admin` | 数据概览和快捷操作 |
| 文章管理 | `/admin` | 文章列表、编辑、删除 |
| 新建文章 | `/admin/new` | 创建新文章 |
| 编辑文章 | `/admin/edit/[slug]` | 编辑已有文章 |
| Vlog 管理 | `/admin/vlogs` | 视频内容管理 |
| 分类管理 | `/admin/categories` | 分类的增删改查 |
| 评论管理 | `/admin/comments` | 评论审核和管理 |

## API 接口

### 公开接口

| 方法 | 路径 | 描述 |
|------|------|------|
| `POST` | `/api/auth/register` | 用户注册 |
| `POST` | `/api/auth/login` | 用户登录 |
| `POST` | `/api/auth/logout` | 用户登出 |
| `GET` | `/api/auth/me` | 获取当前用户信息 |
| `GET` | `/api/posts/[slug]/comments` | 获取文章评论 |
| `POST` | `/api/posts/[slug]/comments` | 发表评论 |
| `POST` | `/api/posts/[slug]/views` | 记录页面访问 |
| `GET/POST` | `/api/likes` | 点赞功能 |
| `GET` | `/api/vlogs` | 获取 Vlog 列表 |
| `GET` | `/api/vlogs/[slug]` | 获取 Vlog 详情 |

### 管理接口 (需认证)

| 方法 | 路径 | 描述 |
|------|------|------|
| `POST` | `/api/admin/auth/login` | 管理员登录 |
| `POST` | `/api/admin/auth/logout` | 管理员登出 |
| `GET` | `/api/admin/auth/check` | 检查认证状态 |
| `GET/POST` | `/api/admin/posts` | 文章列表/创建 |
| `DELETE` | `/api/admin/posts/[slug]` | 删除文章 |
| `GET/POST` | `/api/admin/drafts` | 草稿列表/创建 |
| `POST` | `/api/admin/drafts/[slug]/publish` | 发布草稿 |
| `GET/POST` | `/api/admin/categories` | 分类管理 |
| `PUT/DELETE` | `/api/admin/categories/[id]` | 更新/删除分类 |
| `GET/POST` | `/api/admin/vlogs` | Vlog 管理 |
| `PUT/DELETE` | `/api/admin/vlogs/[id]` | 更新/删除 Vlog |
| `GET` | `/api/admin/comments` | 评论列表 |
| `PUT/DELETE` | `/api/admin/comments/[id]` | 审核/删除评论 |
| `GET` | `/api/admin/stats` | 数据统计 |
| `POST` | `/api/admin/upload` | 文件上传 |
| `POST` | `/api/admin/upload-video` | 视频上传 |

## 数据库模型

### 用户系统

```prisma
model User {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String
  name         String?
  avatar       String?
  role         UserRole  @default(USER)  // USER | ADMIN
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
}
```

### 内容系统

```prisma
model Category {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?
  color       String?
}

model PostMeta {
  id         String  @id @default(cuid())
  slug       String  @unique
  viewCount  Int     @default(0)
  categoryId String?
}
```

### 互动系统

```prisma
model Comment {
  id         String   @id @default(cuid())
  content    String
  postSlug   String
  userId     String?
  guestName  String?
  guestEmail String?
  parentId   String?  // 支持嵌套回复
  isApproved Boolean  @default(false)
}

model Like {
  id       String  @id @default(cuid())
  postSlug String
  userId   String?
  ipHash   String?
}
```

### Vlog 系统

```prisma
model Vlog {
  id           String   @id @default(cuid())
  title        String
  slug         String   @unique
  description  String?
  videoUrl     String
  thumbnailUrl String?
  duration     Int?
  viewCount    Int      @default(0)
  isPublished  Boolean  @default(false)
}
```

## 部署

### Vercel 部署 (推荐)

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量：
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `ADMIN_PASSWORD`
4. 部署

### Docker 部署

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### 手动部署

```bash
# 安装依赖
npm ci --only=production

# 生成 Prisma 客户端
npx prisma generate

# 构建
npm run build

# 启动
npm start
```

## 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# Prisma 相关
npx prisma generate      # 生成客户端
npx prisma db push       # 推送数据库结构
npx prisma migrate dev   # 开发环境迁移
npx prisma studio        # 打开数据库管理界面
```

## 自定义主题

### 颜色配置

编辑 `tailwind.config.ts` 自定义赛博朋克颜色：

```typescript
colors: {
  cyber: {
    cyan: '#00f0ff',    // 主色调
    pink: '#ff00ff',    // 强调色
    purple: '#bf00ff',  // 次要色
    yellow: '#ffff00',  // 警告色
    green: '#00ff00',   // 成功色
    blue: '#0080ff',    // 信息色
  }
}
```

### 字体配置

项目使用以下字体：

- **Orbitron** - 标题字体，科幻风格
- **JetBrains Mono** - 正文/代码字体，等宽字体

### 动画效果

可用的自定义动画：

- `glow` - 发光效果
- `glitch` - 故障效果
- `scanline` - 扫描线
- `flicker` - 闪烁效果
- `typing` - 打字机效果
- `float` - 浮动效果
- `pulse-neon` - 霓虹脉冲

## 常见问题

### 数据库连接失败

确保 PostgreSQL 服务正在运行，并检查 `DATABASE_URL` 格式：

```
postgresql://用户名:密码@主机:端口/数据库名
```

### 管理员登录失败

1. 确保 `.env` 中设置了 `ADMIN_PASSWORD`
2. 重启开发服务器使环境变量生效

### 图片无法显示

检查 `next.config.mjs` 中的图片域名配置：

```javascript
images: {
  domains: ['images.unsplash.com', 'your-domain.com'],
}
```

### Giscus 评论不显示

1. 确保仓库是公开的
2. 启用了 Discussions 功能
3. 正确配置了 `repoId` 和 `categoryId`

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 致谢

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [Framer Motion](https://www.framer.com/motion/)
- [Giscus](https://giscus.app/)

   需要新增的功能文档

     1. AI 智能助手功能

     - 支持 OpenAI (GPT-4, GPT-3.5) 和 Anthropic (Claude)
     - 文章摘要自动生成
     - 智能问答功能
     - 相关问题推荐
     - 关键词自动提取
     - 内容改进建议

     2. 文章版本控制系统

     - 自动保存历史版本
     - 版本对比 (diff)
     - 版本回滚功能
     - 变更说明记录

     3. 文章导出功能

     - 导出为 Markdown 格式
     - 导出为纯文本格式
     - 导出为 HTML 格式

     4. Web Push 推送通知

     - 浏览器推送通知
     - 通知偏好设置
     - VAPID 密钥配置

     5. 国际化 (i18n) 支持

     - 中文/英文切换
     - 自动检测浏览器语言
     - Cookie 语言偏好存储

     6. 增强的编辑器功能

     - 自动保存草稿
     - Emoji 选择器
     - 自动补全
     - 定时发布

     7. 用户互动增强

     - 文章高亮标注
     - 书签功能
     - 阅读历史记录
     - 收藏功能
     - 评论表情反应
     - 评论举报系统

     8. 成就系统

     - 多种成就类别 (阅读、评论、社交、探索、特殊)
     - 成就等级 (铜、银、金、白金、钻石)
     - 用户统计数据

     9. 系列文章功能

     - 文章系列管理
     - 系列导航组件

     10. 新闻订阅系统

     - 邮件订阅
     - 订阅验证
     - 退订功能

     11. 第三方登录

     - 微信登录集成
     - GitHub 登录集成

     12. 增强的视频播放器

     - 赛博朋克风格播放器
     - 画中画模式
     - 截图功能
     - 循环播放
     - 速度控制
     - 迷你播放器

     13. 搜索功能增强

     - Meilisearch 全文搜索
     - 搜索索引同步脚本

     14. 其他新功能

     - 阅读模式切换
     - 无限滚动加载
     - PWA 安装提示
     - 背景音乐播放器
     - 标签云
     - 时间线视图
     - 热门文章推荐
     - 相关文章推荐
     - SEO JSON-LD 结构化数据
     - 速率限制
     - Redis 缓存支持

     实施计划

     步骤 1: 更新项目概述

     - 更新特性列表，添加所有新功能
     - 更新技术栈表格

     步骤 2: 更新项目结构

     - 添加新增的目录和文件说明
     - 更新组件结构说明

     步骤 3: 更新环境变量配置

     添加新的环境变量：
     # AI 服务配置
     AI_PROVIDER="openai"  # openai 或 anthropic
     OPENAI_API_KEY="your-openai-api-key"
     OPENAI_BASE_URL="https://api.openai.com/v1"
     OPENAI_MODEL="gpt-3.5-turbo"
     ANTHROPIC_API_KEY="your-anthropic-api-key"
     ANTHROPIC_MODEL="claude-3-haiku-20240307"

     # Web Push 配置
     VAPID_PUBLIC_KEY="your-vapid-public-key"
     VAPID_PRIVATE_KEY="your-vapid-private-key"

     # 微信开放平台配置
     WECHAT_APP_ID="your-wechat-app-id"
     WECHAT_APP_SECRET="your-wechat-app-secret"

     # GitHub OAuth 配置
     GITHUB_CLIENT_ID="your-github-client-id"
     GITHUB_CLIENT_SECRET="your-github-client-secret"

     # Meilisearch 配置
     MEILISEARCH_HOST="http://localhost:7700"
     MEILISEARCH_API_KEY="your-meilisearch-api-key"

     # Redis 配置 (可选)
     REDIS_URL="redis://localhost:6379"

     步骤 4: 添加新功能文档章节

     - AI 智能助手配置和使用
     - 版本控制系统说明
     - 推送通知配置
     - 国际化配置
     - 第三方登录配置
     - 搜索功能配置

     步骤 5: 更新 API 接口文档

     添加新的 API 端点：
     - /api/admin/posts/[slug]/versions - 版本管理
     - /api/posts/[slug]/export - 文章导出
     - /api/ai/summary - AI 摘要
     - /api/ai/question - AI 问答
     - /api/push/subscribe - 推送订阅
     - /api/highlights - 高亮标注
     - /api/bookmarks - 书签管理
     - /api/series - 系列文章
     - /api/newsletter - 新闻订阅

     步骤 6: 更新数据库模型文档

     添加新模型说明：
     - PostVersion (版本控制)
     - Highlight (高亮标注)
     - Bookmark (书签)
     - AutoSaveDraft (自动保存)
     - PushSubscription (推送订阅)
     - NotificationPreference (通知偏好)
     - Achievement (成就)
     - UserAchievement (用户成就)
     - UserStats (用户统计)
     - Series (系列)
     - SeriesPost (系列文章)
     - Subscriber (订阅者)
     - CommentReaction (评论反应)
     - CommentReport (评论举报)
     - GithubBind (GitHub 绑定)

     步骤 7: 添加高级配置章节

     - AI 服务配置详解
     - 推送通知配置详解
     - 搜索服务配置详解
     - 缓存配置详解

     步骤 8: 更新部署文档

     - 添加 Meilisearch 部署说明
     - 添加 Redis 部署说明 (可选)
     - 更新 Docker 配置

     关键文件路径

     新增功能相关文件

     - lib/ai/ai-service.ts - AI 服务
     - lib/versions/version-service.ts - 版本控制
     - lib/versions/diff-utils.ts - 差异对比
     - lib/export/exporter.ts - 导出功能
     - lib/push/web-push.ts - 推送通知
     - lib/push/notification-preference.ts - 通知偏好
     - lib/i18n/config.ts - 国际化配置
     - lib/search/search.ts - 搜索功能
     - lib/meilisearch.ts - Meilisearch 客户端
     - lib/redis.ts - Redis 客户端
     - lib/rate-limit.ts - 速率限制
     - lib/seo.ts - SEO 工具
     - lib/wechat.ts - 微信集成
     - lib/db/github.ts - GitHub 集成
     - lib/db/highlights.ts - 高亮功能
     - lib/db/series.ts - 系列文章
     - lib/db/favorites.ts - 收藏功能
     - lib/db/reading-history.ts - 阅读历史
     - lib/db/newsletter.ts - 新闻订阅
     - lib/db/scheduled-posts.ts - 定时发布
     - lib/editor/emoji-data.ts - Emoji 数据

     新增组件

     - components/blog/AIAssistant.tsx - AI 助手
     - components/blog/HighlightManager.tsx - 高亮管理
     - components/blog/ExportButton.tsx - 导出按钮
     - components/blog/SeriesNav.tsx - 系列导航
     - components/blog/FavoriteButton.tsx - 收藏按钮
     - components/blog/RelatedPosts.tsx - 相关文章
     - components/blog/PopularPosts.tsx - 热门文章
     - components/blog/TagCloud.tsx - 标签云
     - components/blog/Timeline.tsx - 时间线
     - components/blog/ReadingModeToggle.tsx - 阅读模式
     - components/blog/InfiniteScrollLoader.tsx - 无限滚动
     - components/blog/EnhancedComments.tsx - 增强评论
     - components/admin/SchedulePublish.tsx - 定时发布
     - components/admin/EnhancedEditor.tsx - 增强编辑器
     - components/admin/versions/VersionHistory.tsx - 版本历史
     - components/admin/versions/VersionDiff.tsx - 版本对比
     - components/admin/editor/EmojiPicker.tsx - Emoji 选择器
     - components/admin/editor/AutoSaveIndicator.tsx - 自动保存指示器
     - components/admin/editor/AutoComplete.tsx - 自动补全
     - components/auth/WechatLoginModal.tsx - 微信登录
     - components/auth/WechatBindCard.tsx - 微信绑定
     - components/auth/GithubLoginButton.tsx - GitHub 登录
     - components/i18n/LanguageSwitcher.tsx - 语言切换
     - components/notifications/NotificationBell.tsx - 通知铃
     - components/notifications/NotificationPreferences.tsx - 通知偏好
     - components/newsletter/NewsletterForm.tsx - 订阅表单
     - components/pwa/PWAInstallPrompt.tsx - PWA 安装
     - components/search/SearchModal.tsx - 搜索模态框
     - components/seo/JsonLd.tsx - SEO 结构化数据
     - components/media/CyberVideoPlayer.tsx - 赛博视频播放器
     - components/media/BGMPlayer.tsx - 背景音乐
     - components/media/video-player/* - 视频播放器组件