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
  title: 'CEREBRO',
  description: 'AI-Powered Quiz Platform',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geist.variable} ${geistMono.variable} min-h-full antialiased`}>
        <div className="relative flex min-h-screen flex-col">
          <NavBar />
          <main className="relative flex w-full flex-grow flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
            {children}
          </main>
          <footer className="relative mt-auto border-t border-primary/10 py-10">
            <div className="mx-auto text-center text-sm text-slate-500">
              <p>© {new Date().getFullYear()} CEREBRO. Push yourself.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
