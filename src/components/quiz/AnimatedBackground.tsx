'use client'

import { motion } from 'framer-motion'

const floatyBlobs = [
  {
    className: 'w-72 h-72 bg-indigo-500/20 blur-3xl',
    top: '10%',
    left: '5%',
    animate: { x: [0, 40, 0], y: [0, -18, 0] },
  },
  {
    className: 'w-80 h-80 bg-fuchsia-500/18 blur-3xl',
    top: '0%',
    left: '55%',
    animate: { x: [0, -35, 0], y: [0, 22, 0] },
  },
  {
    className: 'w-96 h-96 bg-purple-500/15 blur-3xl',
    top: '55%',
    left: '20%',
    animate: { x: [0, 28, 0], y: [0, -30, 0] },
  },
  {
    className: 'w-64 h-64 bg-cyan-500/12 blur-3xl',
    top: '35%',
    left: '75%',
    animate: { x: [0, -26, 0], y: [0, 18, 0] },
  },
]

const particles = [
  { top: '20%', left: '15%', size: 10, delay: 0.0 },
  { top: '35%', left: '30%', size: 6, delay: 0.3 },
  { top: '55%', left: '18%', size: 8, delay: 0.6 },
  { top: '60%', left: '45%', size: 7, delay: 0.9 },
  { top: '25%', left: '65%', size: 9, delay: 0.2 },
  { top: '42%', left: '78%', size: 6, delay: 0.8 },
  { top: '72%', left: '70%', size: 8, delay: 0.5 },
  { top: '52%', left: '58%', size: 5, delay: 0.7 },
]

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* soft mesh */}
      <div className="absolute inset-0 opacity-70 [background:radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.25),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.22),transparent_50%),radial-gradient(circle_at_50%_80%,rgba(168,85,247,0.18),transparent_55%)]" />

      {/* blobs */}
      {floatyBlobs.map((b, idx) => (
        <motion.div
          key={idx}
          className={`absolute ${b.className}`}
          style={{ top: b.top, left: b.left }}
          animate={b.animate}
          transition={{
            duration: 14 + idx * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* tiny floating particles */}
      {particles.map((p, idx) => (
        <motion.span
          key={idx}
          className="absolute rounded-full bg-white/25 blur-[0.5px]"
          style={{ top: p.top, left: p.left, width: p.size, height: p.size }}
          animate={{ opacity: [0.15, 0.55, 0.15], y: [0, -10, 0] }}
          transition={{ duration: 4 + (idx % 3), delay: p.delay, repeat: Infinity }}
        />
      ))}
    </div>
  )
}

