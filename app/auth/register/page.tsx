import RegisterForm from '@/components/auth/RegisterForm'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-cyan-400">
            My Blog
          </Link>
          <h1 className="mt-4 text-xl text-white">创建账号</h1>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <RegisterForm redirectTo="/" />
        </div>
      </div>
    </div>
  )
}
