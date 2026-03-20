'use client'

import { useState } from 'react'
import { Shield, Eye, Camera, Info, CheckCircle } from 'lucide-react'
import { Button } from '@/components/common/Button'

interface ProctoringConsentProps {
    onConsent: () => void
}

export const ProctoringConsent = ({ onConsent }: ProctoringConsentProps) => {
    const [hasConsented, setHasConsented] = useState(false)

    return (
        <div className="max-w-2xl mx-auto space-y-8 pt-10">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary mb-2">
                    <Shield className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-extrabold text-textMain tracking-tight">AI Proctoring Enabled</h1>
                <p className="text-lg text-slate-400">
                    To ensure the integrity of this evaluation, we use a lightweight face-detection module.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { icon: Eye, title: "Attention Tracking", desc: "Detects if you're looking at the screen." },
                    { icon: Camera, title: "Face Presence", desc: "Verifies that you're the person taking the quiz." },
                    { icon: Info, title: "Privacy First", desc: "Processing happens locally. No video is uploaded." },
                    { icon: CheckCircle, title: "Fair Play", desc: "Monitors tab switching and anomalies." }
                ].map((item, idx) => (
                    <div key={idx} className="glass-card p-6 flex gap-4">
                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-primary shrink-0">
                            <item.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-textMain text-sm">{item.title}</h3>
                            <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                <div className="flex items-start gap-4">
                    <input
                        type="checkbox"
                        id="consent-check"
                        checked={hasConsented}
                        onChange={(e) => setHasConsented(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary"
                    />
                    <label htmlFor="consent-check" className="text-sm text-slate-300 leading-relaxed cursor-pointer">
                        I understand that my camera will be used locally to verify my attention and presence. I agree to comply with the focus requirements.
                    </label>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <Button
                    onClick={onConsent}
                    disabled={!hasConsented}
                    className="w-full h-14 text-lg font-black tracking-widest uppercase italic"
                >
                    Enable Camera & Start
                    <span className="ml-2">→</span>
                </Button>
                <p className="text-xs text-slate-500 italic max-w-xs text-center sm:text-left">
                    *You must choose &quot;Allow&quot; when the browser asks for camera access.
                </p>
            </div>
        </div>
    )
}
