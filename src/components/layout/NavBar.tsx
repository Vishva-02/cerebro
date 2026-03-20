'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Menu, X, Home, LayoutDashboard, History, LogOut } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'


export function NavBar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Close menu when pathname changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    ...(status === 'authenticated' ? [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    { href: '/history', label: 'History', icon: History },
  ]

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

        <nav className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-2">
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
          </div>

          <div className="flex items-center gap-3 border-l border-primary/10 pl-4">
            {status === 'authenticated' ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-semibold text-textMain leading-none">{session.user?.name}</span>
                  <button
                    onClick={() => signOut()}
                    className="text-[10px] uppercase tracking-wider text-slate-500 hover:text-error transition-colors font-bold"
                  >
                    Sign Out
                  </button>
                </div>
                {session.user?.image ? (
                  <div className="relative w-8 h-8">
                    <Image
                      src={session.user.image}
                      alt="User"
                      fill
                      className="rounded-full border border-primary/20 shadow-sm shadow-primary/10 object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-primary">
                    {session.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            ) : status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-xs font-bold text-slate-400 hover:text-textMain transition-colors">
                  LOG IN
                </Link>
                <Link href="/signup" className="text-[10px] font-black bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-slate-950 transition-all uppercase tracking-tight">
                  SIGN UP
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-primary transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-primary/10 bg-surface overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-textMain'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-bold tracking-wide">{link.label}</span>
                  </Link>
                )
              })}

              {status === 'authenticated' && (
                <button
                  onClick={() => signOut()}
                  className="mt-4 flex items-center gap-4 p-4 rounded-xl text-error hover:bg-error/10 transition-all border border-transparent hover:border-error/20"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-bold tracking-wide">SIGN OUT</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
