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
