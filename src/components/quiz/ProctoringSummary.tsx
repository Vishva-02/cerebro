'use client'

import { Shield, AlertCircle, ExternalLink, UserCheck, Timer, Zap } from 'lucide-react'
import { ProctoringData } from '@/types'

interface ProctoringSummaryProps {
    data?: ProctoringData
}

export const ProctoringSummary = ({ data }: ProctoringSummaryProps) => {
    if (!data) return null

    const { focusScore, violations, tabSwitches } = data

    const getScoreColor = () => {
        if (focusScore >= 90) return 'text-success'
        if (focusScore >= 70) return 'text-warning'
        return 'text-error'
    }

    const getStatusLabel = () => {
        if (focusScore >= 90) return 'High Reliability'
        if (focusScore >= 70) return 'Moderate Reliability'
        return 'Low Reliability'
    }

    return (
        <div className="glass-card p-8 space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-700/50">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-primary">
                        <Shield className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-textMain tracking-tight text-center sm:text-left">Focus & Integrity Report</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-sm font-bold uppercase tracking-widest ${getScoreColor()}`}>
                                {getStatusLabel()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="text-center md:text-right shrink-0">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Final Focus Score</span>
                    <span className={`text-5xl font-black ${getScoreColor()}`}>
                        {focusScore}%
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50 flex items-center gap-3">
                    <Timer className="w-5 h-5 text-slate-400" />
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Attention Spans</p>
                        <p className="text-lg font-bold text-slate-200">High</p>
                    </div>
                </div>
                <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50 flex items-center gap-3">
                    <ExternalLink className="w-5 h-5 text-slate-400" />
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Tab Switches</p>
                        <p className="text-lg font-bold text-slate-200">{tabSwitches}</p>
                    </div>
                </div>
                <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50 flex items-center gap-3">
                    <Zap className="w-5 h-5 text-slate-400" />
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Anomalies</p>
                        <p className="text-lg font-bold text-slate-200">{violations.length}</p>
                    </div>
                </div>
            </div>

            {violations.length > 0 && (
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-warning" />
                        Detected Events
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {violations.map((v, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                                <div className="flex items-center gap-3">
                                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
                                        {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                    <span className="text-slate-200 font-semibold">{v.type.replace('_', ' ')}</span>
                                </div>
                                <span className="text-slate-500 italic max-w-xs truncate">{v.details}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                    <UserCheck className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed italic">
                    AI proctoring monitored your session to ensure a level playing field. Registered users with consistently high focus scores earn special badges on their profile.
                </p>
            </div>
        </div>
    )
}
