interface ProgressBarProps {
  progress: number // 0-100
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
}) => {
  return (
    <div className={`w-full bg-slate-200 rounded-full h-2 ${className}`}>
      <div
        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  )
}
