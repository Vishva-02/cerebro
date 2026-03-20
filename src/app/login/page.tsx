'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/common/Button'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError('Invalid email or password')
            } else {
                router.push('/')
                router.refresh()
            }
        } catch (err) {
            setError('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = () => {
        signIn('google', { callbackUrl: '/' })
    }

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card w-full max-w-md p-8 md:p-10"
            >
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black tracking-tight text-textMain">Welcome Back</h1>
                    <p className="mt-2 text-sm text-slate-400">Log in to CEREBRO to continue your journey</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
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
                        {isLoading ? 'LOGGING IN...' : 'LOG IN'}
                    </Button>
                </form>

                <div className="relative my-8 text-center">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-700"></div>
                    </div>
                    <span className="relative bg-surface px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Or continue with</span>
                </div>

                <button
                    onClick={handleGoogleLogin}
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
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Continue with Google
                </button>

                <p className="mt-8 text-center text-sm text-slate-400">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="font-bold text-primary hover:underline">
                        Sign up for free
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}
