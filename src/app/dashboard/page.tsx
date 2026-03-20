'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { PerformanceChart } from '@/components/dashboard/PerformanceChart'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { FloatingInsights } from '@/components/dashboard/FloatingInsights'

export default function DashboardPage() {
    const [stats, setStats] = useState(null)
    const [recent, setRecent] = useState([])
    const [performance, setPerformance] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, recentRes, perfRes] = await Promise.all([
                    fetch('/api/dashboard/stats'),
                    fetch('/api/dashboard/recent'),
                    fetch('/api/dashboard/performance'),
                ])

                if (statsRes.ok) setStats(await statsRes.json())
                if (recentRes.ok) setRecent(await recentRes.json())
                if (perfRes.ok) setPerformance(await perfRes.json())
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <DashboardHeader />

            <StatsCards stats={stats} isLoading={isLoading} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <PerformanceChart data={performance} isLoading={isLoading} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <FloatingInsights />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <RecentActivity activities={recent} isLoading={isLoading} />
                    </motion.div>
                </div>

                <div className="lg:col-span-1">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="sticky top-24"
                    >
                        <QuickActions lastAttempt={recent[0] || null} />
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
