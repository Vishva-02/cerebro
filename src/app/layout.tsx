import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '@/app/globals.css'
import { NavBar } from '@/components/layout/NavBar'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Quiz Master',
  description: 'Premium AI-powered quiz experience',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geist.variable} ${geistMono.variable} min-h-full bg-[#0f172a] text-slate-100 antialiased`}
      >
        <div className="relative min-h-screen overflow-hidden flex flex-col">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_40%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(236,72,153,0.22),_transparent_45%)]" />
          </div>

          <NavBar />

          <main className="relative mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-10">
            {children}
          </main>

          <footer className="relative mt-12 border-t border-white/10 py-8">
            <div className="mx-auto max-w-6xl text-center text-sm text-slate-400">
              <p>
                © {new Date().getFullYear()} Quiz Master. Built with Next.js & AI.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
