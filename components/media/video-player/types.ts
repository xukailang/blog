export interface VideoPlayerProps {
  src: string
  poster?: string
  title?: string
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  className?: string
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onTimeUpdate?: (currentTime: number) => void
}

export interface VideoState {
  isPlaying: boolean
  isPaused: boolean
  isEnded: boolean
  isLoading: boolean
  isBuffering: boolean
  currentTime: number
  duration: number
  buffered: TimeRanges | null
  volume: number
  isMuted: boolean
  playbackRate: number
  isFullscreen: boolean
  isPiP: boolean
  isLoop: boolean
  showControls: boolean
}

export interface VideoActions {
  play: () => void
  pause: () => void
  togglePlay: () => void
  seek: (time: number) => void
  seekRelative: (delta: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  setPlaybackRate: (rate: number) => void
  toggleLoop: () => void
  toggleFullscreen: () => void
  togglePiP: () => void
  takeScreenshot: () => void
  showToast: (message: string) => void
}

export interface VideoContextType {
  state: VideoState
  actions: VideoActions
  videoRef: React.RefObject<HTMLVideoElement>
  containerRef: React.RefObject<HTMLDivElement>
}

export interface ToastMessage {
  id: string
  message: string
}
