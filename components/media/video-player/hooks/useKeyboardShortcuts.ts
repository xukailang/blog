'use client'

import { useEffect, useCallback } from 'react'
import { useVideo } from '../VideoContext'
import { SEEK_STEP, SEEK_STEP_LONG, VOLUME_STEP, PLAYBACK_RATES } from '../constants'

const SHORTCUTS = {
  TOGGLE_PLAY: [' ', 'k'],
  FULLSCREEN: ['f'],
  MUTE: ['m'],
  SEEK_BACK: ['arrowleft'],
  SEEK_FORWARD: ['arrowright'],
  SEEK_BACK_LONG: ['j'],
  SEEK_FORWARD_LONG: ['l'],
  VOLUME_UP: ['arrowup'],
  VOLUME_DOWN: ['arrowdown'],
  SPEED_DOWN: ['<', ','],
  SPEED_UP: ['>', '.'],
  PIP: ['p'],
  LOOP: ['o'],
  SCREENSHOT: ['s'],
}

export function useKeyboardShortcuts(enabled: boolean = true) {
  const { state, actions } = useVideo()

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if typing in input
    const target = e.target as HTMLElement
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
      return
    }

    const key = e.key.toLowerCase()

    // Toggle play
    if (SHORTCUTS.TOGGLE_PLAY.includes(key)) {
      e.preventDefault()
      actions.togglePlay()
      return
    }

    // Fullscreen
    if (SHORTCUTS.FULLSCREEN.includes(key)) {
      e.preventDefault()
      actions.toggleFullscreen()
      return
    }

    // Mute
    if (SHORTCUTS.MUTE.includes(key)) {
      e.preventDefault()
      actions.toggleMute()
      return
    }

    // Seek back
    if (SHORTCUTS.SEEK_BACK.includes(key)) {
      e.preventDefault()
      actions.seekRelative(-SEEK_STEP)
      return
    }

    // Seek forward
    if (SHORTCUTS.SEEK_FORWARD.includes(key)) {
      e.preventDefault()
      actions.seekRelative(SEEK_STEP)
      return
    }

    // Seek back long
    if (SHORTCUTS.SEEK_BACK_LONG.includes(key)) {
      e.preventDefault()
      actions.seekRelative(-SEEK_STEP_LONG)
      return
    }

    // Seek forward long
    if (SHORTCUTS.SEEK_FORWARD_LONG.includes(key)) {
      e.preventDefault()
      actions.seekRelative(SEEK_STEP_LONG)
      return
    }

    // Volume up
    if (SHORTCUTS.VOLUME_UP.includes(key)) {
      e.preventDefault()
      actions.setVolume(state.volume + VOLUME_STEP)
      return
    }

    // Volume down
    if (SHORTCUTS.VOLUME_DOWN.includes(key)) {
      e.preventDefault()
      actions.setVolume(state.volume - VOLUME_STEP)
      return
    }

    // Speed down
    if (SHORTCUTS.SPEED_DOWN.includes(e.key)) {
      e.preventDefault()
      const currentIndex = PLAYBACK_RATES.indexOf(state.playbackRate as typeof PLAYBACK_RATES[number])
      if (currentIndex > 0) {
        actions.setPlaybackRate(PLAYBACK_RATES[currentIndex - 1])
      }
      return
    }

    // Speed up
    if (SHORTCUTS.SPEED_UP.includes(e.key)) {
      e.preventDefault()
      const currentIndex = PLAYBACK_RATES.indexOf(state.playbackRate as typeof PLAYBACK_RATES[number])
      if (currentIndex < PLAYBACK_RATES.length - 1) {
        actions.setPlaybackRate(PLAYBACK_RATES[currentIndex + 1])
      }
      return
    }

    // PiP
    if (SHORTCUTS.PIP.includes(key)) {
      e.preventDefault()
      actions.togglePiP()
      return
    }

    // Loop
    if (SHORTCUTS.LOOP.includes(key)) {
      e.preventDefault()
      actions.toggleLoop()
      return
    }

    // Screenshot
    if (SHORTCUTS.SCREENSHOT.includes(key)) {
      e.preventDefault()
      actions.takeScreenshot()
      return
    }

    // Number keys for seeking to percentage
    if (/^[0-9]$/.test(key)) {
      e.preventDefault()
      const percent = parseInt(key) / 10
      actions.seek(state.duration * percent)
      return
    }
  }, [actions, state.volume, state.playbackRate, state.duration])

  useEffect(() => {
    if (!enabled) return

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [enabled, handleKeyDown])
}
