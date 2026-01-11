export const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const

export const VOLUME_STEP = 0.1
export const SEEK_STEP = 5 // seconds
export const SEEK_STEP_LONG = 10 // seconds

export const CONTROLS_HIDE_DELAY = 3000 // ms

export const STORAGE_KEYS = {
  VOLUME: 'cyber-video-player-volume',
  MUTED: 'cyber-video-player-muted',
  PLAYBACK_RATE: 'cyber-video-player-rate',
} as const

export const KEYBOARD_SHORTCUTS = {
  TOGGLE_PLAY: [' ', 'k'],
  FULLSCREEN: ['f'],
  MUTE: ['m'],
  SEEK_BACK: ['ArrowLeft'],
  SEEK_FORWARD: ['ArrowRight'],
  SEEK_BACK_LONG: ['j'],
  SEEK_FORWARD_LONG: ['l'],
  VOLUME_UP: ['ArrowUp'],
  VOLUME_DOWN: ['ArrowDown'],
  SPEED_DOWN: ['<', ','],
  SPEED_UP: ['>', '.'],
  PIP: ['p'],
  LOOP: ['o'],
  SCREENSHOT: ['s'],
} as const
