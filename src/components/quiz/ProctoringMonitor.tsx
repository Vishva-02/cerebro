'use client'

import { useEffect, useRef, useState } from 'react'
import * as faceapi from '@vladmandic/face-api'
import { useProctoring } from '@/hooks/useProctoring'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, AlertTriangle } from 'lucide-react'

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'

export const ProctoringMonitor = () => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isModelLoaded, setIsModelLoaded] = useState(false)
    const [isCameraReady, setIsCameraReady] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { addViolation, focusScore } = useProctoring()
    const detectionInterval = useRef<NodeJS.Timeout | null>(null)

    // Load models
    useEffect(() => {
        const loadModels = async () => {
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                ])
                setIsModelLoaded(true)
            } catch (err) {
                console.error('Failed to load face-api models:', err)
                setError('Proctoring engine failed to initialize')
            }
        }
        loadModels()
    }, [])

    // Start Camera
    useEffect(() => {
        if (!isModelLoaded) return

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true })
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    setIsCameraReady(true)
                }
            } catch (err) {
                console.error('Camera access denied:', err)
                setError('Camera access is required for this quiz')
            }
        }
        startCamera()

        return () => {
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream
                stream.getTracks().forEach(track => track.stop())
            }
        }
    }, [isModelLoaded])

    // Detection Loop
    useEffect(() => {
        if (!isCameraReady || !isModelLoaded) return

        const detect = async () => {
            if (!videoRef.current) return

            const detections = await faceapi.detectAllFaces(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks()

            if (detections.length === 0) {
                addViolation('face_missing', 'No face detected in camera view')
            } else if (detections.length > 1) {
                addViolation('multiple_faces', `${detections.length} faces detected`)
            } else {
                // Single face detected - check for "Attention"
                const landmarks = detections[0].landmarks
                const nose = landmarks.getNose()
                const jaw = landmarks.getJawOutline()

                // Simple heuristic for "Looking away" based on nose position relative to jaw
                // (This is an approximation)
                const noseX = nose[3].x
                const jawWidth = jaw[16].x - jaw[0].x
                const jawCenter = (jaw[16].x + jaw[0].x) / 2

                const deviation = Math.abs(noseX - jawCenter) / jawWidth
                if (deviation > 0.15) {
                    addViolation('gaze_away', 'User looking away from screen')
                }
            }
        }

        detectionInterval.current = setInterval(detect, 2000) // Detect every 2 seconds

        return () => {
            if (detectionInterval.current) clearInterval(detectionInterval.current)
        }
    }, [isCameraReady, isModelLoaded, addViolation])

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
            {/* Hidden Video for processing */}
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="hidden"
            />

            <AnimatePresence>
                {focusScore < 100 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-lg ${focusScore > 80
                            ? 'bg-slate-900/80 border-primary/20 text-primary'
                            : focusScore > 50
                                ? 'bg-orange-950/80 border-orange-500/20 text-orange-400'
                                : 'bg-red-950/80 border-red-500/20 text-red-500 font-bold'
                            }`}
                    >
                        <Shield className={`w-4 h-4 ${focusScore < 50 ? 'animate-pulse' : ''}`} />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] uppercase font-bold tracking-widest opacity-70 leading-none">Focus Score</span>
                            <span className="text-lg font-black leading-none">{focusScore}%</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-xs backdrop-blur-md"
                >
                    <AlertTriangle className="w-4 h-4 inline mr-2" />
                    {error}
                </motion.div>
            )}

            {isCameraReady && !error && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">AI Monitor Active</span>
                </div>
            )}
        </div>
    )
}
