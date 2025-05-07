interface ProgressBarProps {
  value: number
  max: number
  color?: string
  height?: number
  showText?: boolean
}

export function ProgressBar({ value, max, color = "#10b981", height = 8, showText = false }: ProgressBarProps) {
  const percentage = Math.min(100, Math.floor((value / max) * 100))

  return (
    <div className="w-full">
      <div className="w-full bg-gray-700 rounded-full overflow-hidden" style={{ height: `${height}px` }}>
        <div
          className="h-full rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      {showText && (
        <div className="mt-1 text-xs text-gray-400">
          {value} / {max} ({percentage}%)
        </div>
      )}
    </div>
  )
}
