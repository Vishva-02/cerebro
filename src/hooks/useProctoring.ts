'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useQuizStore } from '@/store/quizStore'
import { ProctoringViolation } from '@/types'

export const useProctoring = (isEnabled: boolean = true) => {
    const { session, updateProctoring } = useQuizStore()
    const violationRef = useRef<number>(0)
    const lastViolationTime = useRef<number>(0)

    const addViolation = useCallback((type: ProctoringViolation['type'], details?: string) => {
        if (!session || session.isCompleted) return

        const now = new Date()
        // Rate limit violations of the same type (e.g., face missing) to every 3 seconds
        if (Date.now() - lastViolationTime.current < 3000 && type === 'face_missing') return

        lastViolationTime.current = Date.now()
        violationRef.current += 1

        const newViolation: ProctoringViolation = {
            type,
            timestamp: now,
            details,
        }

        // Calculate new focus score
        // Tab switches are heavy penalties, gaze away is medium
        const penaltyMap: Record<string, number> = {
            tab_switch: 15,
            face_missing: 10,
            multiple_faces: 20,
            gaze_away: 5,
            fast_answer: 5,
        }

        const currentProctoring = session.proctoring || {
            focusScore: 100,
            violations: [],
            tabSwitches: 0,
            faceMissingSeconds: 0,
            multipleFacesDetected: false,
        }

        const penalty = penaltyMap[type] || 5
        const newScore = Math.max(0, currentProctoring.focusScore - penalty)

        updateProctoring({
            focusScore: newScore,
            violations: [...currentProctoring.violations, newViolation],
            tabSwitches: type === 'tab_switch' ? currentProctoring.tabSwitches + 1 : currentProctoring.tabSwitches,
            multipleFacesDetected: type === 'multiple_faces' ? true : currentProctoring.multipleFacesDetected,
        })
    }, [session, updateProctoring])

    // 1. Tab Switching & Window Focus
    useEffect(() => {
        if (!isEnabled || !session || session.isCompleted) return

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                addViolation('tab_switch', 'User switched tab or minimized window')
            }
        }

        const handleBlur = () => {
            addViolation('tab_switch', 'Window lost focus')
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('blur', handleBlur)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('blur', handleBlur)
        }
    }, [isEnabled, session, addViolation])

    // 2. Face Detection Logic (Placeholder for Library integration)
    // To implement actual face detection, we'd use face-api.js here
    useEffect(() => {
        if (!isEnabled || !session || session.isCompleted) return

        // In a real implementation, we would start a requestAnimationFrame loop here
        // checking for faces via a hidden <video> element.
    }, [isEnabled, session])

    return {
        addViolation,
        focusScore: session?.proctoring?.focusScore ?? 100,
    }
}
