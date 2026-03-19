'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/history', label: 'History' },
]

export function NavBar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-pink-500 shadow-lg shadow-pink-500/30">
            <span className="text-lg font-bold text-white">Q</span>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-white">Quiz Master</p>
            <p className="text-xs text-slate-200/80">AI-powered learning studio</p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link key={link.href} href={link.href} className="relative">
                <motion.span
                  initial={false}
                  animate={{
                    color: isActive ? 'rgb(240 249 255)' : 'rgb(226 232 240)',
                  }}
                  className="relative rounded-md px-3 py-2 text-sm font-medium"
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="active-nav"
                      className="absolute inset-0 rounded-md bg-white/10"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </motion.span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
