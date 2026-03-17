import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '@/app/globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'AI Quiz App',
  description: 'Generate and take AI-powered quizzes on any topic',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body
        className={`${geist.variable} ${geistMono.variable} bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 antialiased`}
      >
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Quiz Master
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                AI-powered quiz generation and learning
              </p>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-slate-200 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-slate-600">
              <p>&copy; 2026 Quiz Master. Built with Next.js & AI.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
