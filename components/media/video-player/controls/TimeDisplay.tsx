'use client'

import { useVideo } from '../VideoContext'

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00'

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function TimeDisplay() {
  const { state } = useVideo()

  return (
    <div className="flex items-center gap-1 text-xs font-mono text-gray-300 px-2">
      <span className="text-cyber-cyan">{formatTime(state.currentTime)}</span>
      <span>/</span>
      <span>{formatTime(state.duration)}</span>
    </div>
  )
}
