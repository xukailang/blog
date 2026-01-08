import '@/styles/globals.css'

export const metadata = {
  title: '后台管理 | CyberBlog',
  description: '博客后台管理系统',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-900 text-gray-100">
        {children}
      </body>
    </html>
  )
}
