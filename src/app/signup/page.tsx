'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/common/Button'
import { signIn } from 'next-auth/react'

export default function SignupPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            })

            if (res.ok) {
                // Auto login after signup
                await signIn('credentials', {
                    email,
                    password,
                    callbackUrl: '/',
                })
            } else {
                const data = await res.text()
                setError(data || 'Signup failed')
            }
        } catch (err) {
            setError('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card w-full max-w-md p-8 md:p-10"
            >
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black tracking-tight text-textMain">Join CEREBRO</h1>
                    <p className="mt-2 text-sm text-slate-400">Start your smart learning engine today</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary">Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-textMain outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                            placeholder="Mikael DaVinci"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-textMain outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                            placeholder="mikael@example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-textMain outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                            placeholder="••••••••"
                        />
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="rounded-lg bg-error/10 p-3 text-center text-xs font-bold text-error border border-error/20"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Button type="submit" className="w-full btn-primary py-4" disabled={isLoading}>
                        {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                    </Button>
                </form>

                <div className="relative my-8 text-center">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-700"></div>
                    </div>
                    <span className="relative bg-surface px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Or join with</span>
                </div>

                <button
                    onClick={() => signIn('google', { callbackUrl: '/' })}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-primary/20 bg-slate-800 px-4 py-3.5 text-sm font-bold text-textMain transition-all hover:bg-slate-700 hover:border-primary/40 shadow-sm"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Continue with Google
                </button>

                <p className="mt-8 text-center text-sm text-slate-400">
                    Already have an account?&nbsp;
                    <Link href="/login" className="font-bold text-primary hover:underline">
                        Log in here
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}
