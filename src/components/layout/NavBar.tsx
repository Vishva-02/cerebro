'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'


export function NavBar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()

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

        <nav className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            {[
              { href: '/', label: 'Home' },
              ...(status === 'authenticated' ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
              { href: '/history', label: 'History' },
            ].map((link) => {
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
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
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
          </div>
        </nav>
      </div>
    </header>
  )
}
