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
    <header className="sticky top-0 z-40 w-full border-b border-primary/10 bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <span className="text-xl font-bold text-slate-900">C</span>
            </div>
            <span className="text-lg font-bold tracking-widest text-textMain transition-colors group-hover:text-primary">
              CEREBRO
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link key={link.href} href={link.href} className="group relative">
                <span
                  className={`relative rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-textMain'
                    }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="active-nav"
                      className="absolute inset-x-0 -bottom-[21px] h-[2px] bg-primary"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
