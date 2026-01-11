'use client'

import { useState, useEffect } from 'react'

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches)

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReducedMotion
}

// Helper to get animation props based on user preference
export function getAnimationProps(prefersReducedMotion: boolean) {
  if (prefersReducedMotion) {
    return {
      initial: false,
      animate: false,
      exit: false,
      transition: { duration: 0 },
    }
  }

  return {}
}

// Framer Motion variants that respect reduced motion
export const reducedMotionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export const fullMotionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function getMotionVariants(prefersReducedMotion: boolean) {
  return prefersReducedMotion ? reducedMotionVariants : fullMotionVariants
}
